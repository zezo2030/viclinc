# إصلاح مشكلة عدم حفظ الصور الشخصية

## المشكلة
عند إنشاء حساب جديد مع صورة شخصية:
- الصورة لا تُحفظ في المجلد المحدد
- المجلد `uploads/avatars` لا يتم إنشاؤه
- الخطأ 404 عند محاولة عرض الصورة

## السبب
1. المجلد لا يتم إنشاؤه بشكل صحيح عند بدء التطبيق
2. في Docker، قد يكون هناك مشكلة في الصلاحيات أو المسار
3. لا يوجد logging كافٍ لمعرفة ما يحدث

## الحلول المنفذة

### 1. إنشاء المجلدات عند بدء التطبيق (`main.ts`)
- ✅ إضافة كود لإنشاء جميع مجلدات الرفع عند بدء التطبيق
- ✅ إضافة logging لمعرفة المسارات
- ✅ معالجة الأخطاء بشكل صحيح

### 2. تحسين `avatar-upload.config.ts`
- ✅ إنشاء المجلد عند تحميل الملف إذا لم يكن موجوداً
- ✅ إضافة logging مفصل عند حفظ الملفات
- ✅ معالجة الأخطاء بشكل أفضل

### 3. إضافة Logging في `auth.controller.ts`
- ✅ طباعة معلومات الملف عند الرفع
- ✅ طباعة المسار النهائي للصورة

## الاختبار

### 1. أعد تشغيل الباك إند:
```bash
cd medflow/new/clinic-api
npm run start:dev
```

أو في Docker:
```bash
docker-compose restart api
```

### 2. تحقق من الـ Logs:
يجب أن ترى رسائل مثل:
```
[Bootstrap] Created directory: /app/uploads/avatars
[Avatar Upload] Uploads directory exists: /app/uploads/avatars
```

### 3. اختبر رفع صورة:
- افتح التطبيق
- سجل حساب جديد مع صورة شخصية
- تحقق من الـ logs:
  ```
  [Register Patient] File uploaded: { filename: '...', path: '...' }
  [Avatar Upload] Saving file: /app/uploads/avatars/...
  ```

### 4. تحقق من الملفات:
في Docker:
```bash
docker exec -it virclinc-api ls -la /app/uploads/avatars/
```

أو محلياً:
```bash
ls -la medflow/new/clinic-api/uploads/avatars/
```

## ملاحظات مهمة

### في Docker:
- الملفات تُحفظ في volume: `api_uploads:/app/uploads`
- المسار الكامل: `/app/uploads/avatars/filename.jpg`
- المسار العام: `/static/avatars/filename.jpg`

### في التطوير المحلي:
- الملفات تُحفظ في: `clinic-api/uploads/avatars/`
- المسار الكامل: `{project}/clinic-api/uploads/avatars/filename.jpg`
- المسار العام: `/static/avatars/filename.jpg`

## استكشاف الأخطاء

إذا استمرت المشكلة:

1. **تحقق من الصلاحيات:**
   ```bash
   docker exec -it virclinc-api ls -la /app/uploads/
   ```

2. **تحقق من الـ logs:**
   ```bash
   docker logs virclinc-api | grep -i "avatar\|upload"
   ```

3. **تحقق من المسار:**
   ```bash
   docker exec -it virclinc-api pwd
   docker exec -it virclinc-api ls -la /app/
   ```

4. **إنشاء المجلد يدوياً:**
   ```bash
   docker exec -it virclinc-api mkdir -p /app/uploads/avatars
   docker exec -it virclinc-api chmod 777 /app/uploads/avatars
   ```

