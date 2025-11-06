# دليل الإصلاح السريع - خطأ 405

## المشكلة
❌ خطأ 405 (Not Allowed) عند إضافة قسم جديد من الداشبورد

## الحل السريع

### 1️⃣ إعادة بناء وتشغيل Docker

```bash
# إيقاف الخدمات
docker-compose down

# إعادة البناء والتشغيل
docker-compose up --build -d

# أو للتطوير
docker-compose -f docker-compose.dev.yml up --build
```

### 2️⃣ تسجيل الدخول

1. افتح: `http://localhost:3002`
2. استخدم:
   - Email: `admin@clinic.com`
   - Password: `password123`

### 3️⃣ جرّب إضافة قسم

1. اذهب لصفحة "الأقسام"
2. اضغط "إضافة قسم جديد"
3. املأ البيانات واضغط "إنشاء"

## ✅ يجب أن يعمل الآن!

---

## 🔧 إذا لم يعمل

### تحقق من logs:
```bash
docker logs virclinc-admin-dashboard-1
docker logs virclinc-api-1
```

### تحقق من الخدمات:
```bash
docker ps
```

يجب أن ترى:
- ✅ `virclinc-api-1` (port 3000)
- ✅ `virclinc-admin-dashboard-1` (port 3002)
- ✅ `virclinc-mongo-1` (port 27017)

### تحقق من التوكن:
1. F12 → Application → Local Storage
2. تأكد من وجود `access_token` (وليس `mock-admin-token`)

---

## 📝 ما تم إصلاحه؟

1. ✅ nginx الآن يحول طلبات API للباك إند
2. ✅ دعم CORS و OPTIONS requests
3. ✅ استخدام JWT token حقيقي
4. ✅ ربط الخدمات في شبكة Docker واحدة

---

## 📚 للتفاصيل الكاملة
راجع: `FIX_405_ERROR_README.md`










