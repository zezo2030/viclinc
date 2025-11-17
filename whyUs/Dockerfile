FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_BASE=/

ENV VITE_BASE=${VITE_BASE}

# Configure npm for better network handling
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000 && \
    npm config set maxsockets 15

COPY package*.json ./
COPY vite.config.js ./

# Install dependencies with retry logic
RUN set -eux; \
    for i in 1 2 3 4 5; do \
        npm install --legacy-peer-deps --prefer-offline --no-audit && break || sleep 10; \
    done

COPY tailwind.config.js ./
COPY index.html ./
COPY src ./src
COPY public ./public

RUN npm run build

FROM nginx:alpine

ARG VITE_BASE=/

ENV VITE_BASE=${VITE_BASE}

COPY --from=builder /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css application/json application/javascript application/x-javascript text/javascript application/xml+rss image/svg+xml; \
    \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    location ~* \.(?:jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        add_header Access-Control-Allow-Origin "*"; \
    } \
    \
    location /assets/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        add_header Access-Control-Allow-Origin "*"; \
        try_files $uri =404; \
    } \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

