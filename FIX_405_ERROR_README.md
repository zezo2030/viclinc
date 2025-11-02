# إصلاح خطأ 405 (Not Allowed) عند إضافة قسم جديد

## المشكلة
عند محاولة إضافة قسم جديد من لوحة التحكم (Admin Dashboard)، يظهر خطأ:
```
Failed to load resource: the server responded with a status of 405 (Not Allowed)
```

رغم أن الإضافة تعمل بشكل صحيح من خلال Swagger.

## تحليل المشكلة

### الأسباب الرئيسية:
1. **nginx للداشبورد لا يحول الطلبات للـ API** - كان يخدم فقط الملفات الثابتة دون تحويل طلبات API
2. **عدم دعم OPTIONS preflight requests** - المتصفح يرسل OPTIONS request قبل POST للتحقق من CORS
3. **عدم وجود CORS headers** - nginx لم يكن يضيف الـ headers اللازمة لـ CORS
4. **التوكن الوهمي في Login** - صفحة تسجيل الدخول تستخدم `mock-admin-token` بدلاً من التوكن الحقيقي
5. **عدم وجود شبكة Docker مشتركة** - الخدمات لم تكن متصلة بشبكة واحدة

## التغييرات التي تم تنفيذها

### 1. تحديث nginx.conf للداشبورد (`admin-dashboard/nginx.conf`)

#### التغييرات:
- ✅ إضافة دعم OPTIONS preflight requests
- ✅ إضافة CORS headers لجميع الطلبات
- ✅ إضافة `location /v1/` لتحويل طلبات API إلى الباك إند
- ✅ إضافة `location /api/` لتحويل طلبات API (للتوافق)
- ✅ تمرير جميع HTTP headers الضرورية

```nginx
# دعم CORS للـ API requests
add_header 'Access-Control-Allow-Origin' '*' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept, x-role' always;

# التعامل مع OPTIONS preflight requests
if ($request_method = 'OPTIONS') {
    return 204;
}

# تحويل طلبات API إلى الباك إند
location /v1/ {
    proxy_pass http://api:3000/v1/;
    # ... proxy settings
}
```

### 2. تحديث nginx.conf للـ deploy (`deploy/nginx.conf`)

#### التغييرات:
- ✅ إضافة دعم OPTIONS preflight requests
- ✅ إضافة CORS headers عامة
- ✅ تحديث proxy_pass لدعم جميع HTTP methods

### 3. تصليح Login في الداشبورد (`admin-dashboard/src/pages/Login.tsx`)

#### التغييرات السابقة:
```typescript
// TODO: Implement actual login logic
localStorage.setItem('access_token', 'mock-admin-token');
```

#### التغييرات الجديدة:
```typescript
// استدعاء API الحقيقي للتسجيل
const response = await apiClient.post('/auth/login', {
    email: formData.email,
    password: formData.password,
});

// التحقق من أن المستخدم أدمن
if (response.data.user.role !== 'ADMIN') {
    toast.error('هذا الحساب ليس لديه صلاحيات الأدمن');
    return;
}

// Store token and user data
localStorage.setItem('access_token', response.data.access_token);
localStorage.setItem('user_role', response.data.user.role);
```

### 4. تحديث Docker Compose

#### تحديث `docker-compose.yml`:
- ✅ إضافة `JWT_SECRET` و `JWT_EXPIRES_IN` للـ API
- ✅ إضافة `networks: - clinic-network` لجميع الخدمات
- ✅ إنشاء شبكة Docker مشتركة `clinic-network`

#### تحديث `docker-compose.prod.yml`:
- ✅ نفس التحديثات للإنتاج
- ✅ إضافة nginx service للشبكة

## كيفية التطبيق

### 1. إعادة بناء وتشغيل Docker Containers:

```bash
# إيقاف الخدمات الحالية
docker-compose down

# حذف الصور القديمة (اختياري لإجبار إعادة البناء)
docker-compose rm -f

# إعادة بناء وتشغيل الخدمات
docker-compose up --build
```

