# 🚀 دليل تشغيل النظام الكامل بدون Docker

## 📋 المتطلبات الأساسية

قبل البدء، تأكد من تثبيت الأدوات التالية على جهازك:

### 1. Node.js و npm
- **Node.js** الإصدار 18 أو أحدث
- **npm** الإصدار 9 أو أحدث
- للتحقق من الإصدار:
```bash
node --version
npm --version
```
- للتحميل: https://nodejs.org/

### 2. MongoDB
- **MongoDB** الإصدار 7 أو أحدث
- للتحميل: https://www.mongodb.com/try/download/community
- أو استخدام MongoDB Atlas (سحابي): https://www.mongodb.com/cloud/atlas

### 3. Redis (اختياري - غير مطلوب)
- **Redis** غير مطلوب - النظام يعمل بدونه
- إذا أردت تثبيته لتحسين الأداء (اختياري):
  - للتحميل: https://redis.io/download
  - أو استخدام Redis Cloud (سحابي): https://redis.com/try-free/

---

## 🔧 خطوات التشغيل

### الخطوة 1: إعداد قاعدة البيانات (MongoDB)

#### الطريقة أ: MongoDB محلي
1. قم بتثبيت MongoDB على جهازك
2. شغّل MongoDB Service:
   - Windows: MongoDB يعمل تلقائياً بعد التثبيت
   - Linux/Mac: `sudo systemctl start mongod` أو `brew services start mongodb-community`

#### الطريقة ب: MongoDB Atlas (سحابي)
1. أنشئ حساب مجاني على https://www.mongodb.com/cloud/atlas
2. أنشئ Cluster جديد
3. احصل على Connection String

#### Connection String:
- محلي: `mongodb://localhost:27017/clinic`
- Atlas: `mongodb+srv://username:password@cluster.mongodb.net/clinic`

---

### الخطوة 2: إعداد Redis (اختياري - يمكن تخطيه)

#### الطريقة أ: Redis محلي
1. قم بتثبيت Redis على جهازك
2. شغّل Redis:
   - Windows: استخدم WSL أو Redis for Windows
   - Linux: `sudo systemctl start redis`
   - Mac: `brew services start redis`

#### الطريقة ب: Redis Cloud (سحابي)
1. أنشئ حساب مجاني على https://redis.com/try-free/
2. احصل على Connection URL

#### Connection URL:
- محلي: `redis://localhost:6379`
- Cloud: `redis://username:password@host:port`

**ملاحظة مهمة:** إذا لم تثبت Redis، ببساطة اترك `REDIS_URL` فارغاً أو لا تضعه في ملف `.env` - النظام سيعمل بدون Redis.

---

### الخطوة 3: إعداد Backend API

1. **انتقل لمجلد Backend:**
```bash
cd new/clinic-api
```

2. **قم بتثبيت التبعيات:**
```bash
npm install
```

3. **أنشئ ملف `.env` في مجلد `clinic-api`:**
```env
# JWT Configuration
JWT_SECRET=your-super-secure-random-secret-key-here-change-in-production
JWT_EXPIRES_IN=24h

# Database - MongoDB
MONGO_URI=mongodb://localhost:27017/clinic
# أو للـ Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/clinic

# Redis (اختياري - اتركه فارغاً إذا لم تكن تستخدم Redis)
# REDIS_URL=redis://localhost:6379
# أو للـ Redis Cloud:
# REDIS_URL=redis://username:password@host:port

# Upload Configuration
UPLOADS_BASE_PATH=uploads
STATIC_PREFIX=/static
MAX_LOGO_SIZE_MB=2

# API Configuration
NODE_ENV=development
PORT=3000
```

4. **قم بإنشاء مجلد للـ Uploads:**
```bash
mkdir uploads
mkdir uploads/sections
```

5. **شغّل Backend:**
```bash
# للتطوير (مع Hot Reload)
npm run start:dev

# للإنتاج
npm run build
npm run start:prod
```

6. **تحقق من عمل Backend:**
   - افتح المتصفح: http://localhost:3000/v1/health
   - يجب أن ترى: `{"status":"ok"}`
   - API Documentation: http://localhost:3000/api-docs

---

### الخطوة 4: إعداد Website (Next.js)

1. **انتقل لمجلد Website:**
```bash
cd new/websit
```

2. **قم بتثبيت التبعيات:**
```bash
npm install
```

3. **أنشئ ملف `.env.local` في مجلد `websit`:**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/v1

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_SITE_NAME=Smart Clinic

# Development
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development

# Contact Information (اختياري)
NEXT_PUBLIC_CONTACT_PHONE=+966501234567
NEXT_PUBLIC_CONTACT_EMAIL=info@smartclinic.sa
NEXT_PUBLIC_CONTACT_ADDRESS=الرياض، المملكة العربية السعودية
```

4. **شغّل Website:**
```bash
# للتطوير
npm run dev

# للإنتاج
npm run build
npm run start
```

5. **تحقق من عمل Website:**
   - افتح المتصفح: http://localhost:3001

---

### الخطوة 5: إعداد Admin Dashboard

1. **انتقل لمجلد Admin Dashboard:**
```bash
cd new/admin-dashboard
```

2. **قم بتثبيت التبعيات:**
```bash
npm install
```

3. **أنشئ ملف `.env` في مجلد `admin-dashboard`:**
```env
# API Configuration
VITE_API_URL=http://localhost:3000/v1

# Site Configuration
VITE_SITE_URL=http://localhost:3002
VITE_SITE_NAME=Admin Dashboard
VITE_APP_NAME=Admin Dashboard
```

4. **شغّل Admin Dashboard:**
```bash
# للتطوير
npm run dev

