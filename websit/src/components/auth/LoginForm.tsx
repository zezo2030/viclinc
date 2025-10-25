'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/contexts/auth-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('يرجى إدخال بريد إلكتروني صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  className
}) => {
  const [error, setError] = useState<string>('');
  const { login, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data);
      onSuccess?.();
    } catch (error: any) {
      setError(error.message || 'حدث خطأ أثناء تسجيل الدخول');
    }
  };

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            تسجيل الدخول
          </h2>
          <p className="text-gray-600 text-center mt-2">
            أدخل بياناتك للوصول إلى حسابك
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="example@email.com"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="كلمة المرور"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
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
            {isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>
        </form>

        {onSwitchToRegister && (
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ليس لديك حساب؟{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                إنشاء حساب جديد
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
