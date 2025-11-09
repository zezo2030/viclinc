# ميدفلو - صفحة هبوط تعريفية

صفحة هبوط عربية (RTL) احترافية لنظام إدارة العيادات "ميدفلو"، مصممة بأسلوب عصري مستوحى من tryorder.com.

## ✨ المميزات

### 🎨 التصميم
- تصميم عربي كامل (RTL) مع خط Cairo الجميل
- واجهة عصرية مستوحاة من tryorder.com
- ألوان مستخرجة من شعار ميدفلو
- تصميم متجاوب يعمل على جميع الأجهزة
- رسوم متحركة سلسة باستخدام Framer Motion

### 📋 الأقسام
1. **Header**: شريط علوي ثابت مع الشعار والتنقل وزر CTA
2. **Hero**: قسم البطل مع عنوان قوي وأزرار دعوة للإجراء
3. **Social Proof**: شارات الثقة والموثوقية
4. **Features**: 8 ميزات رئيسية مع أيقونات ووصف
5. **How It Works**: 4 خطوات لبدء استخدام النظام
6. **Integrations**: التكاملات مع بوابات الدفع وواتساب
7. **Testimonials**: شهادات العملاء مع carousel تفاعلي
8. **FAQ**: 8 أسئلة شائعة مع accordion
9. **CTA**: دعوة نهائية للإجراء
10. **Footer**: معلومات الاتصال والروابط

### 🎭 الحركة والتفاعل
- رسوم متحركة عند التمرير (scroll reveal)
- تأثيرات hover على البطاقات
- حركة parallax خفيفة في Hero
- انتقالات سلسة في carousel الشهادات
- accordion متحرك للأسئلة الشائعة
- دعم prefers-reduced-motion لتقليل الحركة

### 🔍 SEO وإمكانية الوصول
- Meta tags كاملة (title, description, keywords)
- Open Graph tags لمشاركة احترافية
- JSON-LD structured data
- Alt text عربي للصور
- تباين ألوان جيد
- دعم لوحة المفاتيح

## 🚀 التشغيل

### المتطلبات
- Node.js 18 أو أحدث
- npm أو yarn

### التثبيت
```bash
npm install
```

### التطوير
```bash
npm run dev
```
ثم افتح المتصفح على: http://localhost:5173

### البناء للإنتاج
```bash
npm run build
```

### معاينة البناء
```bash
npm run preview
```

## 📁 هيكل المشروع

```
whyUs/
├── public/
│   ├── medflow.png          # الشعار
│   └── images/
│       └── dashboard-mockup.png  # صورة لوحة التحكم
├── src/
│   ├── sections/            # مكونات الأقسام
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── SocialProof.jsx
│   │   ├── Features.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── Integrations.jsx
│   │   ├── Testimonials.jsx
│   │   ├── FAQ.jsx
│   │   ├── CTA.jsx
│   │   ├── Showcase.jsx
│   │   ├── DashboardGallery.jsx
│   │   └── Footer.jsx
│   ├── App.jsx              # المكون الرئيسي
│   ├── main.jsx
│   └── index.css            # Tailwind styles
├── index.html               # HTML الرئيسي مع SEO
├── tailwind.config.js       # إعدادات Tailwind
└── package.json
```

## 🎨 الألوان

### Primary (أزرق)
- 50: #e6f7ff
- 600: #1890ff (الرئيسي)
- 700: #096dd9

### Secondary (بنفسجي)
- 50: #f0f5ff
- 600: #2f54eb (الثانوي)
- 700: #1d39c4

## 📝 التخصيص

### تغيير رقم الواتساب
ابحث عن `966500000000` في جميع الملفات واستبدله برقمك.

### تغيير البريد الإلكتروني
ابحث عن `info@medflow.com` واستبدله ببريدك.

### تغيير المحتوى
جميع النصوص موجودة مباشرة في ملفات المكونات داخل `src/sections/`.

### إضافة صور حقيقية
1. أضف صورك في `public/images/`
2. حدّث المسارات في المكونات
3. تأكد من تحسين الصور للويب

## 🌐 النشر

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# ارفع مجلد dist
```

### GitHub Pages
```bash
npm run build
# ارفع مجلد dist
```

## 📱 التوافق

- ✅ Chrome, Edge, Safari, Firefox (آخر نسختين)
- ✅ iOS Safari, Chrome Mobile
- ✅ شاشات من 320px إلى 4K
- ✅ RTL كامل
- ✅ تجربة الموبايل أولاً

## 🔧 التقنيات المستخدمة

- **React 19** - مكتبة الواجهة
- **Vite** - أداة البناء
- **Tailwind CSS v4** - إطار CSS (مع @tailwindcss/vite)
- **Framer Motion** - رسوم متحركة
- **Google Fonts** - خط Cairo
- **الصور**
  - صور Pexels مجانية عالية الجودة للعيادات ولوحات التحكم (راجع `IMAGES_LICENSE.md` لكل رابط)
  - يمكن استبدال الروابط بسهولة بصورك الخاصة أو تحميلها إلى `public/images/`

## 📄 الترخيص

جميع الحقوق محفوظة © 2025 ميدفلو

## 🤝 الدعم

للأسئلة والدعم:
- واتساب: +966 50 000 0000
- البريد: info@medflow.com

---

**تم التطوير بـ ❤️ لميدفلو**
