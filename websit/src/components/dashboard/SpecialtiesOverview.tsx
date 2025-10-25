'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Stethoscope, Users, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { specialtyService } from '@/lib/api/specialties';
import { useRouter } from 'next/navigation';

export const SpecialtiesOverview: React.FC = () => {
  const router = useRouter();
  
  // الحصول على التخصصات من API
  const { data: specialties, isLoading, error } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtyService.getSpecialties(),
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            التخصصات المتاحة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل التخصصات...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            التخصصات المتاحة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">حدث خطأ في تحميل التخصصات</p>
            <Button onClick={() => window.location.reload()}>
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          التخصصات المتاحة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specialties?.slice(0, 6).map((specialty) => (
            <div key={(specialty as any)._id || (specialty as any).id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {specialty.icon && (
                    <img 
                      src={specialty.icon} 
                      alt={specialty.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  <h3 className="font-semibold text-sm">{specialty.name}</h3>
                </div>
                <Badge variant={specialty.isActive ? 'default' : 'secondary'}>
                  {specialty.isActive ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{(specialty as any).doctors?.length || 0} طبيب</span>
                </div>
              </div>

              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => router.push(`/specialties/${(specialty as any)._id || (specialty as any).id}`)}
                >
                  عرض التفاصيل
                </Button>
                <Button 
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => router.push(`/appointments/new?specialtyId=${(specialty as any)._id || (specialty as any).id}`)}
                >
                  حجز موعد
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            variant="outline"
            onClick={() => router.push('/specialties')}
          >
            عرض جميع التخصصات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
