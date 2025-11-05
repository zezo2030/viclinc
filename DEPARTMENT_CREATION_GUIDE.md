# دليل إنشاء قسم جديد - استكشاف الأخطاء

## ✅ التحقق من جاهزية النظام

### 1. قاعدة البيانات جاهزة ✅
```bash
# عدد الأقسام الحالية: 12 قسم
docker exec new-mongo-1 mongosh clinic --eval "db.departments.countDocuments()"
```

### 2. المخطط (Schema) صحيح ✅
القسم يحتاج فقط:
- ✅ `name` (مطلوب، 2 حروف على الأقل، فريد)
- ⚪ `description` (اختياري)
- ⚪ `logoPath` (اختياري - يُحفظ تلقائياً عند رفع صورة)
- ⚪ `isActive` (اختياري - افتراضي `true`)

### 3. الـ API تعمل ✅
```
✅ POST /v1/admin/departments - إنشاء قسم
✅ GET /v1/admin/departments - عرض الأقسام
✅ PATCH /v1/admin/departments/:id - تعديل قسم
✅ DELETE /v1/admin/departments/:id - حذف قسم
```

---

## 🔍 الأخطاء الشائعة وحلولها

### ❌ خطأ 1: "Department name already exists"

**السبب:** اسم القسم موجود مسبقاً (الأسماء يجب أن تكون فريدة)

**الحل:**
1. تحقق من الأقسام الموجودة:
```bash
docker exec new-mongo-1 mongosh clinic --eval "db.departments.find({}, {name: 1}).pretty()"
```

2. استخدم اسم مختلف أو احذف القسم القديم

---

### ❌ خطأ 2: "Unauthorized" (401)

**السبب:** لم تسجل الدخول أو انتهت صلاحية التوكن

**الحل:**
1. افتح Developer Tools (F12) → Application → Local Storage
2. تحقق من وجود `access_token`
3. إذا كان غير موجود أو قديم:
   - سجل الخروج
   - سجل الدخول مرة أخرى بـ:
     - Email: `admin@clinic.com`
     - Password: `password123`

---

### ❌ خطأ 3: "Admin only" (403)

**السبب:** المستخدم ليس لديه صلاحيات أدمن

**الحل:**
1. تحقق من role في Local Storage
2. يجب أن يكون `user_role = "ADMIN"`
3. إذا لم يكن كذلك، سجل دخول بحساب أدمن

---

### ❌ خطأ 4: "name must be longer than or equal to 2 characters"

**السبب:** اسم القسم أقل من حرفين

**الحل:**
- أدخل اسم قسم لا يقل عن حرفين
- مثال صحيح: "القلب"، "الأطفال"، "الجراحة"

---

### ❌ خطأ 5: خطأ في رفع الصورة

**الأسباب المحتملة:**
1. حجم الصورة أكبر من 2MB
2. نوع الملف غير مدعوم
3. مجلد uploads غير موجود

**الحل:**
```bash
# 1. تحقق من مجلد uploads
docker exec new-api-1 sh -c "ls -la uploads/sections/logos"

# 2. إنشاء المجلد إذا لم يكن موجوداً
docker exec new-api-1 sh -c "mkdir -p uploads/sections/logos && chmod 777 uploads/sections/logos"

# 3. تحقق من حجم الصورة (يجب أن تكون أقل من 2MB)
# 4. استخدم صيغ مدعومة: JPEG, PNG, WebP
```

---

### ❌ خطأ 6: "Cannot connect to API"

**السبب:** nginx لا يحول الطلبات للـ API

**الحل:**
```bash
# 1. تحقق من أن الـ containers تعمل
docker ps

# يجب أن ترى:
# - new-api-1 (Up)
# - new-admin-dashboard-1 (Up)
# - new-mongo-1 (Up)

# 2. إذا كانت متوقفة، أعد تشغيلها
docker-compose up -d

# 3. تحقق من nginx logs
docker logs new-admin-dashboard-1 --tail=20
```

---

## 🎯 خطوات إنشاء قسم بنجاح

### الطريقة 1: بدون صورة (سريعة) ✅

1. افتح `http://localhost:3002`
2. سجل الدخول:
   - Email: `admin@clinic.com`
   - Password: `password123`
3. اذهب لصفحة "الأقسام"
4. اضغط "إضافة قسم جديد"
5. املأ:
   - **اسم القسم**: "قسم الأسنان" (مثال)
   - **الوصف**: "قسم متخصص في علاج وتجميل الأسنان" (اختياري)
   - **الحالة**: نشط ✓
6. اضغط "إنشاء القسم"

**✅ يجب أن يظهر: "تم إنشاء القسم بنجاح"**

---

### الطريقة 2: مع صورة ✅

