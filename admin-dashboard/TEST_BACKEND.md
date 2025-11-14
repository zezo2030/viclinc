# 🧪 اختبار Backend وتسجيل الدخول في Dashboard

## 1. التحقق من أن Backend يعمل

### الخطوة 1: تشغيل Backend
```bash
cd new/clinic-api
npm run start:dev
```

يجب أن ترى:
```
[Nest] INFO  Nest application successfully started
```

### الخطوة 2: اختبار Health Check
افتح المتصفح أو استخدم curl:
```bash
# Windows PowerShell
curl http://localhost:3000/v1/health

# أو افتح في المتصفح
http://localhost:3000/v1/health
```

**النتيجة المتوقعة:**
```json
{
  "status": "ok"
}
```

### الخطوة 3: اختبار Swagger Documentation
افتح في المتصفح:
```
http://localhost:3000/api-docs
```

يجب أن ترى واجهة Swagger مع جميع الـ endpoints.

---

## 2. التحقق من Login Endpoint

### Endpoint المطلوب:
- **URL:** `POST http://localhost:3000/v1/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "email": "admin@clinic.com",
    "password": "password123"
  }
  ```

### اختبار باستخدام Swagger:
1. افتح `http://localhost:3000/api-docs`
2. ابحث عن `POST /v1/auth/login`
3. اضغط على "Try it out"
4. أدخل:
   ```json
   {
     "email": "admin@clinic.com",
     "password": "password123"
   }
   ```
5. اضغط "Execute"

### اختبار باستخدام curl (PowerShell):
```powershell
$body = @{
    email = "admin@clinic.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/v1/auth/login" -Method Post -Body $body -ContentType "application/json"
```

### النتيجة المتوقعة:
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "admin@clinic.com",
      "name": "Admin User",
      "phone": "...",
      "role": "ADMIN"
    }
  }
}
```

---

## 3. إنشاء مستخدم Admin إذا لم يكن موجوداً

### الطريقة 1: استخدام Seed Script (إن وجد)
```bash
cd new/clinic-api
npm run seed
```

### الطريقة 2: إنشاء مستخدم يدوياً عبر MongoDB

#### أ. الدخول إلى MongoDB:
```bash
# إذا كان MongoDB محلي
mongosh clinic

# أو استخدام MongoDB Compass
```

#### ب. إنشاء مستخدم Admin:
```javascript
use clinic

// إنشاء مستخدم Admin
db.users.insertOne({
  name: "Admin User",
  email: "admin@clinic.com",
  phone: "+966501234567",
  passwordHash: "$2b$10$...", // يجب hash كلمة المرور
  role: "ADMIN",
  status: "ACTIVE",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

#### ج. استخدام bcrypt لـ hash كلمة المرور:

في Node.js REPL:
```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('password123', 10).then(hash => console.log(hash));
```

---

## 4. التحقق من إعدادات Dashboard

### ملف `.env` في `new/admin-dashboard`:
```env
VITE_API_URL=http://localhost:3000/v1
VITE_SITE_URL=http://localhost:3002
VITE_APP_NAME=Admin Dashboard
```

### التحقق من `constants.ts`:
```typescript
// new/admin-dashboard/src/utils/constants.ts
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'
```

---

## 5. اختبار تسجيل الدخول من Dashboard

### الخطوة 1: تشغيل Dashboard
```bash
cd new/admin-dashboard
npm run dev
```

### الخطوة 2: فتح Dashboard
```
http://localhost:3002
```

### الخطوة 3: محاولة تسجيل الدخول
- Email: `admin@clinic.com`
- Password: `password123`

### الخطوة 4: فتح Developer Console (F12)
تحقق من:
1. **Network Tab** - تحقق من الطلب إلى `/v1/auth/login`
2. **Console Tab** - تحقق من أي أخطاء
3. **Application Tab** - تحقق من `localStorage` بعد تسجيل الدخول

---

## 6. حل المشاكل الشائعة

### المشكلة: "Network Error" أو "Cannot connect to server"

**الحل:**
1. تحقق من أن Backend يعمل على `http://localhost:3000`
2. تحقق من `VITE_API_URL` في `.env`
3. تحقق من CORS settings في Backend

### المشكلة: "401 Unauthorized" أو "Invalid credentials"

**الحل:**
1. تحقق من أن مستخدم Admin موجود في MongoDB
2. تحقق من كلمة المرور (يجب أن تكون `password123`)
3. تأكد من hash كلمة المرور بشكل صحيح

### المشكلة: "CORS Error"

**الحل:**
تحقق من `src/main.ts` في Backend - يجب أن يحتوي على:
```typescript
app.enableCors({
  origin: [
    'http://localhost:3001', // الويبسايت
    'http://localhost:3000', // الباك إند
    'http://localhost:3002', // لوحة الإدارة (Dashboard)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-role'],
})
```

### المشكلة: "404 Not Found"

**الحل:**
1. تحقق من أن الـ route هو `/v1/auth/login` (مع prefix `v1`)
2. تحقق من `baseURL` في `apiClient`

---

## 7. اختبار شامل

### ملف اختبار باستخدام JavaScript (Node.js):
```javascript
// test-backend.js
const axios = require('axios');

const API_URL = 'http://localhost:3000/v1';

async function testBackend() {
  console.log('🧪 اختبار Backend...\n');

  // 1. Health Check
  try {
    console.log('1. اختبار Health Check...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health Check:', health.data);
  } catch (error) {
    console.error('❌ Health Check فشل:', error.message);
    return;
  }

  // 2. Login
  try {
    console.log('\n2. اختبار تسجيل الدخول...');
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@clinic.com',
      password: 'password123'
    });
    console.log('✅ تسجيل الدخول نجح!');
    console.log('Token:', login.data.data.access_token.substring(0, 20) + '...');
    console.log('User:', login.data.data.user);
  } catch (error) {
    console.error('❌ تسجيل الدخول فشل:', error.response?.data || error.message);
  }
}

testBackend();
```

**تشغيل الاختبار:**
```bash
cd new/clinic-api
node test-backend.js
```

---

## 8. Checklist سريع

- [ ] Backend يعمل على `http://localhost:3000`
- [ ] Health Check يعمل: `http://localhost:3000/v1/health`
- [ ] Swagger يعمل: `http://localhost:3000/api-docs`
- [ ] مستخدم Admin موجود في MongoDB
- [ ] Login endpoint يعمل من Swagger
- [ ] `VITE_API_URL` صحيح في Dashboard `.env`
- [ ] Dashboard يعمل على `http://localhost:3002`
- [ ] CORS مُعد بشكل صحيح في Backend
- [ ] لا توجد أخطاء في Console

---

## 9. رسائل خطأ شائعة وحلولها

### "Network Error"
- **السبب:** Backend لا يعمل أو CORS غير مُعد
- **الحل:** تأكد من تشغيل Backend وتحقق من CORS

### "401 Unauthorized"
- **السبب:** بيانات تسجيل الدخول خاطئة
- **الحل:** تحقق من Email و Password في MongoDB

### "404 Not Found"
- **السبب:** Route غير صحيح
- **الحل:** تأكد من استخدام `/v1/auth/login` مع prefix `v1`

### "CORS policy blocked"
- **السبب:** Backend لا يسمح بـ origin Dashboard
- **الحل:** أضف `http://localhost:3002` إلى CORS origins في Backend

---

**ملاحظة:** إذا استمرت المشكلة، افتح Developer Console في Dashboard وأرسل رسالة الخطأ الدقيقة.














