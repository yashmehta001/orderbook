# Stage 1: Build
FROM node:lts-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies including dev dependencies (for Nest CLI)
COPY package.json package-lock.json ./
RUN npm install

# Copy source code and build the application
COPY . .
RUN npm run build

# Stage 2: Production Image
FROM node:lts-alpine AS production

# Set working directory
WORKDIR /app

# Install only production dependencies
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm install --production

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the necessary files (e.g., start script)
COPY ./start.sh ./

# Expose the app's port
EXPOSE 3000

# Make sure the start script is executable
RUN chmod +x ./start.sh

# Use the start script to launch the app
CMD ["./start.sh"]