1. نفس الخطوات السابقة
2. بالإضافة:
   - **الشعار**: اضغط على منطقة الرفع
   - اختر صورة (JPEG/PNG/WebP، أقل من 2MB)
   - يجب أن ترى معاينة الصورة
3. اضغط "إنشاء القسم"

**✅ يجب أن يظهر القسم مع الصورة**

---

## 🧪 اختبار من Swagger

إذا لم يعمل من الداشبورد، جرب من Swagger:

1. افتح `http://localhost:3000/api-docs`
2. اذهب لـ `Admin - Departments`
3. جرب `POST /v1/admin/departments`
4. اضغط "Try it out"
5. أدخل:
```json
{
  "name": "قسم الجلدية",
  "description": "قسم متخصص في أمراض الجلد",
  "isActive": true
}
```
6. اضغط "Execute"

**إذا عمل من Swagger ولم يعمل من الداشبورد:**
- المشكلة في Frontend (الداشبورد)
- راجع Console في Developer Tools

**إذا لم يعمل من Swagger أيضاً:**
- المشكلة في Backend (API)
- راجع logs:
```bash
docker logs new-api-1 --tail=100
```

---

## 📋 البيانات المطلوبة لإنشاء القسم

### حد أدنى (Minimum):
```json
{
  "name": "اسم القسم"
}
```

### كامل (Full):
```json
{
  "name": "قسم العيون",
  "description": "قسم متخصص في طب وجراحة العيون",
  "isActive": true
}
```

### مع صورة (Multipart Form):
```
Content-Type: multipart/form-data

name: "قسم العيون"
description: "قسم متخصص في طب وجراحة العيون"
isActive: "true"
logo: [file: image.png]
```

---

## 🔧 استكشاف الأخطاء المتقدم

### عرض الطلب الكامل في Network Tab:

1. F12 → Network Tab
2. جرب إنشاء قسم
3. اضغط على الطلب
4. انظر في:
   - **Headers**: تحقق من Authorization header
   - **Payload**: تحقق من البيانات المرسلة
   - **Response**: اقرأ رسالة الخطأ

### أمثلة الأخطاء ورسائلها:

| رمز الخطأ | الرسالة | المعنى | الحل |
|-----------|---------|--------|------|
| 400 | "name is required" | لم تدخل اسم القسم | أدخل اسم القسم |
| 401 | "Unauthorized" | لم تسجل الدخول | سجل الدخول |
| 403 | "Admin only" | ليس لديك صلاحيات | استخدم حساب أدمن |
| 409 | "Department name already exists" | الاسم موجود | غيّر الاسم |
| 413 | "Payload too large" | الصورة كبيرة جداً | استخدم صورة أصغر |
| 500 | "Internal server error" | خطأ في السيرفر | راجع logs |

---

## 💡 نصائح

### ✅ افعل:
- استخدم أسماء وصفية وواضحة
- ارفع صور بحجم مناسب (< 500KB مثالي)
- استخدم صيغ مدعومة (JPEG, PNG)
- تأكد من تسجيل الدخول قبل الإضافة

### ❌ لا تفعل:
- لا تستخدم أسماء مكررة
- لا ترفع صور كبيرة جداً (> 2MB)
- لا تستخدم صيغ غير مدعومة (BMP, TIFF)
- لا تترك حقل الاسم فارغاً

---

## 🆘 إذا استمرت المشكلة

### 1. أعد تشغيل الـ containers:
```bash
docker-compose down
docker-compose up -d
```

### 2. امسح cache المتصفح:
- Ctrl + Shift + Delete
- امسح Cookies و Cache

### 3. جرب متصفح آخر:
- Chrome
- Firefox
- Edge

### 4. تحقق من logs:
```bash
# API logs
docker logs new-api-1 --tail=100 -f

# Dashboard logs
docker logs new-admin-dashboard-1 --tail=50

# MongoDB logs
docker logs new-mongo-1 --tail=50
```

### 5. تحقق من الاتصال:
```bash
# اختبر API مباشرة
curl -X GET http://localhost:3000/v1/health

# اختبر الداشبورد
curl -X GET http://localhost:3002
```

---

## 📊 الحالة الحالية

✅ **قاعدة البيانات**: جاهزة (12 قسم موجود)  
✅ **الـ API**: تعمل بنجاح  
✅ **الداشبورد**: تعمل بنجاح  
✅ **nginx**: تعمل بدون أخطاء  
✅ **Schema**: صحيح ويدعم جميع الحقول  
✅ **Validation**: مفعّلة وتعمل  

**كل شيء جاهز! 🎉**

إذا واجهت خطأ محدد، أخبرني بـ:
1. رسالة الخطأ الكاملة (من Console أو Network Tab)
2. ماذا كتبت في الحقول
3. هل رفعت صورة أم لا

وسأساعدك في حله فوراً! 🚀








