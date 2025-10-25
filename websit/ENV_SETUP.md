# إعداد متغيرات البيئة (Environment Variables Setup)

## متغيرات البيئة المطلوبة للـ Frontend

### 1. إنشاء ملف .env.local

أنشئ ملف `.env.local` في جذر مجلد `website` مع المحتوى التالي:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# JWT Configuration (اختياري - للتطوير فقط)
# JWT_SECRET=your-secret-key
# JWT_EXPIRES_IN=7d
```

### 2. المتغيرات المطلوبة:

#### NEXT_PUBLIC_API_URL
- **الوصف**: رابط API الخاص بالـ Backend
- **القيمة الافتراضية**: `http://localhost:3000`
- **الاستخدام**: للاتصال مع Backend API

### 3. متغيرات الـ Backend المطلوبة:

تأكد من أن الـ Backend يحتوي على متغيرات البيئة التالية:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/clinic_db"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email (اختياري)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Redis (اختياري)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. تشغيل التطبيق:

#### 1. تشغيل الـ Backend:
```bash
cd backend
npm install
npm run start:dev
```

#### 2. تشغيل الـ Frontend:
```bash
cd website
npm install
npm run dev
```

### 5. التحقق من الاتصال:

1. تأكد من أن الـ Backend يعمل على `http://localhost:3000`
2. تأكد من أن الـ Frontend يعمل على `http://localhost:3001`
3. جرب تسجيل الدخول من خلال النموذج في الـ Frontend

### 6. استكشاف الأخطاء:

#### إذا لم يعمل تسجيل الدخول:
1. تحقق من أن الـ Backend يعمل
2. تحقق من صحة `NEXT_PUBLIC_API_URL`
3. تحقق من إعدادات JWT في الـ Backend
4. تحقق من قاعدة البيانات والـ Prisma

#### إذا ظهرت أخطاء في Console:
1. افتح Developer Tools في المتصفح
2. تحقق من الأخطاء في Console tab
3. تحقق من Network tab للطلبات الفاشلة

### 7. الـ API Endpoints المتاحة:

```
POST /auth/login     - تسجيل الدخول
POST /auth/register  - إنشاء حساب جديد
GET  /auth/profile   - الحصول على بيانات المستخدم
```

### 8. اختبار النظام:

1. **تسجيل حساب جديد**:
   - اذهب إلى `/register`
   - أدخل البيانات المطلوبة
   - تأكد من أن الحساب تم إنشاؤه في قاعدة البيانات

2. **تسجيل الدخول**:
   - اذهب إلى `/login` أو استخدم AuthModal في الصفحة الرئيسية
   - أدخل بيانات الحساب
   - تأكد من أنك تحولت إلى dashboard

3. **حماية المسارات**:
   - جرب الذهاب مباشرة إلى `/dashboard` بدون تسجيل دخول
   - تأكد من أنك تحولت إلى صفحة تسجيل الدخول

4. **تسجيل الخروج**:
   - اضغط على اسم المستخدم في Header
   - اختر "تسجيل الخروج"
   - تأكد من أنك تحولت إلى الصفحة الرئيسية
