
import { Card, CardHeader, CardContent } from '@clinic/shared';
import { 
  UserPlus, 
  UserCheck, 
  Calendar, 
  Download, 
  Upload, 
  FileText
} from 'lucide-react';

const actions = [
  {
    title: 'إضافة مستخدم جديد',
    description: 'إنشاء حساب مستخدم جديد',
    icon: UserPlus,
    href: '/admin/users/new',
    color: 'blue',
  },
  {
    title: 'اعتماد طبيب',
    description: 'مراجعة واعتماد طبيب جديد',
    icon: UserCheck,
    href: '/admin/doctors/pending',
    color: 'green',
  },
  {
    title: 'جدولة موعد',
    description: 'إنشاء موعد جديد',
    icon: Calendar,
    href: '/admin/appointments/new',
    color: 'purple',
  },
  {
    title: 'تصدير البيانات',
    description: 'تصدير البيانات بصيغة CSV',
    icon: Download,
    href: '/admin/import-export',
    color: 'orange',
  },
  {
    title: 'استيراد البيانات',
    description: 'استيراد البيانات من ملف',
    icon: Upload,
    href: '/admin/import-export',
    color: 'blue',
  },
  {
    title: 'تقرير يومي',
    description: 'إنشاء تقرير يومي',
    icon: FileText,
    href: '/admin/reports/daily',
    color: 'green',
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader title="الإجراءات السريعة" />
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className={`p-2 rounded-lg bg-${action.color}-50 text-${action.color}-600`}>
                <action.icon className="h-4 w-4" />
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-gray-900">{action.title}</p>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
