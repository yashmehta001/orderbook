# Stage 1: Build
FROM node:lts-alpine AS builder

WORKDIR /app

# Install dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:lts-alpine AS production

WORKDIR /app

# Install only prod dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app and scripts
COPY --from=builder /app/dist ./dist
COPY ./start.sh ./

EXPOSE 3000

RUN chmod +x ./start.sh

CMD ["./start.sh"]
