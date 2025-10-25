# لوحة الإدارة - نظام إدارة العيادة

## نظرة عامة

تم تنفيذ المرحلة 10 من نظام إدارة العيادة والتي تشمل لوحة إدارة شاملة مع جميع الميزات المطلوبة. تم فصل لوحة الإدارة عن الموقع الرئيسي وإنشاء نظام Monorepo لإدارة المشاريع.

## البنية المعمارية

### Backend (clinic-api)
- **AdminModule**: وحدة منفصلة لإدارة العمليات الإدارية
- **MetricsService**: خدمة الإحصائيات والمؤشرات
- **UsersManagementService**: إدارة المستخدمين والأدوار
- **ImpersonationService**: نظام Login-as مع JWT منفصل
- **ImportExportService**: استيراد/تصدير البيانات (JSON/CSV)
- **ReportsService**: التقارير اليومية/الأسبوعية/الشهرية
- **AuditLoggerMiddleware**: تسجيل جميع العمليات الإدارية

### Frontend (Monorepo Structure)
```
├── websit/                 # الموقع الرئيسي (موجود مسبقاً)
├── admin-dashboard/        # لوحة الإدارة الجديدة
├── shared/                 # مكتبة مشتركة
└── package.json           # إدارة Monorepo
```

## الميزات المنجزة

### 1. Backend APIs

#### Metrics APIs
- `GET /v1/admin/metrics/overview` - نظرة عامة على المؤشرات
- `GET /v1/admin/metrics/appointments` - إحصائيات المواعيد
- `GET /v1/admin/metrics/doctors` - إحصائيات الأطباء
- `GET /v1/admin/metrics/patients` - إحصائيات المرضى
- `GET /v1/admin/metrics/revenue` - إحصائيات الإيرادات

#### Users Management APIs
- `GET /v1/admin/users` - قائمة المستخدمين
- `PATCH /v1/admin/users/:id/role` - تغيير دور المستخدم
- `PATCH /v1/admin/users/:id/status` - تفعيل/إلغاء تفعيل المستخدم

#### Impersonation APIs
- `POST /v1/admin/login-as` - تسجيل دخول كـ مستخدم آخر
- `POST /v1/admin/logout-as` - إنهاء تسجيل الدخول

#### Import/Export APIs
- `POST /v1/admin/departments/import` - استيراد الأقسام
- `GET /v1/admin/departments/export` - تصدير الأقسام
- `POST /v1/admin/services/import` - استيراد الخدمات
- `GET /v1/admin/services/export` - تصدير الخدمات

#### Reports APIs
- `GET /v1/admin/reports/daily` - تقرير يومي
- `GET /v1/admin/reports/weekly` - تقرير أسبوعي
- `GET /v1/admin/reports/monthly` - تقرير شهري
- `GET /v1/admin/reports/doctors-performance` - أداء الأطباء

#### System APIs
- `GET /v1/admin/system/health` - صحة النظام
- `GET /v1/admin/system/logs` - سجلات النظام
- `POST /v1/admin/system/backup` - إنشاء نسخة احتياطية
- `GET /v1/admin/system/audit` - سجل التدقيق

### 2. Frontend Dashboard

#### Layout Components
- **AdminLayout**: التخطيط الرئيسي للوحة الإدارة
- **AdminSidebar**: الشريط الجانبي مع التنقل
- **AdminHeader**: شريط الرأس مع البحث والإشعارات

#### Dashboard Components
- **MetricsOverview**: نظرة عامة على المؤشرات
- **MetricCard**: بطاقة مؤشر فردية
- **DashboardOverview**: لوحة المعلومات الرئيسية
- **AppointmentChart**: مخطط المواعيد
- **RevenueChart**: مخطط الإيرادات

#### Utility Components
- **QuickActions**: الإجراءات السريعة
- **RecentActivity**: النشاط الأخير
- **StatusBadge**: شارة الحالة

### 3. Shared Library

#### UI Components
- Button, Card, Badge, Modal, Table
- Form components with validation
- Chart components (Line, Bar, Pie)

#### API Services
- Centralized API client with interceptors
- Admin service with all endpoints
- Auth service for authentication

#### Types
- Admin types (User, Metrics, Audit, etc.)
- API response types
- Form validation types

## الأمان والحماية

### 1. Authentication & Authorization
- JWT tokens مع انتهاء صلاحية
- Role-based access control (RBAC)
- Admin-only endpoints protection

### 2. Impersonation Security
- JWT منفصل للـ Login-as
- تسجيل كامل لجميع عمليات الانتحال
- انتهاء صلاحية تلقائي للجلسات
- منع انتحال الأدمن الآخرين

### 3. Audit Logging
- تسجيل جميع العمليات الإدارية
- تتبع IP addresses و User agents
- تسجيل metadata للعمليات
- فهرسة للاستعلامات السريعة

## الأداء والتحسين

### 1. Database Optimization
- فهارس محسنة للاستعلامات المعقدة
- Aggregation pipelines للإحصائيات
- TTL indexes للبيانات المؤقتة

### 2. Caching Strategy
- Redis cache للمؤشرات
- Cache invalidation ذكي
- Session management

### 3. Frontend Optimization
- React Query للـ data fetching
- Lazy loading للمكونات
- Code splitting للـ bundles

## التثبيت والتشغيل

### 1. Backend Setup
```bash
cd clinic-api
npm install
npm run start:dev
```

### 2. Frontend Setup
```bash
# Install dependencies for all workspaces
npm install

# Start development servers
npm run dev

# Or start individually
npm run dev:website    # Port 3000
npm run dev:admin      # Port 3001
```

### 3. Build for Production
```bash
npm run build
npm run start
```

## البيئات

### Development
- Website: http://localhost:3000
- Admin Dashboard: http://localhost:3001/admin
- API: http://localhost:3000/v1

### Production
- Website: https://clinic.com
- Admin Dashboard: https://clinic.com/admin
- API: https://api.clinic.com/v1

## الاختبارات

### Backend Tests
```bash
cd clinic-api
npm run test
npm run test:e2e
```

### Frontend Tests
```bash
npm run test
```

## التوثيق

### API Documentation
- Swagger UI: http://localhost:3000/api/docs
- جميع الـ endpoints موثقة
- أمثلة للطلبات والاستجابات

### Component Documentation
- Storybook للـ components
- Props documentation
- Usage examples

## الصيانة والتطوير

### Monitoring
- Health checks للنظام
- Performance metrics
- Error tracking
- Audit logs

### Backup Strategy
- Automated database backups
- File system backups
- Disaster recovery plan

## المساهمة

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## الدعم

للحصول على الدعم، يرجى التواصل عبر:
- Email: support@clinic.com
- Documentation: https://docs.clinic.com
- Issues: GitHub Issues

---

**ملاحظة**: هذا المشروع جزء من نظام إدارة العيادة الشامل ويجب تشغيله مع باقي المكونات للحصول على تجربة كاملة.
