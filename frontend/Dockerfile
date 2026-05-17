# Stage 1 — build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-engines
COPY . .
RUN yarn build

# Stage 2 — production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.output ./output
EXPOSE 3000
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
CMD ["node", "output/server/index.mjs"]
