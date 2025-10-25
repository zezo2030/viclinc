# المرحلة 10: لوحة الإدارة والتشغيل

## الهدف
لوحة تشغيل، إدارة عمليات، استيراد/تصدير، login-as.

## النطاق
- مؤشرات: إشغال، حجوزات، إلغاء، No‑Show
- Import/Export للأقسام والخدمات
- Login-as مع Audit
- إدارة المستخدمين والأدوار
- إحصائيات الأداء والاستخدام

## القابل للتسليم

### 1. مؤشرات الأداء والإحصائيات
- `GET /v1/admin/metrics/overview` - نظرة عامة على المؤشرات
- `GET /v1/admin/metrics/appointments` - إحصائيات المواعيد
- `GET /v1/admin/metrics/doctors` - إحصائيات الأطباء
- `GET /v1/admin/metrics/patients` - إحصائيات المرضى
- `GET /v1/admin/metrics/revenue` - إحصائيات الإيرادات

### 2. إدارة المستخدمين والأدوار
- `GET /v1/admin/users` - قائمة المستخدمين
- `PATCH /v1/admin/users/:id/role` - تغيير دور المستخدم
- `PATCH /v1/admin/users/:id/status` - تفعيل/إلغاء تفعيل المستخدم
- `POST /v1/admin/login-as {userId}` - تسجيل دخول كـ مستخدم آخر

### 3. إدارة الأقسام والخدمات
- `POST /v1/admin/departments/import` - استيراد الأقسام
- `GET /v1/admin/departments/export` - تصدير الأقسام
- `POST /v1/admin/services/import` - استيراد الخدمات
- `GET /v1/admin/services/export` - تصدير الخدمات

### 4. إدارة الأطباء
- `GET /v1/admin/doctors` - قائمة الأطباء مع الفلاتر
- `PATCH /v1/admin/doctors/:id/status` - تغيير حالة الطبيب
- `GET /v1/admin/doctors/:id/schedule` - جدول الطبيب
- `GET /v1/admin/doctors/:id/appointments` - مواعيد الطبيب

### 5. إدارة المواعيد
- `GET /v1/admin/appointments` - قائمة المواعيد مع الفلاتر
- `PATCH /v1/admin/appointments/:id/status` - تغيير حالة الموعد
- `GET /v1/admin/appointments/conflicts` - تعارضات المواعيد

### 6. التقارير والتحليلات
- `GET /v1/admin/reports/daily` - تقرير يومي
- `GET /v1/admin/reports/weekly` - تقرير أسبوعي
- `GET /v1/admin/reports/monthly` - تقرير شهري
- `GET /v1/admin/reports/doctors-performance` - أداء الأطباء

### 7. إدارة النظام
- `GET /v1/admin/system/health` - صحة النظام
- `GET /v1/admin/system/logs` - سجلات النظام
- `POST /v1/admin/system/backup` - إنشاء نسخة احتياطية
- `GET /v1/admin/system/audit` - سجل التدقيق

## قاعدة البيانات/فهارس
- تجميعات Aggregations للإحصائيات
- فهارس للبحث والفلترة
- جداول التدقيق (Audit Tables)
- جداول النسخ الاحتياطية

## معايير القبول
- تقارير يومية صحيحة على نطاق أسبوع
- إمكانية استيراد/تصدير البيانات
- تسجيل جميع العمليات الحساسة
- واجهة سهلة الاستخدام للمديرين

## اختبارات
- أذونات المشرف
- تدقيق login-as
- دقة الإحصائيات
- أداء الاستعلامات المعقدة

## الواجهات المتأثرة
- لوحة تحكم الإدارة (Dashboard)
- صفحات إدارة المستخدمين
- صفحات التقارير والإحصائيات
- صفحات الاستيراد/التصدير

## المخاطر والتخفيف
- **أداء الاستعلامات المعقدة**: استخدام فهارس مناسبة وتجميع البيانات
- **أمان login-as**: تسجيل كامل للعمليات مع IP و timestamp
- **حجم البيانات**: تقسيم التقارير الكبيرة إلى صفحات
- **نسخ احتياطية**: تشفير النسخ وحفظها في مكان آمن
