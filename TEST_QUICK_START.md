# 🚀 دليل اختبار سريع - Backend و Dashboard

## 📋 خطوات سريعة للاختبار

### 1. تشغيل Backend
```bash
cd new/clinic-api
npm run start:dev
```

**النتيجة المتوقعة:**
```
[Nest] INFO  Nest application successfully started
```

### 2. اختبار Health Check
افتح في المتصفح:
```
http://localhost:3000/v1/health
```

**يجب أن ترى:**
```json
{"status":"ok"}
```

### 3. إنشاء مستخدم Admin (إذا لم يكن موجوداً)
```bash
cd new/clinic-api
npm run seed
```

**النتيجة المتوقعة:**
```
✅ تم إنشاء المستخدم الإداري
👤 الإداري: admin@clinic.com / password123
```

### 4. اختبار Login من Swagger
افتح في المتصفح:
```
http://localhost:3000/api-docs
```

1. ابحث عن `POST /v1/auth/login`
2. اضغط "Try it out"
3. أدخل:
   ```json
   {
     "email": "admin@clinic.com",
     "password": "password123"
   }
   ```
4. اضغط "Execute"

**النتيجة المتوقعة:**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "...",
    "user": {
      "email": "admin@clinic.com",
      "name": "مدير النظام",
      "role": "ADMIN"
    }
  }
}
```

### 5. تشغيل Dashboard
```bash
cd new/admin-dashboard
npm run dev
```

افتح في المتصفح:
```
http://localhost:3002
```

### 6. اختبار تسجيل الدخول من Dashboard
1. افتح `http://localhost:3002`
2. أدخل:
   - **Email:** `admin@clinic.com`
   - **Password:** `password123`
3. اضغط "تسجيل الدخول"

### 7. فتح Developer Console (F12)
تحقق من:
- **Console Tab:** لا توجد أخطاء
- **Network Tab:** طلب إلى `/v1/auth/login` يجب أن يكون **200 OK**
- **Application Tab → Local Storage:** يجب أن يحتوي على `access_token` و `user`

---

## 🔍 المشاكل الشائعة وحلولها

### ❌ المشكلة: Backend لا يبدأ

**الحل:**
```bash
# تحقق من MongoDB
# Windows: تأكد من أن MongoDB Service يعمل
# أو شغّل: mongod

# تحقق من المنفذ 3000
netstat -ano | findstr :3000
```

### ❌ المشكلة: "Network Error" في Dashboard

**الحل:**
1. تحقق من أن Backend يعمل على `http://localhost:3000`
2. تحقق من ملف `.env` في Dashboard:
   ```env
   VITE_API_URL=http://localhost:3000/v1
   ```
3. تأكد من CORS في Backend - يجب أن يحتوي على `http://localhost:3002`

### ❌ المشكلة: "401 Unauthorized"

**الحل:**
1. تأكد من وجود مستخدم `admin@clinic.com` في MongoDB
2. شغّل seed script:
   ```bash
   cd new/clinic-api
   npm run seed
   ```
3. تحقق من كلمة المرور: `password123`

### ❌ المشكلة: "CORS Error"

**الحل:**
تحقق من `src/main.ts` في Backend - يجب أن يحتوي على:
```typescript
app.enableCors({
  origin: [
    'http://localhost:3002', // Dashboard
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-role'],
})
```

### ❌ المشكلة: "404 Not Found"

**الحل:**
1. تحقق من الـ route: يجب أن يكون `/v1/auth/login` (مع prefix `v1`)
2. تحقق من `API_URL` في Dashboard: `http://localhost:3000/v1`

---

## 🧪 اختبار سريع باستخدام Script

### إنشاء ملف اختبار (`test-login.js`):
```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000/v1';

async function test() {
  try {
    // Health Check
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health Check:', health.data);

    // Login
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@clinic.com',
      password: 'password123'
    });
    console.log('✅ Login:', login.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

test();
```

**تشغيل الاختبار:**
```bash
cd new/clinic-api
node test-login.js
```

---

## ✅ Checklist سريع

- [ ] Backend يعمل على `http://localhost:3000`
- [ ] Health Check يعمل: `http://localhost:3000/v1/health`
- [ ] Swagger يعمل: `http://localhost:3000/api-docs`
- [ ] مستخدم Admin موجود (شغّل `npm run seed`)
- [ ] Login يعمل من Swagger
- [ ] Dashboard يعمل على `http://localhost:3002`
- [ ] `VITE_API_URL=http://localhost:3000/v1` في Dashboard `.env`
- [ ] CORS مُعد بشكل صحيح
- [ ] لا توجد أخطاء في Console

---

## 📞 إذا استمرت المشكلة

1. افتح Developer Console (F12)
2. انتقل إلى **Network Tab**
3. حاول تسجيل الدخول
4. ابحث عن طلب `/v1/auth/login`
5. انقر عليه وتحقق من:
   - **Request URL:** يجب أن يكون `http://localhost:3000/v1/auth/login`
   - **Request Method:** `POST`
   - **Status Code:** 200 (نجح) أو 401/404/500 (فشل)
   - **Response:** تحقق من الرسالة

**أرسل المعلومات التالية:**
- Status Code
- Response Body
- أي أخطاء في Console Tab



