# المرحلة الثامنة: نظام الجلسات (فيديو + دردشة)

## نظرة عامة
تم تنفيذ نظام الجلسات الكامل مع دعم جلسات الفيديو باستخدام Agora والدردشة الداخلية مع إدارة إعدادات Agora من لوحة الإدارة.

## المكونات المنفذة

### 1. نظام إدارة الإعدادات (Settings Management)
- **الملفات**: `src/modules/settings/`
- **الميزات**:
  - إدارة إعدادات Agora من لوحة الإدارة
  - تشفير بيانات Agora الحساسة
  - اختبار الاتصال مع Agora
  - واجهات API للأدمن

**Endpoints**:
- `GET /v1/admin/settings/agora` - جلب إعدادات Agora
- `PATCH /v1/admin/settings/agora` - تحديث إعدادات Agora  
- `POST /v1/admin/settings/agora/test` - اختبار الاتصال

### 2. نظام جلسات الفيديو (Video Sessions)
- **الملفات**: `src/modules/sessions/`
- **الميزات**:
  - توليد توكنات Agora آمنة
  - غرفة انتظار (T-10m check)
  - إدارة المشاركين
  - إنهاء الجلسات

**Endpoints**:
- `POST /v1/sessions/video/token` - توليد توكن للانضمام
- `GET /v1/sessions/video/:appointmentId` - معلومات الجلسة
- `POST /v1/sessions/video/:appointmentId/end` - إنهاء الجلسة
- `POST /v1/sessions/video/:appointmentId/join` - الانضمام للجلسة
- `POST /v1/sessions/video/:appointmentId/leave` - مغادرة الجلسة

### 3. نظام الدردشة الداخلية (Chat System)
- **الملفات**: `src/modules/sessions/`
- **الميزات**:
  - دردشة نصية مع انتهاء صلاحية
  - Rate limiting (10 رسائل/دقيقة)
  - أرشفة الدردشات
  - نظام التبليغ عن الإساءة

**Endpoints**:
- `GET /v1/sessions/chat/:appointmentId` - معلومات جلسة الدردشة
- `GET /v1/sessions/chat/:appointmentId/messages` - جلب الرسائل
- `POST /v1/sessions/chat/:appointmentId/messages` - إرسال رسالة
- `POST /v1/sessions/chat/:appointmentId/read` - تحديد الرسائل كمقروءة
- `GET /v1/sessions/chat/:appointmentId/unread-count` - عدد الرسائل غير المقروءة
- `POST /v1/sessions/chat/:appointmentId/archive` - أرشفة الدردشة
- `POST /v1/sessions/chat/:appointmentId/report` - تبليغ عن إساءة

## قاعدة البيانات

### Schemas الجديدة
1. **SystemSettings** - إعدادات النظام
2. **VideoSession** - جلسات الفيديو
3. **ChatSession** - جلسات الدردشة
4. **ChatMessage** - رسائل الدردشة

### الفهارس المضافة
- فهارس فريدة على appointmentId للجلسات
- TTL indexes لانتهاء صلاحية الدردشة
- فهارس للاستعلامات السريعة

## الأمان والحماية

### 1. تشفير البيانات الحساسة
- تشفير شهادات Agora باستخدام AES-256-GCM
- إخفاء البيانات الحساسة في الاستجابات

### 2. التحقق من الصلاحيات
- Guards للتحقق من صلاحيات الوصول للجلسات
- فحص الأدوار (طبيب/مريض) قبل الوصول

### 3. Rate Limiting
- حد أقصى 10 رسائل في الدقيقة للدردشة
- حماية من إساءة الاستخدام

### 4. غرفة الانتظار
- منع الدخول قبل 10 دقائق من موعد الجلسة
- رسائل خطأ واضحة للمستخدمين

## التكامل مع النظام

### 1. ربط مع Appointments
- إضافة حقل `sessionId` لـ Appointment schema
- ربط الجلسات بالمواعيد المؤكدة

### 2. دعم أنواع المواعيد
- فحص نوع الموعد (VIDEO/CHAT) قبل إنشاء الجلسة
- دعم المواعيد المختلطة

## متغيرات البيئة المطلوبة

```env
# تشفير البيانات الحساسة
ENCRYPTION_KEY=your-32-character-encryption-key-here

# إعدادات Agora (يمكن إدارتها من الداشبورد)
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-app-certificate
```

## أمثلة الاستخدام

### 1. إعداد Agora من لوحة الإدارة
```bash
# تحديث إعدادات Agora
PATCH /v1/admin/settings/agora
{
  "appId": "your-app-id",
  "appCertificate": "your-app-certificate",
  "tokenExpirationTime": 3600,
  "isEnabled": true
}
```

### 2. طلب توكن فيديو
```bash
# طلب توكن للطبيب
POST /v1/sessions/video/token
{
  "appointmentId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "role": "doctor"
}
```

### 3. إرسال رسالة دردشة
```bash
# إرسال رسالة
POST /v1/sessions/chat/64f1a2b3c4d5e6f7g8h9i0j1/messages
{
  "content": "Hello, how are you feeling today?",
  "type": "text"
}
```

## الاختبارات

### اختبارات الوحدة
- AgoraService: توليد التوكنات
- VideoSessionService: إدارة الجلسات
- ChatService: إرسال واستقبال الرسائل

### اختبارات التكامل
- تدفق إنشاء جلسة فيديو كاملة
- تدفق الدردشة مع Rate limiting
- اختبار غرفة الانتظار

## معايير القبول المحققة

✅ الأدمن يستطيع إضافة/تحديث إعدادات Agora من الداشبورد  
✅ لا يمكن توليد توكن فيديو قبل T-10m من الموعد  
✅ الدردشة تنتهي صلاحيتها تلقائياً حسب مدة الخدمة  
✅ Rate limiting يعمل على إرسال الرسائل  
✅ فقط طبيب ومريض الموعد يستطيعون الوصول للجلسة  
✅ بيانات Agora الحساسة مشفرة في قاعدة البيانات  

## الخطوات التالية

1. **الاختبارات**: كتابة اختبارات Unit وE2E شاملة
2. **المراقبة**: إضافة logs وmetrics للجلسات
3. **التحسين**: تحسين الأداء للجلسات المتزامنة
4. **التوثيق**: إضافة أمثلة API مفصلة
