# API الأطباء - المرحلة 3

## نظرة عامة
تم تنفيذ نظام إدارة الأطباء مع إمكانية إنشاء حسابات الأطباء واعتمادها، وإدارة ملفاتهم الشخصية وخدماتهم.

## الميزات المنجزة

### 1. Schemas
- **DoctorProfile**: ملف الطبيب مع الحقول الأساسية
- **DoctorService**: ربط الطبيب بالخدمات مع أسعار ومدة مخصصة

### 2. API Endpoints

#### مسارات الأدمن (تحتاج صلاحيات ADMIN)
```
POST /v1/admin/doctors
- إنشاء طبيب جديد
- Body: { userId, name, licenseNumber, yearsOfExperience, departmentId, photos?, bio? }

GET /v1/admin/doctors
- قائمة الأطباء مع فلترة
- Query: status?, departmentId?

GET /v1/admin/doctors/:id
- تفاصيل طبيب محدد

PATCH /v1/admin/doctors/:id/status
- تغيير حالة الطبيب (PENDING/APPROVED/SUSPENDED)
- Body: { status }
```

#### مسارات الطبيب (تحتاج صلاحيات DOCTOR)
```
GET /v1/doctor/me
- عرض ملف الطبيب الحالي

PATCH /v1/doctor/me
- تعديل ملف الطبيب
- Body: { name?, licenseNumber?, yearsOfExperience?, photos?, bio? }

GET /v1/doctor/me/services
- عرض خدمات الطبيب

PUT /v1/doctor/me/services/:serviceId
- إضافة/تحديث خدمة للطبيب
- Body: { customPrice?, customDuration?, isActive? }

DELETE /v1/doctor/me/services/:serviceId
- حذف خدمة من الطبيب
```

### 3. Guards والحماية
- **JwtAuthGuard**: التحقق من صحة JWT token
- **AdminRoleGuard**: التحقق من صلاحيات الأدمن
- **DoctorRoleGuard**: التحقق من صلاحيات الطبيب

### 4. قواعد العمل
- الطبيب لا يستطيع الدخول إلا بعد الموافقة (status = APPROVED)
- منع تكرار userId في DoctorProfile
- منع تكرار (doctorId, serviceId) في DoctorService
- الخدمات يجب أن تنتمي لنفس قسم الطبيب

### 5. فهارس قاعدة البيانات
- `doctorProfiles`: userId (unique), departmentId, status, licenseNumber (unique)
- `doctorServices`: (doctorId, serviceId) unique, doctorId, serviceId

## مثال على الاستخدام

### 1. إنشاء طبيب (الأدمن)
```bash
POST /v1/admin/doctors
Authorization: Bearer <admin_token>
{
  "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "name": "د. أحمد محمد",
  "licenseNumber": "DOC123456",
  "yearsOfExperience": 5,
  "departmentId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "bio": "طبيب متخصص في الجراحة العامة"
}
```

### 2. اعتماد الطبيب
```bash
PATCH /v1/admin/doctors/64f1a2b3c4d5e6f7g8h9i0j3/status
Authorization: Bearer <admin_token>
{
  "status": "APPROVED"
}
```

### 3. تعديل ملف الطبيب
```bash
PATCH /v1/doctor/me
Authorization: Bearer <doctor_token>
{
  "bio": "طبيب متخصص في الجراحة العامة مع خبرة 5 سنوات"
}
```

### 4. إضافة خدمة للطبيب
```bash
PUT /v1/doctor/me/services/64f1a2b3c4d5e6f7g8h9i0j4
Authorization: Bearer <doctor_token>
{
  "customPrice": 150,
  "customDuration": 30,
  "isActive": true
}
```

## ملاحظات مهمة
- جميع المسارات محمية بـ JWT authentication
- مسارات الأدمن تحتاج صلاحيات ADMIN
- مسارات الطبيب تحتاج صلاحيات DOCTOR
- الطبيب لا يستطيع الدخول إلا بعد الموافقة من الأدمن

---

## إدارة الخدمات في الأقسام

### نظرة عامة
يمكن للأدمن إدارة خدمات الأقسام من خلال API الخدمات. يتم إدارة الخدمات داخل سياق القسم، مما يسهل على الأطباء إضافة الخدمات المناسبة لملفاتهم.

### API Endpoints للخدمات (الأدمن)

```
GET /v1/admin/services?departmentId=xxx
- عرض جميع الخدمات مع فلترة حسب القسم
- Query: departmentId? (اختياري)

POST /v1/admin/services
- إنشاء خدمة جديدة
- Body: { name, departmentId, description?, defaultPrice?, defaultDurationMin?, isActive? }

GET /v1/admin/services/:id
- عرض خدمة محددة

PATCH /v1/admin/services/:id
- تحديث خدمة
- Body: { name?, description?, departmentId?, defaultPrice?, defaultDurationMin?, isActive? }

DELETE /v1/admin/services/:id
- حذف خدمة
```

### API Endpoint لتفاصيل القسم مع الخدمات

```
GET /v1/admin/departments/:id/details
- عرض تفاصيل القسم مع جميع الخدمات والأطباء المرتبطين به
- Response: { _id, name, description, isActive, logoUrl, doctors: [], services: [] }
```

### سير العمل

1. **الأدمن ينشئ الخدمات**:
   - الأدمن ينشئ الخدمات لكل قسم عبر `/admin/services`
   - كل خدمة تنتمي لقسم واحد فقط

2. **الطبيب يضيف الخدمات لملفه**:
   - الطبيب يستعرض الخدمات المتاحة في قسمه
   - يضيف الخدمة لملفه عبر `/doctor/me/services/:serviceId`
   - يمكنه تحديد سعر ومدة مخصصة

3. **المريض يحجز**:
   - المريض يرى الأطباء الذين يقدمون الخدمة المطلوبة
   - يحجز موعد مع الطبيب والخدمة المحددة

### مثال على الاستخدام

#### 1. إنشاء خدمة في قسم
```bash
POST /v1/admin/services
Authorization: Bearer <admin_token>
{
  "name": "استشارة عامة",
  "departmentId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "description": "استشارة طبية عامة",
  "defaultPrice": 100,
  "defaultDurationMin": 30,
  "isActive": true
}
```

#### 2. عرض تفاصيل القسم مع الخدمات
```bash
GET /v1/admin/departments/64f1a2b3c4d5e6f7g8h9i0j1/details
Authorization: Bearer <admin_token>
```

#### 3. عرض الخدمات في قسم محدد
```bash
GET /v1/admin/services?departmentId=64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <admin_token>
```