### 2. للتطوير (Development):

```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

### 3. للإنتاج (Production):

```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d
```

## اختبار الإصلاح

### 1. تسجيل الدخول:
1. افتح `http://localhost:3002` (للداشبورد)
2. استخدم بيانات الأدمن:
   - **Email**: `admin@clinic.com`
   - **Password**: `password123`
3. يجب أن يتم تسجيل الدخول بنجاح

### 2. إضافة قسم جديد:
1. اذهب إلى صفحة الأقسام (Departments)
2. اضغط على "إضافة قسم جديد"
3. أدخل:
   - **اسم القسم**: مثل "قسم القلب"
   - **الوصف**: "قسم متخصص في أمراض القلب"
   - **الحالة**: نشط
   - **الشعار**: (اختياري) ارفع صورة
4. اضغط "إنشاء القسم"
5. يجب أن يتم إضافة القسم بنجاح ✅

### 3. التحقق من Swagger:
1. افتح `http://localhost:3000/api-docs`
2. جرّب endpoint: `POST /v1/admin/departments`
3. يجب أن يعمل أيضاً

## استكشاف الأخطاء

### إذا استمر خطأ 405:

#### 1. تحقق من logs:
```bash
# لوق الداشبورد
docker logs virclinc-admin-dashboard-1

# لوق API
docker logs virclinc-api-1

# لوق nginx (في الإنتاج)
docker logs virclinc-nginx-1
```

#### 2. تحقق من أن التوكن صحيح:
- افتح Developer Tools (F12)
- اذهب إلى Application > Local Storage
- تأكد من وجود `access_token` وليس `mock-admin-token`

#### 3. تحقق من الشبكة:
```bash
# تأكد من أن الخدمات في نفس الشبكة
docker network inspect virclinc_clinic-network
```

#### 4. تحقق من CORS headers:
- افتح Developer Tools (F12)
- اذهب إلى Network tab
- اضغط على الطلب الفاشل
- تحقق من Response Headers أن فيها:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`

### إذا ظهر خطأ 401 (Unauthorized):

هذا يعني أن التوكن غير صحيح:
1. سجل الخروج
2. سجل الدخول مرة أخرى باستخدام بيانات الأدمن الصحيحة
3. حاول مرة أخرى

### إذا ظهر خطأ 403 (Forbidden):

هذا يعني أن المستخدم ليس لديه صلاحيات أدمن:
1. تحقق من role في localStorage
2. تأكد من أنك مسجل دخول كـ ADMIN وليس DOCTOR أو PATIENT

## ملاحظات مهمة

### 1. بيانات تسجيل الدخول الافتراضية:
- **Admin**: `admin@clinic.com` / `password123`
- **Doctor**: `ahmed@clinic.com` / `password123`
- **Patient**: `sara@example.com` / `password123`

### 2. JWT Secret:
في الإنتاج، يجب تغيير `JWT_SECRET`:
```bash
# إنشاء ملف .env
echo "JWT_SECRET=your-very-secure-random-secret-key-here" > .env

# تشغيل Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### 3. CORS في الإنتاج:
في الإنتاج، يُفضل تحديد الـ origins المسموح بها بدلاً من `*`:
```nginx
add_header 'Access-Control-Allow-Origin' 'https://yourdomain.com' always;
```

## الخلاصة

تم إصلاح خطأ 405 من خلال:
1. ✅ إضافة proxy_pass في nginx للداشبورد لتحويل طلبات API
2. ✅ إضافة دعم OPTIONS preflight requests
3. ✅ إضافة CORS headers الصحيحة
4. ✅ استخدام JWT token حقيقي بدلاً من mock token
5. ✅ ربط جميع الخدمات في شبكة Docker واحدة

الآن يمكنك إضافة أقسام جديدة من لوحة التحكم بنجاح! 🎉

## الدعم

إذا واجهت أي مشاكل:
1. راجع logs باستخدام `docker logs`
2. تحقق من Network tab في Developer Tools
3. تأكد من أن جميع الخدمات تعمل: `docker ps`



