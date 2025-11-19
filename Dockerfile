# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy database files for migrations
COPY --from=builder /app/src/database ./src/database

# Create logs directory
RUN mkdir -p logs

# Create startup script
RUN echo '#!/bin/sh\n\
echo "Running database migrations..."\n\
npm run migration:run\n\
if [ "$RUN_SEEDS" = "true" ]; then\n\
  echo "Running database seeds..."\n\
  npm run seed:run\n\
fi\n\
echo "Starting application..."\n\
node dist/main' > start.sh && chmod +x start.sh

# Expose port
EXPOSE 3000

# Start the application with migrations
CMD ["./start.sh"]
