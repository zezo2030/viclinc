'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { SendIcon, PhoneIcon, MailIcon, MapPinIcon, ClockIcon } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

const contactSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف يجب أن يكون على الأقل 10 أرقام'),
  subject: z.string().min(5, 'الموضوع يجب أن يكون على الأقل 5 أحرف'),
  message: z.string().min(10, 'الرسالة يجب أن تكون على الأقل 10 أحرف'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', data);
      alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            تواصل معنا
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            نحن هنا لمساعدتك. تواصل معنا لأي استفسارات أو طلبات
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* نموذج التواصل */}
          <Card className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              أرسل لنا رسالة
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل *
                  </label>
                  <Input
                    {...register('name')}
                    placeholder="أدخل اسمك الكامل"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <Input
                    type="email"
                    {...register('email')}
                    placeholder="example@email.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف *
                </label>
                <Input
                  type="tel"
                  {...register('phone')}
                  placeholder="+966 50 123 4567"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموضوع *
                </label>
                <Input
                  {...register('subject')}
                  placeholder="موضوع الرسالة"
                  className={errors.subject ? 'border-red-500' : ''}
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرسالة *
                </label>
                <textarea
                  {...register('message')}
                  rows={5}
                  placeholder="اكتب رسالتك هنا..."
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gradient-medical text-white hover:opacity-90 shadow-md"
              >
                <SendIcon className="w-5 h-5 ml-2" />
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </Button>
            </form>
          </Card>

          {/* معلومات التواصل */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                معلومات التواصل
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4 space-x-reverse p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 gradient-medical-light rounded-full flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">الهاتف</h4>
                    <a href={`tel:${CONTACT_INFO.phone}`} className="text-primary-600 hover:text-primary-700 font-medium">{CONTACT_INFO.phone}</a>
                  </div>
                </div>

                <div className="flex items-start space-x-4 space-x-reverse p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 gradient-medical-light rounded-full flex items-center justify-center flex-shrink-0">
                    <MailIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">البريد الإلكتروني</h4>
                    <a href={`mailto:${CONTACT_INFO.email}`} className="text-primary-600 hover:text-primary-700 font-medium">{CONTACT_INFO.email}</a>
                  </div>
                </div>

                <div className="flex items-start space-x-4 space-x-reverse p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 gradient-medical-light rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">العنوان</h4>
                    <p className="text-gray-600">{CONTACT_INFO.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 space-x-reverse p-4 bg-white rounded-xl hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 gradient-medical-light rounded-full flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">ساعات العمل</h4>
                    <p className="text-gray-600">الأحد - الخميس: 8:00 ص - 6:00 م</p>
                    <p className="text-gray-600">الجمعة - السبت: 9:00 ص - 2:00 م</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="gradient-medical-light p-6 rounded-xl border-2 border-primary-100">
              <h4 className="font-bold text-gray-900 mb-3">الرد السريع</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                نحن نرد على جميع الاستفسارات خلال 24 ساعة في أيام العمل. 
                للطوارئ، يرجى الاتصال بنا مباشرة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
