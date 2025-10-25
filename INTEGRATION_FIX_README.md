# إصلاح تكامل لوحة الإدارة مع الباكند

## المشاكل التي تم إصلاحها

✅ **إعدادات CORS**: تم إضافة `x-role` header في allowedHeaders  
✅ **Proxy Settings**: تم تحديث Vite proxy ليشير إلى `localhost:3000`  
✅ **Seed Data**: تم إنشاء بيانات أولية للاختبار  
✅ **API Client**: إعدادات صحيحة مع x-role header  

## خطوات التشغيل

### 1. تشغيل قاعدة البيانات
```bash
# تشغيل MongoDB
mongod

# تشغيل Redis (اختياري)
redis-server
```

### 2. إنشاء البيانات الأولية
```bash
cd clinic-api
npm run seed
```

### 3. تشغيل الباكند
```bash
cd clinic-api
npm run start:dev
```

### 4. تشغيل الداشبورد
```bash
cd admin-dashboard
npm run dev
```

### 5. فتح الداشبورد
افتح المتصفح على: `http://localhost:3002`

## بيانات الدخول للاختبار

### المستخدم الإداري
- **البريد**: admin@clinic.com
- **كلمة المرور**: password123

### الأطباء
- **البريد**: ahmed@clinic.com, fatima@clinic.com, mohamed@clinic.com
- **كلمة المرور**: password123

### المرضى
- **البريد**: sara@example.com, khalid@example.com, nora@example.com
- **كلمة المرور**: password123

## البيانات المنشأة

### الأقسام
- أمراض القلب
- العظام
- العيون
- الأطفال
- النساء والولادة

### الأطباء
- د. أحمد محمد (أمراض القلب)
- د. فاطمة علي (جراحة العظام)
- د. محمد حسن (طب العيون)

## ملاحظات مهمة

1. **API Authentication**: الداشبورد يستخدم header `x-role: ADMIN` للوصول للـ endpoints
2. **CORS**: تم إعداد CORS للسماح بالطلبات من `localhost:3002`
3. **Proxy**: Vite proxy يوجه `/api/*` إلى `localhost:3000/v1/*`
4. **Guards**: AdminRoleGuard يتحقق من header `x-role`

## استكشاف الأخطاء

### إذا لم تعمل API calls:
1. تأكد من تشغيل الباكند على المنفذ 3000
2. تحقق من Console في Developer Tools
3. تأكد من وجود header `x-role: ADMIN` في Network tab

### إذا ظهرت صفحة بيضاء:
1. تأكد من تشغيل الداشبورد على المنفذ 3002
2. تحقق من Console للأخطاء
3. تأكد من تحميل shared package

### إذا لم تظهر البيانات:
1. تأكد من تشغيل `npm run seed`
2. تحقق من اتصال قاعدة البيانات
3. تأكد من وجود البيانات في MongoDB

## API Endpoints المتاحة

- `GET /v1/admin/metrics/overview` - مؤشرات عامة
- `GET /v1/admin/users` - قائمة المستخدمين
- `GET /v1/admin/doctors` - قائمة الأطباء
- `GET /v1/admin/departments` - قائمة الأقسام
- `GET /v1/admin/appointments` - قائمة المواعيد

جميع الـ endpoints تحتاج header `x-role: ADMIN` للوصول.
