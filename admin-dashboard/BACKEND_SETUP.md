# دليل تشغيل الخادم الخلفي

## المتطلبات الأساسية

الخادم الخلفي يحتاج إلى:
1. **MongoDB** - قاعدة البيانات
2. **Redis** - التخزين المؤقت (اختياري لكن مستحسن)

## الطريقة 1: تشغيل بدون Docker

### 1. تشغيل MongoDB و Redis محلياً

#### Windows:
```powershell
# تشغيل MongoDB (إذا كان مثبت)
# أو استخدم MongoDB Compass / MongoDB Atlas

# تشغيل Redis (إذا كان مثبت)
# أو استخدم Redis for Windows
```

#### أو استخدم Docker:
```bash
docker run -d -p 27017:27017 --name mongo mongo:7
docker run -d -p 6379:6379 --name redis redis:7
```

### 2. إعداد متغيرات البيئة (اختياري)

أنشئ ملف `.env` في مجلد `clinic-api`:
```env
# JWT
JWT_SECRET=your-super-secure-random-secret-key-here
JWT_EXPIRES_IN=24h

# Database
MONGO_URI=mongodb://localhost:27017/clinic
REDIS_URL=redis://localhost:6379

# API
PORT=3000
NODE_ENV=development
```

### 3. تشغيل الخادم

```bash
cd new/clinic-api
npm install
npm run start:dev
```

سيعمل الخادم على: `http://localhost:3000`

## الطريقة 2: تشغيل باستخدام Docker Compose (موصى به)

```bash
cd new
docker-compose -f docker-compose.dev.yml up
```

هذا سيُشغل:
- MongoDB على المنفذ 27017
- Redis على المنفذ 6379
- API على المنفذ 3000

## التحقق من عمل الخادم

1. افتح المتصفح على: `http://localhost:3000/v1/health`
2. يجب أن ترى رسالة نجاح
3. أو افتح: `http://localhost:3000/api-docs` للوثائق (Swagger)

## استكشاف الأخطاء

### الخادم لا يبدأ:
- تأكد من أن MongoDB يعمل
- تأكد من أن المنفذ 3000 غير مستخدم
- راجع سجل الأخطاء في Terminal

### خطأ في الاتصال بـ MongoDB:
- تأكد من أن MongoDB يعمل على `localhost:27017`
- تحقق من متغير `MONGO_URI` في `.env`

### خطأ في الاتصال بـ Redis:
- Redis اختياري، لكن بعض الميزات قد لا تعمل
- تأكد من أن Redis يعمل على `localhost:6379`

## بيانات تجريبية

بعد تشغيل الخادم، يمكنك تشغيل:
```bash
cd new/clinic-api
npm run seed
```

هذا سينشئ بيانات تجريبية للمستخدمين والأطباء.



