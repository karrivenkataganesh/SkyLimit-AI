# Multi-stage production Dockerfile for containerized deployment (Cloud Run, Railway, Render, Fly.io, AWS ECS, DigitalOcean)
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* bun.lock* ./
RUN npm install

# Copy source files and build frontend bundle
COPY . .
RUN npm run build

# Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only
COPY package.json package-lock.json* bun.lock* ./
RUN npm install --omit=dev

# Copy build artifacts and necessary runtime code
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/java-core ./java-core
COPY --from=builder /app/python_curriculum ./python_curriculum
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose container port
EXPOSE 8080

# Start server using Node 22 native TypeScript runtime
CMD ["node", "server.ts"]
