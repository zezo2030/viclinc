# نظام المصادقة (Authentication System)

## نظرة عامة

تم تطبيق نظام مصادقة كامل في التطبيق يربط بين الـ Backend والـ Frontend مع المميزات التالية:

## المكونات الرئيسية

### 1. Backend Authentication (NestJS)

#### الـ API Endpoints:
- `POST /auth/login` - تسجيل الدخول (لجميع المستخدمين)
- `POST /auth/register/patient` - تسجيل المرضى فقط
- `GET /auth/profile` - الحصول على بيانات المستخدم
- `POST /admin/doctors` - إضافة الأطباء (للأدمن فقط)

#### المكونات:
- **AuthController** - معالج طلبات المصادقة
- **AuthService** - منطق أعمال المصادقة
- **JwtStrategy** - إستراتيجية JWT
- **LocalStrategy** - إستراتيجية المصادقة المحلية
- **Auth Guards** - حماية المسارات

### 2. Frontend Authentication (Next.js + React)

#### المكونات الرئيسية:
- **AuthContext** - إدارة حالة المستخدم
- **AuthModal** - نافذة منبثقة للدخول/التسجيل
- **LoginForm** - نموذج تسجيل الدخول
- **RegisterForm** - نموذج إنشاء الحساب
- **ProtectedRoute** - حماية المسارات

#### الـ API Client:
- **apiClient** - عميل API مع إضافة JWT token تلقائياً
- **authApi** - دوال API للمصادقة

## كيفية العمل

### 1. تسجيل الدخول
1. المستخدم يدخل البريد الإلكتروني وكلمة المرور
2. يتم إرسال الطلب إلى `POST /auth/login`
3. الـ Backend يتحقق من البيانات ويعيد JWT token
4. الـ Frontend يحفظ التوكن في localStorage
5. يتم تحديث حالة المستخدم في AuthContext

### 2. حماية المسارات
1. **ProtectedRoute Component** يتحقق من حالة المستخدم
2. إذا لم يكن مصادق، يظهر رسالة أو AuthModal
3. إذا كان مصادق، يعرض المحتوى المحمي

### 3. إدارة التوكن
- يتم حفظ JWT token في localStorage
- يتم إضافته تلقائياً إلى headers في كل طلب API
- عند انتهاء صلاحية التوكن، يتم مسح البيانات وإعادة توجيه للدخول

## الملفات المهمة

### Frontend Files:
```
src/
├── lib/
│   ├── api/
│   │   ├── auth.ts          # Auth API functions
│   │   └── client.ts         # API client with JWT interceptor
│   └── contexts/
│       └── auth-context.tsx  # Auth context and provider
├── components/
│   └── auth/
│       ├── AuthModal.tsx     # Modal for login/register
│       ├── LoginForm.tsx     # Login form component
│       ├── RegisterForm.tsx  # Register form component
│       └── ProtectedRoute.tsx # Route protection component
└── app/
    ├── login/page.tsx        # Login page
    ├── register/page.tsx     # Register page
    ├── dashboard/page.tsx    # Protected dashboard page
    └── profile/page.tsx      # Protected profile page
```

### Backend Files:
```
src/
├── modules/
│   └── auth/
│       ├── auth.controller.ts  # Auth endpoints
│       ├── auth.service.ts     # Auth business logic
│       ├── dto/
│       │   └── login.dto.ts    # Login DTO
│       └── strategies/
│           ├── jwt.strategy.ts # JWT strategy
│           └── local.strategy.ts # Local strategy
└── config/
    └── jwt.config.ts          # JWT configuration
```

## الاستخدام

### 1. في المكونات:
```tsx
import { useAuth } from '@/lib/contexts/auth-context';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>يرجى تسجيل الدخول</div>;
  }

  return (
    <div>
      <p>مرحباً {user?.name}</p>
      <button onClick={logout}>تسجيل الخروج</button>
    </div>
  );
}
```

### 2. حماية الصفحات:
```tsx
import { ProtectedRoute } from '@/components/auth';

export default function ProtectedPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div>محتوى محمي للمديرين فقط</div>
    </ProtectedRoute>
  );
}
```

### 3. استخدام API:
```tsx
import { authApi } from '@/lib/api/auth';

const handleLogin = async () => {
  try {
    const response = await authApi.login({
      email: 'user@example.com',
      password: 'password123'
    });
    console.log('تم تسجيل الدخول:', response.user);
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
  }
};
```

## نظام المستخدمين

### تسجيل المرضى
- ✅ **تسجيل المرضى مباشرة** من خلال الموقع
- ✅ **نموذج تسجيل مبسط** للمرضى فقط
- ✅ **توجيه تلقائي** إلى لوحة التحكم بعد التسجيل

### إدارة الأطباء
- ✅ **إضافة الأطباء من قبل الأدمن** في الباك إند
- ✅ **تسجيل دخول الأطباء** بحساباتهم المضافة
- ✅ **عدم إمكانية تسجيل الأطباء** مباشرة من الموقع

## المميزات

✅ **تسجيل دخول/خروج كامل**
✅ **إنشاء حساب للمرضى فقط**
✅ **حماية المسارات**
✅ **إدارة JWT tokens**
✅ **واجهة عربية كاملة**
✅ **تصميم متجاوب**
✅ **معالجة الأخطاء**
✅ **تحقق من صحة البيانات**
✅ **حفظ حالة المستخدم**
✅ **نظام أدوار منفصل** للمرضى والأطباء

## التطوير المستقبلي

🔄 **إضافة المزيد من المسارات المحمية**
🔄 **تطبيق نظام الأدوار والصلاحيات**
🔄 **إضافة خاصية تغيير كلمة المرور**
🔄 **إضافة المصادقة الثنائية**
🔄 **تحسين تجربة المستخدم**
🔄 **إضافة المزيد من التحققات الأمنية**

## التشغيل

1. تأكد من تشغيل الـ Backend server
2. شغل الـ Frontend development server
3. افتح المتصفح وجرب المصادقة

## ملاحظات مهمة

- يتم حفظ JWT token في localStorage لمدة 7 أيام
- يتم إضافة التوكن تلقائياً إلى كل طلب API
- عند انتهاء صلاحية التوكن، يتم إعادة توجيه المستخدم للدخول
- جميع النصوص والرسائل باللغة العربية
