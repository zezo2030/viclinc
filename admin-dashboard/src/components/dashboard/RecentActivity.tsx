
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@clinic/shared';
import { Card, CardHeader, CardContent } from '@clinic/shared';
import { Badge } from '@clinic/shared';
import { 
  User, 
  Calendar, 
  DollarSign, 
  Shield,
  Clock
} from 'lucide-react';

export function RecentActivity() {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => adminService.getAuditLogs({ limit: 5 }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="النشاط الأخير" />
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 space-x-reverse animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'LOGIN_AS':
      case 'LOGOUT_AS':
        return Shield;
      case 'UPDATE_USER_ROLE':
      case 'UPDATE_USER_STATUS':
        return User;
      case 'UPDATE_APPOINTMENT_STATUS':
        return Calendar;
      case 'EXPORT_DATA':
      case 'IMPORT_DATA':
        return DollarSign;
      default:
        return Clock;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'LOGIN_AS':
        return 'blue';
      case 'LOGOUT_AS':
        return 'red';
      case 'UPDATE_USER_ROLE':
      case 'UPDATE_USER_STATUS':
        return 'green';
      case 'EXPORT_DATA':
      case 'IMPORT_DATA':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const formatAction = (action: string) => {
    const actionMap: Record<string, string> = {
      'LOGIN_AS': 'تسجيل دخول كـ',
      'LOGOUT_AS': 'إنهاء تسجيل دخول',
      'UPDATE_USER_ROLE': 'تحديث دور المستخدم',
      'UPDATE_USER_STATUS': 'تحديث حالة المستخدم',
      'UPDATE_APPOINTMENT_STATUS': 'تحديث حالة الموعد',
      'EXPORT_DATA': 'تصدير البيانات',
      'IMPORT_DATA': 'استيراد البيانات',
      'VIEW_SENSITIVE_DATA': 'عرض بيانات حساسة',
    };
    return actionMap[action] || action;
  };

  return (
    <Card>
      <CardHeader title="النشاط الأخير" />
      <CardContent>
        <div className="space-y-4">
          {auditLogs?.auditLogs?.map((log: any, index: number) => {
            const Icon = getActivityIcon(log.action);
            const color = getActivityColor(log.action);
            
            return (
              <div key={index} className="flex items-start space-x-3 space-x-reverse">
                <div className={`p-2 rounded-full bg-${color}-50 text-${color}-600`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {formatAction(log.action)}
                    </p>
                    <Badge variant={color === 'blue' ? 'info' : color === 'green' ? 'success' : 'default'}>
                      {log.success ? 'نجح' : 'فشل'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    بواسطة {log.adminName} • {new Date(log.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                  {log.targetUserName && (
                    <p className="text-xs text-gray-400 mt-1">
                      المستخدم المستهدف: {log.targetUserName}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
