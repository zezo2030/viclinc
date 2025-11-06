'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api/client';
import { Card } from '@/components/ui/Card';
import { 
  StethoscopeIcon, 
  HeartIcon, 
  BrainIcon, 
  BabyIcon,
  EyeIcon,
  BoneIcon,
  ActivityIcon,
  UserIcon
} from 'lucide-react';

interface Department {
  _id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  doctorCount?: number;
}

const departmentIcons: Record<string, any> = {
  'جراحة': StethoscopeIcon,
  'قلب': HeartIcon,
  'أعصاب': BrainIcon,
  'أطفال': BabyIcon,
  'عيون': EyeIcon,
  'عظام': BoneIcon,
  'باطنة': ActivityIcon,
  'default': UserIcon,
};

export const DepartmentsSection: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await apiClient.get<Department[]>('/departments/public');
        const activeDepartments = Array.isArray(response) 
          ? response.slice(0, 6) // API already returns only active departments
          : [];
        setDepartments(activeDepartments);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const getIcon = (name: string) => {
    for (const [key, Icon] of Object.entries(departmentIcons)) {
      if (name.includes(key)) {
        return Icon;
      }
    }
    return departmentIcons.default;
  };

  if (loading) {
    return (
      <section className="py-20 lg:py-32 gradient-medical-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-lg text-gray-600">جاري التحميل...</div>
          </div>
        </div>
      </section>
    );
  }

  if (departments.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-32 gradient-medical-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            أقسامنا الطبية
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نوفر مجموعة شاملة من التخصصات الطبية لتلبية جميع احتياجاتك الصحية
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department, index) => {
            const Icon = getIcon(department.name);
            
            return (
              <motion.div
                key={department._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/specialties/${department._id}`}>
                  <Card className="h-full p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group bg-white">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl gradient-medical flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        {department.logoUrl ? (
                          <img 
                            src={department.logoUrl} 
                            alt={department.name}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <Icon className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {department.name}
                        </h3>
                        {department.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {department.description}
                          </p>
                        )}
                        {department.doctorCount !== undefined && (
                          <div className="mt-3 text-sm text-primary-600 font-semibold">
                            {department.doctorCount} طبيب متخصص
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/specialties">
            <button className="px-8 py-3 gradient-medical text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md">
              عرض جميع الأقسام
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

