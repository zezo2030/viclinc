# 🚀 دليل البدء السريع

## المشكلة الحالية

الخادم الخلفي لا يعمل لأنه يحتاج إلى **MongoDB** على الأقل.

## الحلول السريعة

### الحل 1: استخدام Docker Compose (الأسهل) ✅

```bash
cd new
docker-compose -f docker-compose.dev.yml up -d
```

هذا سيُشغل:
- ✅ MongoDB على المنفذ 27017
- ✅ Redis على المنفذ 6379
- ✅ API على المنفذ 3000

**بعد التشغيل:**
```bash
# في Terminal منفصل
cd new/admin-dashboard
npm run dev
```

### الحل 2: تثبيت MongoDB محلياً

#### Windows:
1. حمّل MongoDB من: https://www.mongodb.com/try/download/community
2. ثبت MongoDB
3. شغّل MongoDB Service
4. ثم شغّل الخادم:

```bash
cd new/clinic-api
npm run start:dev
```

### الحل 3: استخدام MongoDB Atlas (مجاني)

1. سجّل في: https://www.mongodb.com/cloud/atlas
2. أنشئ قاعدة بيانات مجانية
3. احصل على Connection String
4. أنشئ ملف `.env` في `new/clinic-api`:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/clinic?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
PORT=3000
```

5. شغّل الخادم:
```bash
cd new/clinic-api
npm run start:dev
```

## التحقق من عمل الخادم

بعد تشغيل الخادم، افتح المتصفح على:
- ✅ Health Check: http://localhost:3000/v1/health
- ✅ API Docs: http://localhost:3000/api-docs

## بعد تشغيل الخادم

1. ✅ شغّل لوحة الإدارة:
```bash
cd new/admin-dashboard
npm run dev
```

2. ✅ افتح المتصفح على: http://localhost:3002

3. ✅ جرب تسجيل الدخول:
   - البريد: `admin@clinic.com`
   - كلمة المرور: `password123`

## ملاحظات مهمة

- ⚠️ الخادم الخلفي **يجب** أن يعمل على المنفذ 3000
- ⚠️ MongoDB **يجب** أن يكون متاحاً
- ⚠️ Redis اختياري لكن موصى به

## استكشاف الأخطاء

### خطأ: "Cannot connect to MongoDB"
- تأكد من أن MongoDB يعمل
- تحقق من `MONGO_URI` في `.env`

### خطأ: "Port 3000 is already in use"
- أغلق البرنامج الذي يستخدم المنفذ 3000
- أو غيّر `PORT` في `.env`

### خطأ: "Network Error" في Frontend
- تأكد من أن الخادم يعمل على `http://localhost:3000`
- تحقق من `VITE_API_URL` في `admin-dashboard/.env.local`














