# إصلاح مشكلة EBUSY في Docker

## المشكلة
كانت هناك مشكلة في Docker حيث كان يحاول حذف مجلد `/app/dist` الذي قد يكون قيد الاستخدام.

## الخطأ الذي ظهر
```
Error  EBUSY: resource busy or locked, rmdir '/app/dist'
```

## الحلول المطبقة

### 1. تحديث Dockerfile للـ API
```dockerfile
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Create dist directory if it doesn't exist
RUN mkdir -p dist
CMD ["npm","run","start:dev"]
```

### 2. إضافة Volume Mount للـ dist Directory
```yaml
api:
  build: ./clinic-api
  environment:
    - NODE_ENV=development
    - PORT=3000
    - MONGO_URI=mongodb://mongo:27017/clinic
    - REDIS_URL=redis://redis:6379
  depends_on:
    - mongo
    - redis
  ports:
    - '3000:3000'
  volumes:
    - ./clinic-api:/app
    - /app/node_modules
    - /app/dist
```

## الملفات المحدثة

1. `clinic-api/Dockerfile` - إضافة `RUN mkdir -p dist`
2. `docker-compose.dev.yml` - إضافة volume mount للـ dist

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

## استكشاف الأخطاء

### 1. مشاكل Docker Build
```bash
# تنظيف Docker cache
docker system prune -f

# إعادة البناء بدون cache
docker-compose -f docker-compose.dev.yml build --no-cache

# حذف containers والصور
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a
```

### 2. مشاكل Volume Mounts
```bash
# التحقق من volumes
docker volume ls

# حذف volumes غير المستخدمة
docker volume prune

# إعادة تشغيل الخدمات
docker-compose -f docker-compose.dev.yml restart api
```

### 3. مشاكل File Permissions
```bash
# إصلاح صلاحيات الملفات (Linux/Mac)
sudo chown -R $USER:$USER .

# التحقق من صلاحيات Docker
sudo systemctl status docker
```

## النتيجة المتوقعة

- ✅ API يعمل على http://localhost:3000
- ✅ Website يعمل على http://localhost:3001
- ✅ Admin Dashboard يعمل على http://localhost:3002/admin
- ✅ لا توجد أخطاء EBUSY
- ✅ Hot reload يعمل في development

## ملاحظات مهمة

1. **Volume Mounts**: استخدام volume mounts للـ dist directory
2. **Directory Creation**: إنشاء dist directory قبل البناء
3. **File Permissions**: التأكد من صلاحيات الملفات
4. **Docker Cache**: تنظيف Docker cache عند الحاجة

## اختبار الحل

```bash
# تشغيل development environment
make dev-build

# التحقق من الخدمات
docker-compose -f docker-compose.dev.yml ps

# التحقق من logs
docker-compose -f docker-compose.dev.yml logs api

# التحقق من API
curl http://localhost:3000/health
```

## بدائل أخرى

إذا استمرت المشكلة:

1. **استخدام Docker Compose Override**
2. **تغيير Build Context**
3. **استخدام Multi-stage Build**
4. **تجنب Volume Mounts للـ dist**

الآن يجب أن يعمل النظام بدون مشاكل EBUSY! 🎉
