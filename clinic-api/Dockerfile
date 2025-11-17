# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Configure npm for better network handling
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000 && \
    npm config set maxsockets 15

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies with retry logic (including devDependencies for build)
# Use npm install if package-lock.json doesn't exist, otherwise use npm ci
# Note: npm ci installs all dependencies including devDependencies by default
RUN set -eux; \
    for i in 1 2 3 4 5; do \
        if [ -f package-lock.json ]; then \
            npm ci --prefer-offline --no-audit && break || sleep 10; \
        else \
            npm install --prefer-offline --no-audit && break || sleep 10; \
        fi; \
    done

# Verify @nestjs/cli is installed and nest command is available
RUN if [ ! -f node_modules/.bin/nest ]; then \
        echo "Nest CLI not found, installing @nestjs/cli..." && \
        npm install --save-dev @nestjs/cli; \
    fi && \
    chmod +x node_modules/.bin/nest || true

# Copy source code
COPY src ./src

# Build the application
# npm scripts automatically add node_modules/.bin to PATH
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Configure npm for better network handling
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000 && \
    npm config set maxsockets 15

# Copy package files
COPY package*.json ./

# Install only production dependencies with retry logic
# Note: --only=production installs dependencies (not devDependencies)
RUN set -eux; \
    for i in 1 2 3 4 5; do \
        if [ -f package-lock.json ]; then \
            npm ci --omit=dev --prefer-offline --no-audit && break || sleep 10; \
        else \
            npm install --omit=dev --prefer-offline --no-audit && break || sleep 10; \
        fi; \
    done && \
    npm cache clean --force

# Verify critical dependencies are installed
RUN node -e "require('@nestjs/core'); console.log('@nestjs/core is installed')" || \
    (echo "ERROR: @nestjs/core not found, reinstalling..." && npm install @nestjs/core --save --no-audit)

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads/sections/logos

# Create config directory for Firebase service account
RUN mkdir -p config

# Copy i18n files
COPY src/i18n ./dist/src/i18n

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]

