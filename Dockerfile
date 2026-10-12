# Production Container for Airline Overbooking Manager
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install dependencies for build
RUN npm install

# Copy source code
COPY . .

# Build Vite frontend distribution
RUN npm run build

# Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Copy necessary production artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/backend ./backend

# Default Render / container port
EXPOSE 3000 10000

# Start production server binding to 0.0.0.0
CMD ["node", "server.ts"]