# للإنتاج
npm run build
npm run preview
```

5. **تحقق من عمل Dashboard:**
   - افتح المتصفح: http://localhost:3002

---

## 🎯 ملخص المنافذ (Ports)

| الخدمة | المنفذ | الرابط |
|--------|--------|--------|
| Backend API | 3000 | http://localhost:3000 |
| Website (Next.js) | 3001 | http://localhost:3001 |
| Admin Dashboard | 3002 | http://localhost:3002 |
| MongoDB | 27017 | mongodb://localhost:27017 |
| Redis (اختياري) | 6379 | redis://localhost:6379 |

---

## 📝 إعداد البيانات الأولية

### إنشاء مستخدم Admin

1. **انتقل لمجلد Backend:**
```bash
cd new/clinic-api
```

2. **قم بتشغيل Seed Script (إن وجد):**
```bash
npm run seed
```

أو يدوياً من خلال API:
- استخدم Swagger: http://localhost:3000/api-docs
- أو استخدم Postman/Insomnia
- أو أنشئ User من خلال Dashboard

### بيانات تسجيل الدخول الافتراضية (إن تم إنشاؤها):
- Email: `admin@clinic.com`
- Password: `password123`

⚠️ **تأكد من تغيير كلمة المرور فوراً!**

---

## 🔍 اختبار النظام

### 1. اختبار Backend API
```bash
# Health Check
curl http://localhost:3000/v1/health

# يجب أن يرجع:
# {"status":"ok"}
```

### 2. اختبار Website
- افتح: http://localhost:3001
- جرب تسجيل الدخول
- تأكد من الاتصال مع API

### 3. اختبار Admin Dashboard
- افتح: http://localhost:3002
- سجّل الدخول باستخدام بيانات Admin
- تأكد من عمل جميع الميزات

---

## ⚠️ حل المشاكل الشائعة

### المشكلة: Backend لا يبدأ
**الحلول:**
1. تأكد من أن MongoDB يعمل:
   - Windows: افتح Services وتحقق من MongoDB
   - Linux: `sudo systemctl status mongod`
   - Mac: `brew services list`
2. تأكد من أن المنفذ 3000 غير مستخدم:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```
3. راجع ملف `.env` وتأكد من صحة `MONGO_URI`

### المشكلة: MongoDB Connection Error
**الحلول:**
1. تحقق من أن MongoDB Service يعمل
2. تحقق من صحة Connection String في `.env`
3. إذا كنت تستخدم Atlas، تأكد من إضافة IP في Network Access

### المشكلة: Website لا يتصل مع API
**الحلول:**
1. تحقق من `NEXT_PUBLIC_API_URL` في `.env.local`
2. تأكد من أن Backend يعمل على المنفذ 3000
3. افتح Developer Tools وفحص Console للأخطاء
4. تحقق من CORS settings في Backend

### المشكلة: Redis Connection Error
**الحل:**
- Redis اختياري تماماً - النظام مصمم للعمل بدونه
- ببساطة اترك `REDIS_URL` فارغاً أو احذفه من ملف `.env`
- النظام سيعمل بدون Redis بشكل طبيعي
- إذا رأيت رسائل خطأ Redis، يمكن تجاهلها - النظام سيعمل

### المشكلة: Port Already in Use
**الحل:**
```bash
# Windows - إنهاء العملية على المنفذ 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac - إنهاء العملية على المنفذ 3000
lsof -i :3000
kill -9 <PID>
```

---

## 🚀 تشغيل النظام بالكامل

### الطريقة الموصى بها: استخدام Terminals منفصلة

**Terminal 1 - Backend:**
```bash
cd new/clinic-api
npm run start:dev
```

**Terminal 2 - Website:**
```bash
cd new/websit
npm run dev
```

**Terminal 3 - Admin Dashboard:**
```bash
cd new/admin-dashboard
npm run dev
```

---

## 📚 ملفات الإعدادات المطلوبة

### Backend (`new/clinic-api/.env`):
```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
MONGO_URI=mongodb://localhost:27017/clinic
# Redis اختياري - اتركه فارغاً إذا لم تكن تستخدم Redis
# REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=development
```

### Website (`new/websit/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_SITE_NAME=Smart Clinic
```

### Admin Dashboard (`new/admin-dashboard/.env`):
```env
VITE_API_URL=http://localhost:3000/v1
VITE_SITE_URL=http://localhost:3002
VITE_APP_NAME=Admin Dashboard
```

---

## ✅ Checklist قبل البدء

- [ ] Node.js 18+ مثبت
- [ ] npm 9+ مثبت
- [ ] MongoDB مثبت ويعمل
- [ ] ملف `.env` للـ Backend جاهز
- [ ] ملف `.env.local` للـ Website جاهز
- [ ] ملف `.env` للـ Admin Dashboard جاهز
- [ ] تم تثبيت جميع التبعيات (npm install في كل مجلد)
- [ ] MongoDB يعمل ويمكن الاتصال به
- [ ] المنافذ 3000, 3001, 3002 غير مستخدمة
- [ ] Redis غير مطلوب - يمكن تخطيه

---

## 🎉 جاهز!

الآن يمكنك:
- ✅ تشغيل Backend على http://localhost:3000
- ✅ تشغيل Website على http://localhost:3001
- ✅ تشغيل Admin Dashboard على http://localhost:3002
- ✅ استخدام API Documentation على http://localhost:3000/api-docs

**نظامك جاهز للتطوير والاستخدام!** 🚀

