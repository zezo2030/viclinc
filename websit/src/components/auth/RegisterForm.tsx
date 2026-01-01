'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/contexts/auth-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  firstName: z.string().min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل'),
  lastName: z.string().min(2, 'الاسم الأخير يجب أن يكون حرفين على الأقل'),
  email: z.string().email('يرجى إدخال بريد إلكتروني صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string(),
  phone: z.string().min(1, 'رقم الهاتف مطلوب').regex(/^\+?[0-9]{6,15}$/, 'رقم الهاتف غير صحيح'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
}


export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
  className
}) => {
  const [error, setError] = useState<string>('');
  const [avatarError, setAvatarError] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const { register: registerUser, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarError('');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('صيغة الصورة غير مدعومة. يرجى اختيار JPG أو PNG أو WebP.');
      event.target.value = '';
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      setAvatarError('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت.');
      event.target.value = '';
      return;
    }

    setAvatarPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return URL.createObjectURL(file);
    });
    setAvatarFile(file);

    // السماح باختيار نفس الملف مجدداً
    event.target.value = '';
  };

  const clearAvatarSelection = () => {
    setAvatarError('');
    setAvatarFile(null);
    setAvatarPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      setAvatarError('');
      const { confirmPassword, firstName, lastName, ...restData } = data;
      
      await registerUser({ 
        firstName,
        lastName,
        email: restData.email,
        password: restData.password,
        phone: restData.phone,
        avatarFile,
      });
      onSuccess?.();
    } catch (error: any) {
      setError(error.message || 'حدث خطأ أثناء إنشاء الحساب');
    }
  };

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            إنشاء حساب جديد
          </h2>
          <p className="text-gray-600 text-center mt-2">
            أدخل بياناتك لإنشاء حساب جديد
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="الاسم الأول"
              type="text"
              placeholder="الاسم الأول"
              {...register('firstName')}
              error={errors.firstName?.message}
            />
            <Input
              label="الاسم الأخير"
              type="text"
              placeholder="الاسم الأخير"
              {...register('lastName')}
              error={errors.lastName?.message}
            />
          </div>

          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="example@email.com"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="رقم الهاتف"
            type="tel"
            placeholder="+966501234567"
            {...register('phone')}
            error={errors.phone?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الصورة الشخصية (اختياري)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="معاينة الصورة" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl" role="img" aria-label="Avatar placeholder">
                    🧑
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  اختر صورة
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
                {avatarFile && (
                  <button
                    type="button"
                    onClick={clearAvatarSelection}
                    className="block text-xs text-red-600 hover:underline"
                  >
                    إزالة الصورة
                  </button>
                )}
                <p className="text-xs text-gray-500">
                  يدعم JPG, PNG, WebP بحد أقصى 5 ميجابايت
                </p>
              </div>
            </div>
            {avatarError && (
              <p className="text-xs text-red-600 mt-2">{avatarError}</p>
            )}
          </div>


          <Input
            label="كلمة المرور"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />

          <Input
            label="تأكيد كلمة المرور"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
          </Button>
        </form>

        {onSwitchToLogin && (
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              لديك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                تسجيل الدخول
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
