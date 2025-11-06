'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnimatedCard } from '@/components/animations/AnimatedCard';
import { StarIcon, MapPinIcon, ClockIcon, PhoneIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { doctorsService } from '@/lib/api/doctors';

export const DoctorsList: React.FC = () => {
  const router = useRouter();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // الحصول على الأطباء من API
  const { data: doctors, isLoading, error } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorsService.getDoctors(),
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });

  const specialties = ['all', ...Array.from(new Set(doctors?.map(doctor => doctor.specialization) || []))];

  const filteredDoctors = doctors?.filter(doctor => {
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialization === selectedSpecialty;
    const doctorName = `${doctor.user.profile.firstName} ${doctor.user.profile.lastName}`;
    const matchesSearch = doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل الأطباء...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">حدث خطأ في تحميل الأطباء</p>
            <Button onClick={() => window.location.reload()}>
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            فريق الأطباء المتخصصين
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            تعرف على فريقنا من الأطباء المتخصصين ذوي الخبرة العالية والكفاءة المهنية
          </p>
        </div>

        {/* فلاتر البحث */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="w-full md:w-96 relative">
              <input
                type="text"
                placeholder="ابحث عن طبيب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedSpecialty === specialty
                      ? 'gradient-medical text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {specialty === 'all' ? 'جميع التخصصات' : specialty}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doctor, index) => (
            <AnimatedCard 
              key={doctor.id} 
              delay={index * 0.1}
              className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => router.push(`/doctors/${doctor.id}`)}
            >
              <div className="text-center">
                <div className="w-24 h-24 rounded-full gradient-medical-light flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
                  {doctor.avatar ? (
                    <img src={doctor.avatar} alt={doctor.user.profile.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">👨‍⚕️</span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  د. {doctor.user.profile.firstName} {doctor.user.profile.lastName}
                </h3>
                
                <p className="text-primary-600 font-semibold mb-3">
                  {doctor.specialization || doctor.department?.name}
                </p>
                
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(4.5)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm font-semibold text-gray-700 mr-2">
                      4.5
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  {doctor.clinic?.name && (
                    <div className="flex items-center justify-center">
                      <MapPinIcon className="w-4 h-4 ml-2 text-primary-500" />
                      <span>{doctor.clinic.name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center">
                    <ClockIcon className="w-4 h-4 ml-2 text-secondary-500" />
                    <span>{doctor.experience} سنة خبرة</span>
                  </div>
                  {doctor.consultationFee > 0 && (
                    <div className="flex items-center justify-center">
                      <PhoneIcon className="w-4 h-4 ml-2 text-success-500" />
                      <span className="font-semibold text-primary-600">{doctor.consultationFee} ريال</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-2 border-primary-500 text-primary-600 hover:bg-primary-50"
                    disabled={!doctor.isAvailable}
                    onClick={() => {
                      if (doctor.isAvailable) {
                        router.push(`/appointments/new?doctorId=${doctor.id}`);
                      }
                    }}
                  >
                    {doctor.isAvailable ? 'احجز موعد' : 'غير متاح'}
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 gradient-medical text-white hover:opacity-90"
                    onClick={() => router.push(`/doctors/${doctor.id}`)}
                  >
                    الملف الشخصي
                  </Button>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لم يتم العثور على أطباء</p>
          </div>
        )}
      </div>
    </section>
  );
};
