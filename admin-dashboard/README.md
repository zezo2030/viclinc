# لوحة الإدارة - نظام إدارة العيادة

لوحة إدارة شاملة لنظام إدارة العيادة مبنية بـ React + Vite.

## المميزات

- 🚀 **Vite** - أداة بناء سريعة وحديثة
- ⚛️ **React 18** - مكتبة واجهة المستخدم
- 🛣️ **React Router v6** - إدارة التوجيه
- 🎨 **Tailwind CSS** - إطار عمل CSS
- 📊 **Recharts** - مكتبة الرسوم البيانية
- 🔄 **React Query** - إدارة البيانات والحالة
- 🎭 **Framer Motion** - الرسوم المتحركة
- 🍞 **React Hot Toast** - إشعارات جميلة

## التطوير

### المتطلبات

- Node.js 18+
- npm أو yarn

### التثبيت

```bash
# تثبيت التبعيات
npm install

# تشغيل خادم التطوير
npm run dev

# بناء للإنتاج
npm run build

# معاينة البناء
npm run preview
```

### المتغيرات البيئية

إنشاء ملف `.env.local`:

```env
VITE_API_URL=http://localhost:3000/v1
VITE_SITE_URL=http://localhost:3002
VITE_SITE_NAME=Admin Dashboard
```

## البناء مع Docker

### التطوير

```bash
docker-compose -f docker-compose.dev.yml up admin-dashboard
```

### الإنتاج

```bash
docker-compose up admin-dashboard
```

## البنية

```
src/
├── components/          # المكونات القابلة لإعادة الاستخدام
│   ├── dashboard/       # مكونات لوحة التحكم
│   ├── layout/         # مكونات التخطيط
│   └── metrics/         # مكونات المقاييس
├── pages/              # صفحات التطبيق
│   ├── Dashboard.tsx   # الصفحة الرئيسية
│   └── Login.tsx       # صفحة تسجيل الدخول
├── App.tsx             # المكون الرئيسي
├── main.tsx           # نقطة الدخول
├── providers.tsx       # مقدمي الخدمة
└── index.css          # الأنماط العامة
```

## التوجيه

- `/` - لوحة التحكم الرئيسية (محمية)
- `/login` - صفحة تسجيل الدخول

## API Integration

يستخدم التطبيق nginx كـ reverse proxy للـ API calls:

- `/api/*` → `http://api:3000/v1/*`

## الأمان

- حماية الصفحات بـ `ProtectedRoute`
- تخزين التوكن في localStorage
- CORS headers مُعدة في nginx

## التطوير

```bash
# تشغيل التطوير
npm run dev

# فحص الأخطاء
npm run lint

# تشغيل الاختبارات
npm run test
```

## الإنتاج

```bash
# بناء التطبيق
npm run build

# معاينة البناء
npm run preview
```

## كيفية التشغيل:

### للتطوير:
```bash
cd admin-dashboard
npm install
npm run dev
```

ثم افتح المتصفح على: `http://localhost:3002`

### مع Docker:
```bash
docker-compose -f docker-compose.dev.yml up admin-dashboard
```

### للإنتاج:
```bash
docker-compose up admin-dashboard
```

## تسجيل الدخول:
- افتح `http://localhost:3002`
- أدخل أي بريد إلكتروني وكلمة مرور (مثل: admin@clinic.com / password)
- سيتم توجيهك إلى لوحة التحكم

## استكشاف الأخطاء:

### إذا ظهرت صفحة بيضاء:
1. افتح Developer Tools (F12)
2. تحقق من Console للأخطاء
3. تأكد من تحميل CSS و JS files في Network tab

### إذا لم يعمل التطبيق:
```bash
cd admin-dashboard
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## الدعم

للمساعدة والدعم، يرجى التواصل مع فريق التطوير.
