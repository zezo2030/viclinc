# 🚀 دليل البدء السريع - ميدفلو

## خطوات التشغيل (5 دقائق)

### 1️⃣ افتح Terminal في المجلد
```bash
cd c:/Users/HP/Desktop/virclinc/new/whyUs
```

### 2️⃣ شغّل السيرفر
```bash
npm run dev
```

### 3️⃣ افتح المتصفح
```
http://localhost:5173
```

**🎉 تهانينا! الصفحة تعمل الآن**

---

## ⚙️ التخصيصات الضرورية (10 دقائق)

### 📱 رقم الواتساب
ابحث في المشروع عن: `966500000000`  
استبدله بـ: `966XXXXXXXXX` (رقمك الحقيقي)

**الملفات:**
- `src/sections/Header.jsx`
- `src/sections/Hero.jsx`
- `src/sections/HowItWorks.jsx`
- `src/sections/FAQ.jsx`
- `src/sections/CTA.jsx`
- `src/sections/Footer.jsx`

### 📧 البريد الإلكتروني
ابحث عن: `info@medflow.com`  
استبدله بـ: بريدك الحقيقي

**الملفات:**
- `src/sections/CTA.jsx`
- `src/sections/Footer.jsx`
- `index.html` (JSON-LD)

### 📞 رقم الهاتف
ابحث عن: `+966 50 000 0000`  
استبدله بـ: رقم هاتفك

**الملف:**
- `src/sections/Footer.jsx`

---

## 🎨 تخصيصات إضافية (اختياري)

### صور حقيقية
1. أضف صورة لوحة التحكم:
   - احفظها في: `public/images/dashboard-real.png`
   - عدّل في: `src/sections/Hero.jsx` السطر 94

2. أضف صور أخرى للميزات/الخطوات في `public/images/`

### الإحصائيات
عدّل في `src/sections/Hero.jsx` الأسطر 120-132:
```jsx
<div className="text-3xl font-bold text-primary-600">+500</div>
<div className="text-sm text-gray-600 mt-1">عيادة</div>
```
غيّر الأرقام حسب إحصائياتك الفعلية.

### الشهادات
عدّل في `src/sections/Testimonials.jsx` الأسطر 7-28:
- أضف/عدّل أسماء العملاء
- عدّل النصوص والتقييمات
- يمكنك إضافة صور حقيقية

---

## 🌐 النشر على الإنترنت

### Vercel (مجاني وسريع)
```bash
npm install -g vercel
vercel login
vercel
```

### Netlify
1. سجّل في netlify.com
2. اسحب مجلد `dist` بعد `npm run build`
3. انشر!

---

## 🆘 حل المشاكل الشائعة

### المشكلة: الصفحة لا تعمل
**الحل:**
```bash
npm install
npm run dev
```

### المشكلة: الألوان/الخطوط لا تظهر
**الحل:** امسح الذاكرة المؤقتة:
```bash
rm -rf node_modules/.vite
npm run dev
```

### المشكلة: الصور لا تظهر
**الحل:** تأكد أن الملفات في `public/images/`

---

## 📞 الدعم

إذا واجهتك أي مشكلة، راجع:
- `README.md` - دليل كامل
- `IMPLEMENTATION_SUMMARY.md` - ملخص التنفيذ

---

**🎉 استمتع بصفحة الهبوط الجديدة!**

