'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnimatedCard } from '@/components/animations/AnimatedCard';
import { StarIcon, MapPinIcon, ClockIcon, PhoneIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { doctorsService } from '@/lib/api/doctors';

export const DoctorsList: React.FC = () => {
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
            <div className="w-full md:w-96">
              <input
                type="text"
                placeholder="ابحث عن طبيب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedSpecialty === specialty
                      ? 'bg-primary-600 text-white'
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
              className="p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  د. {doctor.user.profile.firstName} {doctor.user.profile.lastName}
                </h3>
                
                <p className="text-primary-600 font-medium mb-2">
                  {doctor.specialization}
                </p>
                
                <div className="flex items-center justify-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(4.5) // تقييم افتراضي
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 mr-2">
                      4.5
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center justify-center">
                    <MapPinIcon className="w-4 h-4 ml-2" />
                    <span>{doctor.clinic.name}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <ClockIcon className="w-4 h-4 ml-2" />
                    <span>{doctor.experience} سنة خبرة</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <PhoneIcon className="w-4 h-4 ml-2" />
                    <span>{doctor.consultationFee} ريال</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    disabled={!doctor.isAvailable}
                  >
                    {doctor.isAvailable ? 'احجز موعد' : 'غير متاح'}
                  </Button>
                  <Button size="sm" className="flex-1">
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
