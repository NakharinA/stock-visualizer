## Phase 8 — Docker + Deployment

### Depends On: All phases complete and working locally

### backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN pip install uv
COPY pyproject.toml .env ./
RUN uv venv .venv && uv sync
COPY . .
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

### backend/.dockerignore
.venv, __pycache__, *.pyc, *.pyo, .env.local

### frontend/Dockerfile (multi-stage)
Stage 1 - builder:
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package.json yarn.lock ./
  RUN yarn install --frozen-lockfile
  COPY . .
  RUN yarn build
Stage 2 - prod:
  FROM node:20-alpine
  WORKDIR /app
  COPY --from=builder /app/.output ./output
  EXPOSE 3000
  ENV NUXT_HOST=0.0.0.0
  ENV NUXT_PORT=3000
  CMD ["node", "output/server/index.mjs"]

### frontend/.dockerignore
node_modules, .nuxt, .output, .env.local

### docker-compose.yml (production)
services:
  backend: build ./backend, ports 8000:8000, CORS_ORIGINS=http://localhost:3000
  frontend: build ./frontend, ports 3000:3000, NUXT_PUBLIC_API_BASE=http://backend:8000
            depends_on: backend

NOTE: NUXT_PUBLIC_API_BASE uses Docker internal network name "backend"

### docker-compose.dev.yml (development — hot reload)
services:
  backend: same build, volumes ./backend:/app, command: uvicorn ... --reload
  frontend: image node:20-alpine, volumes ./frontend:/app + /app/node_modules,
            command: sh -c "yarn install && yarn dev"

### Run Commands
Production:  docker-compose up --build [-d]
Development: docker-compose -f docker-compose.dev.yml up --build
Local (no Docker):
  Terminal 1: cd backend && uv run uvicorn main:app --reload --port 8000
  Terminal 2: cd frontend && yarn dev

### Acceptance
docker-compose up --build → both services start
http://localhost:3000 shows chart
http://localhost:8000/health → {"status": "ok"}