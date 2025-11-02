# رفع شعار القسم (Department Logo Upload)

## نظرة عامة
تم إضافة إمكانية رفع شعار عند إنشاء أو تحديث قسم جديد. يتم حفظ الشعار محلياً في مجلد `uploads/sections/logos` وتخزين المسار في قاعدة البيانات.

## الميزات
- رفع ملفات الصور (JPEG, PNG, WebP)
- حجم أقصى: 2MB (قابل للتعديل عبر متغير البيئة `MAX_LOGO_SIZE_MB`)
- تسمية آمنة باستخدام UUID
- حذف تلقائي للشعار القديم عند التحديث
- خدمة الملفات الثابتة عبر `/static`

## API Endpoints

### إنشاء قسم مع شعار
```http
POST /v1/admin/departments
Content-Type: multipart/form-data

name: Cardiology
description: Heart and cardiovascular diseases
logo: [ملف صورة]
```

### تحديث قسم مع شعار
```http
PATCH /v1/admin/departments/:id
Content-Type: multipart/form-data

name: Cardiology
description: Updated description
logo: [ملف صورة جديد - اختياري]
```

### الاستجابة
```json
{
  "_id": "...",
  "name": "Cardiology",
  "description": "...",
  "logoPath": "sections/logos/uuid-filename.png",
  "logoUrl": "/static/sections/logos/uuid-filename.png",
  "isActive": true
}
```

## متغيرات البيئة

```env
UPLOADS_BASE_PATH=uploads          # مسار مجلد الرفع
STATIC_PREFIX=/static              # البادئة لخدمة الملفات الثابتة
MAX_LOGO_SIZE_MB=2                 # الحد الأقصى لحجم الملف بالميجابايت
```

## Docker Configuration

### Development
يتم ربط مجلد `uploads` كـ bind mount في `docker-compose.dev.yml`:
```yaml
volumes:
  - ./clinic-api:/app
  - ./clinic-api/uploads:/app/uploads
```

### Production
- يستخدم volume مسمى `uploads_data` لحفظ الملفات بشكل دائم
- Nginx يعمل كـ reverse proxy ويخدم الملفات الثابتة من `/static/`

## أمثلة

### cURL
```bash
curl -X POST http://localhost:3000/v1/admin/departments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Cardiology" \
  -F "description=Heart department" \
  -F "logo=@./logo.png"
```

### JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('name', 'Cardiology');
formData.append('description', 'Heart department');
formData.append('logo', fileInput.files[0]);

const response = await fetch('http://localhost:3000/v1/admin/departments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## الأمان
- التحقق من نوع الملف (JPEG, PNG, WebP فقط)
- حد أقصى لحجم الملف
- تسمية آمنة باستخدام UUID لمنع التضارب
- حذف الملفات القديمة عند التحديث

## الملاحظات
- عند حذف قسم، يتم حذف ملف الشعار تلقائياً
- في حالة فشل عملية الإنشاء/التحديث، يتم حذف الملف المرفوع تلقائياً

