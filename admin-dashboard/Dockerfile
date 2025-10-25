FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY admin-dashboard/package*.json ./
COPY shared/package*.json ./shared/

# Install dependencies for shared library first
RUN cd shared && npm install

# Copy shared source code
COPY shared/ ./shared/

# Build shared library
RUN cd shared && npm run build

# Install dependencies for admin-dashboard
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY admin-dashboard/ .
COPY shared/ ./shared/

# Build admin dashboard
RUN npm run build

# Production image with nginx
FROM nginx:alpine AS runner

# Copy nginx config
COPY admin-dashboard/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
