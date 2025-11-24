# موقع حفظ الصور الشخصية

## ✅ نعم، الصور الشخصية تُرفع في مجلد `uploads`

### 📍 الموقع المحدد في الكود:
- **المسار**: `uploads/avatars/`
- **الكود**: `medflow/new/clinic-api/src/modules/auth/config/avatar-upload.config.ts`
- **السطر 8**: `const uploadsDir = join(process.cwd(), 'uploads', 'avatars');`

### 🔍 الوضع الحالي:

#### في Docker (الإنتاج):
- ✅ الملفات تُحفظ في: `/app/uploads/avatars/` داخل الـ container
- ✅ الـ volume: `api_uploads:/app/uploads` (في docker-compose.yml)
- ✅ الملفات موجودة في Docker volume وليس في المجلد المحلي

#### في التطوير المحلي:
- ⚠️ المجلد `uploads/avatars` قد لا يكون موجوداً محلياً
- ✅ سيتم إنشاؤه تلقائياً عند رفع أول صورة

### 📂 هيكل المجلدات:

```
clinic-api/
├── uploads/
│   ├── avatars/          ← الصور الشخصية للمرضى والأطباء
│   │   └── {uuid}.jpg
│   └── sections/
│       └── logos/        ← شعارات الأقسام (موجود)
│           └── {uuid}.webp
```

### 🔧 التحقق من الملفات:

#### في Docker:
```bash
# التحقق من وجود الملفات
docker exec -it virclinc-api ls -la /app/uploads/avatars/

# عرض محتويات المجلد
docker exec -it virclinc-api find /app/uploads/avatars -type f
```

#### محلياً (إذا كان الباك إند يعمل بدون Docker):
```bash
cd medflow/new/clinic-api
dir uploads\avatars
```

### 📝 من الـ Logs:
من الـ logs السابقة، رأينا:
```
[Avatar Upload] Saving file: /app/uploads/avatars/fef1a692-64b8-4a21-b1fa-de1306daf284.jpg
[Register Patient] File uploaded: {
  path: '/app/uploads/avatars/fef1a692-64b8-4a21-b1fa-de1306daf284.jpg',
  destination: '/app/uploads/avatars'
}
```

هذا يؤكد أن الملفات **تُحفظ بنجاح** في `/app/uploads/avatars/` داخل Docker container.

### ⚠️ ملاحظة مهمة:

إذا كنت تريد رؤية الملفات محلياً (خارج Docker):
1. الملفات موجودة في Docker volume فقط
2. لنسخها محلياً:
   ```bash
   docker cp virclinc-api:/app/uploads/avatars ./clinic-api/uploads/
   ```

### ✅ الخلاصة:

**نعم، الصور الشخصية تُرفع في مجلد `uploads/avatars/`** كما هو محدد في الكود:
- ✅ في Docker: `/app/uploads/avatars/`
- ✅ محلياً: `clinic-api/uploads/avatars/` (سيتم إنشاؤه تلقائياً)

