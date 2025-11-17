# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SITE_NAME

# Set build environment variables (Next.js embeds these at build time)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME}

# Configure npm for better network handling
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000 && \
    npm config set maxsockets 15

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY next.config.* ./
COPY tailwind.config.* ./
COPY postcss.config.* ./

# Install dependencies with retry logic
# Use npm install if package-lock.json doesn't exist, otherwise use npm ci
RUN set -eux; \
    for i in 1 2 3 4 5; do \
        if [ -f package-lock.json ]; then \
            npm ci --prefer-offline --no-audit && break || sleep 10; \
        else \
            npm install --prefer-offline --no-audit && break || sleep 10; \
        fi; \
    done

# Copy source code
COPY src ./src
COPY public ./public

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application from builder
COPY --from=builder /app/public ./public

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Expose port
EXPOSE 3003

ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]

