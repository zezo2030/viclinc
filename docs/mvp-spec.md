## مواصفات MVP لنظام إدارة العيادة (NestJS + Mongo + Docker)

### 1) نطاق عام
- عيادة واحدة، أدوار: Admin, Doctor, Patient.
- البريد والهاتف فريدان على مستوى النظام.
- حذف الحساب: تعطيل ثم طلب حذف نهائي للأدمن.

### 2) الهوية والتسجيل والدخول
- المريض: تسجيل بنفسه (name, email, phone, password). تحقق عدم تكرار الإيميل/الهاتف.
- الطبيب: ينشئه الأدمن فقط، يبدأ بحالة Pending ثم Approved.
- الأدمن: بيانات افتراضية من .env، دخول بكلمة مرور، خيار 2FA لاحقاً.
- جلسات JWT (Access/Refresh) + إدارة أجهزة لاحقاً.

### 3) الصلاحيات (RBAC)
- Admin: إدارة الأقسام، الخدمات، الأطباء، الجداول، المواعيد، التقارير، login-as.
- Doctor: تعديل ملفه وخدماته وأسعاره، جدوله، تأكيد/رفض المواعيد، إنشاء سجلات طبية.
- Patient: التصفح والحجز والإلغاء ضمن المهلة، التقييمات، الاطلاع على سجلاته الطبية.

### 4) الأقسام والخدمات والتسعير
- 11 قسم (ستُزود لاحقاً) وكل قسم يحتوي خدماته.
- لكل طبيب سعر/مدة مخصّصان للخدمة، مع افتراضات على مستوى الخدمة.

### 5) الجدولة والحجوزات (مضاف للـ MVP)
- ميزات:
  - قوالب أسبوعية لساعات العمل + استثناءات ليوم محدد + عطلات.
  - Buffers قبل/بعد الموعد (عام أو حسب الخدمة).
  - منع التداخل لنفس الطبيب والفتحة، مع السماح بالحجز لنفس الوقت مع طبيب آخر.
  - حجز مؤقت Hold بمدة (TTL) قبل الدفع/التأكيد.
  - Idempotency-Key للحجز ومنع التكرارات.
  - غرفة انتظار افتراضية للفيديو.
  - نقل الموعد لطبيب بديل بموافقة المريض.
- قواعد عمل:
  - VIDEO/CHAT يتطلبان دفعاً Online (Stub الآن)، ثم تأكيد الطبيب.
  - إلغاء/إعادة جدولة من المريض > 24 ساعة فقط؛ ≤ 24 ساعة مرفوض.
  - أفق الحجز الأسبوع الحالي (7 أيام).
- فهارس:
  - appointments: فريد جزئي (doctorId, startAt) للحالات النشطة.
  - appointments: TTL على holdExpiresAt لتنظيف الحجوزات المؤقتة.
  - appointments: فريد جزئي على idempotencyKey عند وجوده.
- واجهات مختصرة:
  - GET /v1/patient/doctors/:id/availability?serviceId=&weekStart=
  - POST /v1/patient/appointments (Header: Idempotency-Key)
  - POST /v1/doctor/appointments/:id/confirm | /reject
  - POST /v1/admin/appointments/:id/transfer {toDoctorId}
  - POST /v1/patient/appointments/:id/reschedule {startAt}

### 6) الدردشة والفيديو (مضاف للـ MVP)
- مزود الفيديو: Agora. توليد توكن عند الطلب بحسب الدور.
- غرفة انتظار قبل بدء الجلسة.
- دردشة داخل التطبيق بمدة صلاحية حسب الخدمة، مع أرشفة اختيارية.
- مكافحة إساءة: Rate limit، تبليغ/حظر.
- واجهات:
  - POST /v1/sessions/video/token {appointmentId, role}
  - GET /v1/sessions/chat/:appointmentId
  - GET /v1/sessions/chat/:appointmentId/messages?cursor=
  - POST /v1/sessions/chat/:appointmentId/messages
  - POST /v1/sessions/chat/:appointmentId/archive
  - POST /v1/sessions/chat/:appointmentId/report {reason}

### 7) الملف الطبي (مضاف للـ MVP)
- سجلات طبية مع Versioning وتتبع عرض/تعديل (Audit).
- قوالب تشخيص وروشتة، مرفقات آمنة.
- صلاحيات: الطبيب يرى/ينشئ لمرضاه؛ المريض يرى سجلاته فقط؛ الأدمن مدقق وصول.
- واجهات:
  - POST /v1/doctor/records
  - PATCH /v1/doctor/records/:id (زيادة version)
  - GET /v1/patient/records
  - GET /v1/doctor/records/:patientId
- فهارس:
  - medicalRecords: (patientId, updatedAt) و(doctorId, updatedAt)
  - medicalRecordAudit: (recordId, at)

### 8) لوحة الإدارة والتشغيل (مضاف للـ MVP)
- لوحة تشغيل: إشغال الأطباء، عدد الحجوزات، نسب الإلغاء، No‑Show.
- انتحال جلسة "Login as" مع Audit.
- استيراد/تصدير أقسام/خدمات CSV/JSON.
- مهام مجدولة: تذكيرات، تنظيف Holds، إقفال دردشات منتهية، تقارير أسبوعية.
- واجهات:
  - GET /v1/admin/metrics/overview?date=
  - GET /v1/admin/appointments?status=&doctorId=&date=
  - POST /v1/admin/login-as {userId}
  - POST /v1/admin/departments:import | GET /v1/admin/departments:export
  - POST /v1/admin/services:import | GET /v1/admin/services:export

### 9) الدفع والفوترة
- Stub الآن مع نية دفع Payment Intent وWebhook لاحقاً.
- فواتير/إيصالات PDF لاحقاً، كوبونات لاحقاً.

### 10) الإشعارات (TODO)
- SMS عبر Twilio لاحقاً. تذكيرات T-24h وT-1h.

### 11) الأمان
- JWT + قيود معدل على /auth/login.
- Hash كلمات المرور (Argon2/Bcrypt).
- CORS مضبوط، Audit للأحداث الحساسة.

### 12) i18n والتوقيت
- عربي أولاً، دعم i18n للقوالب.
- تخزين UTC وعرض حسب منطقة المستخدم.

### 13) البنية التحتية
- Docker Compose: api + mongo + redis (+ mailhog dev).
- نسخ احتياطي Mongo واختبار الاسترجاع لاحقاً.

### 14) Seed واختبارات
- Seed: 11 قسم + خدمات نموذجية + أدمن افتراضي.
- اختبارات: تسجيل/دخول، إنشاء طبيب واعتماده، تدفق الحجز، توليد توكن Agora، منع التداخل.

### 15) فهارس أساسية (تلخيص)
- users: email فريد، phone فريد.
- doctors/patients profiles: userId فريد.
- appointments: (doctorId, startAt) فريد جزئي + TTL على holdExpiresAt.
- chatMessages: (sessionId, createdAt).
- medicalRecords: (patientId, updatedAt) و(doctorId, updatedAt).

### 16) Jobs/Crons
- تذكيرات المواعيد T-24h وT-1h.
- تنظيف الحجوزات المؤقتة.
- إقفال دردشات منتهية وأرشفتها.
- وضع No‑Show تلقائي بعد فترة سماح.
- جمع مؤشرات يومية للتقارير.


