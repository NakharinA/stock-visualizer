# Phase 8 — Docker + Deployment

## Goal
Containerize backend and frontend for both local dev (hot reload) and production (optimized builds). Orchestrate with docker-compose.

## Depends On
All previous phases must be complete and working locally.

---

## 1. `backend/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install UV
RUN pip install uv

# Copy project files
COPY pyproject.toml .
COPY .env .

# Create venv and install dependencies
RUN uv venv .venv
RUN uv sync

# Copy source
COPY . .

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 2. `frontend/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.output ./output

EXPOSE 3000

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

CMD ["node", "output/server/index.mjs"]
```

---

## 3. `docker-compose.yml` (Production)

```yaml
version: "3.9"

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - CORS_ORIGINS=http://localhost:3000
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NUXT_PUBLIC_API_BASE=http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped
```

---

## 4. `docker-compose.dev.yml` (Development — Hot Reload)

```yaml
version: "3.9"

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    volumes:
      - ./backend:/app          # mount source for hot reload
    ports:
      - "8000:8000"
    environment:
      - CORS_ORIGINS=http://localhost:3000
    command: uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - ./frontend:/app
      - /app/node_modules       # prevent host node_modules override
    ports:
      - "3000:3000"
    environment:
      - NUXT_PUBLIC_API_BASE=http://backend:8000
    depends_on:
      - backend
    command: sh -c "npm install && npm run dev"
```

---

## 5. `.dockerignore` for Backend

Create `backend/.dockerignore`:
```
.venv
__pycache__
*.pyc
*.pyo
.env.local
```

---

## 6. `.dockerignore` for Frontend

Create `frontend/.dockerignore`:
```
node_modules
.nuxt
.output
.env.local
```

---

## 7. Run Commands

### Production
```bash
# Build and start everything
docker-compose up --build

# Detached
docker-compose up --build -d

# Stop
docker-compose down
```

### Development (hot reload)
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Without Docker (local dev)
```bash
# Terminal 1 — Backend
cd backend && uv run uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## 8. Environment Variable Summary

| Variable | Where | Default | Description |
|----------|-------|---------|-------------|
| `CORS_ORIGINS` | backend `.env` | `http://localhost:3000` | Comma-separated allowed origins |
| `NUXT_PUBLIC_API_BASE` | frontend `.env` | `http://localhost:8000` | Backend URL seen by the browser |

**Important:** In docker-compose production, the frontend container calls the backend via the internal Docker network name (`http://backend:8000`). The browser still uses the host-exposed port (`http://localhost:8000`) unless you put a reverse proxy in front. For a real production deployment behind a domain, add an nginx service and set `NUXT_PUBLIC_API_BASE` to your public API domain.

---

## 9. Optional: nginx Reverse Proxy (Production)

Add to `docker-compose.yml` if serving both under one domain:

```yaml
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - backend
      - frontend
```

`nginx.conf`:
```nginx
server {
    listen 80;

    location /api/ {
        proxy_pass http://backend:8000/;
    }

    location / {
        proxy_pass http://frontend:3000;
    }
}
```

---

## Acceptance Criteria
- [ ] `docker-compose up --build` starts both services with no errors
- [ ] `http://localhost:3000` loads the chart app
- [ ] `http://localhost:8000/health` returns `{"status": "ok"}`
- [ ] `docker-compose -f docker-compose.dev.yml up` enables hot reload on both backend and frontend
- [ ] Frontend can reach the backend through the Docker network
