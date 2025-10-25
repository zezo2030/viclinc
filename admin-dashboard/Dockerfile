FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY admin-dashboard/package*.json ./admin-dashboard/
COPY shared/package*.json ./shared/

# Install dependencies for shared library first
RUN cd shared && npm install

# Copy shared source code
COPY shared/ ./shared/

# Build shared library
RUN cd shared && npm run build

# Install dependencies for admin-dashboard (include devDependencies for build tools like tsc)
RUN cd admin-dashboard && npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app/admin-dashboard
COPY --from=deps /app/admin-dashboard/node_modules ./node_modules
COPY --from=deps /app/shared/src ../shared/src
COPY --from=deps /app/shared/node_modules ../shared/node_modules
COPY admin-dashboard/ .

# Build admin dashboard
RUN npm run build

# Production image with nginx
FROM nginx:alpine AS runner

# Copy nginx config
COPY admin-dashboard/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/admin-dashboard/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
