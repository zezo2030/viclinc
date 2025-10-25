# إصلاح مشاكل Docker للـ Admin Dashboard

## المشكلة
كانت هناك مشكلة في Dockerfile للـ admin-dashboard حيث كان يحاول نسخ مجلد `shared` من مسار غير صحيح.

## الحلول المطبقة

### 1. تحديث Dockerfile.dev
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY admin-dashboard/package*.json ./
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm install

# Copy source code
COPY admin-dashboard/ .
COPY shared/ ./shared/

# Build shared library
RUN cd shared && npm run build

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
```

### 2. تحديث Dockerfile للإنتاج
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY admin-dashboard/package*.json ./
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY admin-dashboard/ .
COPY shared/ ./shared/

# Build shared library
RUN cd shared && npm run build

# Build admin dashboard
RUN npm run build
```

### 3. تحديث docker-compose.yml
```yaml
admin-dashboard:
  build: 
    context: .
    dockerfile: admin-dashboard/Dockerfile
  environment:
    - NODE_ENV=production
    - NEXT_PUBLIC_API_URL=http://localhost:3000/v1
    - NEXT_PUBLIC_SITE_URL=http://localhost:3002
    - NEXT_PUBLIC_SITE_NAME=Admin Dashboard
  depends_on:
    - api
  ports:
    - '3002:3000'
  restart: unless-stopped
```

### 4. تحديث docker-compose.dev.yml
```yaml
admin-dashboard:
  build: 
    context: .
    dockerfile: admin-dashboard/Dockerfile.dev
  environment:
    - NODE_ENV=development
    - NEXT_PUBLIC_API_URL=http://localhost:3000/v1
    - NEXT_PUBLIC_SITE_URL=http://localhost:3002
    - NEXT_PUBLIC_SITE_NAME=لوحة الإدارة
  depends_on:
    - api
  ports:
    - '3002:3000'
  volumes:
    - ./admin-dashboard:/app
    - ./shared:/app/shared
    - /app/node_modules
    - /app/.next
```

## كيفية التشغيل

### Development Environment
```bash
# Windows
docker-commands.bat dev-build

# Unix/Linux/Mac
make dev-build

# Manual
docker-compose -f docker-compose.dev.yml up --build -d
```

### Production Environment
```bash
# Windows
docker-commands.bat prod-build

# Unix/Linux/Mac
make prod-build

# Manual
docker-compose -f docker-compose.prod.yml up --build -d
```

## المسارات المتاحة

### Development
- **Website**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3002/admin
- **API**: http://localhost:3000
- **MailHog**: http://localhost:8025

### Production
- **Website**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3002/admin
- **API**: http://localhost:3000

## استكشاف الأخطاء

### 1. مشاكل البناء
```bash
# تنظيف Docker cache
docker system prune -f

# إعادة البناء بدون cache
docker-compose -f docker-compose.dev.yml build --no-cache
```

### 2. مشاكل Shared Library
```bash
# التحقق من وجود مجلد shared
ls -la shared/

# التحقق من package.json في shared
cat shared/package.json
```

### 3. مشاكل الصلاحيات
```bash
# إصلاح صلاحيات الملفات (Linux/Mac)
sudo chown -R $USER:$USER .

# التحقق من صلاحيات Docker
sudo systemctl status docker
```

## الملفات المحدثة

1. `admin-dashboard/Dockerfile.dev` - Development Dockerfile
2. `admin-dashboard/Dockerfile` - Production Dockerfile
3. `docker-compose.yml` - Production compose
4. `docker-compose.dev.yml` - Development compose
5. `docker-compose.prod.yml` - Production compose (backup)
6. `.dockerignore` - Docker ignore file

## ملاحظات مهمة

1. **Context**: تم تغيير build context من `./admin-dashboard` إلى `.` (root directory)
2. **Shared Library**: يتم نسخ مجلد shared من root directory
3. **Volumes**: في development، يتم mount مجلد shared للـ hot reload
4. **Production**: يتم build shared library داخل الصورة

## اختبار الحل

```bash
# تشغيل development environment
make dev-build

# التحقق من الخدمات
docker-compose -f docker-compose.dev.yml ps

# التحقق من logs
docker-compose -f docker-compose.dev.yml logs admin-dashboard
```

## النتيجة المتوقعة

- ✅ Admin Dashboard يعمل على http://localhost:3002/admin
- ✅ Shared library يتم build بنجاح
- ✅ Hot reload يعمل في development
- ✅ Production build يعمل بدون مشاكل
