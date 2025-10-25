'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ConsultationCard } from '@/components/consultation/ConsultationCard';
import { Plus, Search, Filter, Calendar } from 'lucide-react';
import { consultationService, Consultation } from '@/lib/api/consultations';
import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function ConsultationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: consultations, isLoading, error } = useQuery({
    queryKey: ['consultations', user?.id, user?.role],
    queryFn: () => {
      if (user?.role === 'PATIENT') {
        return consultationService.getConsultations(parseInt(user.id));
      } else if (user?.role === 'DOCTOR') {
        return consultationService.getConsultations(undefined, parseInt(user.id));
      }
      return consultationService.getConsultations();
    },
  });

  const filteredConsultations = consultations?.filter(consultation => {
    const matchesSearch = 
      consultation.appointment.patient.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.appointment.doctor.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || consultation.status === statusFilter;
    const matchesType = !typeFilter || consultation.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleJoinConsultation = (consultationId: number) => {
    router.push(`/consultations/${consultationId}`);
  };

  const handleViewConsultation = (consultationId: number) => {
    router.push(`/consultations/${consultationId}`);
  };

  const handleRateConsultation = (consultationId: number) => {
    router.push(`/consultations/${consultationId}?rate=true`);
  };

  const handleCreateConsultation = () => {
    router.push('/consultations/new');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p>جاري تحميل الاستشارات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-red-600">
            <p>حدث خطأ في تحميل الاستشارات</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">الاستشارات</h1>
              <p className="text-gray-600 mt-2">
                إدارة الاستشارات الطبية الافتراضية
              </p>
            </div>
            <Button
              onClick={handleCreateConsultation}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              استشارة جديدة
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في الاستشارات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">جميع الحالات</option>
              <option value="SCHEDULED">مجدولة</option>
              <option value="IN_PROGRESS">جارية</option>
              <option value="COMPLETED">مكتملة</option>
              <option value="CANCELLED">ملغية</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">جميع الأنواع</option>
              <option value="VIDEO">مكالمة فيديو</option>
              <option value="CHAT">دردشة</option>
            </select>

            <Button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setTypeFilter('');
              }}
              variant="outline"
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              مسح الفلاتر
            </Button>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">المجموع</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultations?.length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">جارية</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultations?.filter(c => c.status === 'IN_PROGRESS').length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">مكتملة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultations?.filter(c => c.status === 'COMPLETED').length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">مجدولة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultations?.filter(c => c.status === 'SCHEDULED').length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Consultations List */}
        {filteredConsultations && filteredConsultations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConsultations.map((consultation) => (
              <ConsultationCard
                key={consultation.id}
                consultation={consultation}
                onJoin={handleJoinConsultation}
                onView={handleViewConsultation}
                onRate={handleRateConsultation}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد استشارات
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter || typeFilter
                ? 'لم يتم العثور على استشارات تطابق معايير البحث'
                : 'لم يتم إنشاء أي استشارات بعد'}
            </p>
            <Button
              onClick={handleCreateConsultation}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              إنشاء استشارة جديدة
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
