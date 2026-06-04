FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

# Listen on all interfaces so the port is reachable outside the container
ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["npm", "run", "dev"]
