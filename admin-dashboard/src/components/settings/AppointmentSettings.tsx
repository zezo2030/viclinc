import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateSettings } from '@/hooks/useSettings'
import { appointmentSettingsSchema } from '@/validations/settings.validation'
import type { AppointmentSettings } from '@/types'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'

interface AppointmentSettingsProps {
  settings: AppointmentSettings
  onSaved?: () => void
}

export default function AppointmentSettings({ settings, onSaved }: AppointmentSettingsProps) {
  const updateMutation = useUpdateSettings()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<AppointmentSettings>({
    resolver: zodResolver(appointmentSettingsSchema),
    defaultValues: settings,
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'reminderOffsets',
  })

  const defaultDurationMinutes = watch('defaultDurationMinutes')
  const cancellationWindowHours = watch('cancellationWindowHours')

  // Reset form when settings change
  useEffect(() => {
    reset(settings)
  }, [settings, reset])

  const onSubmit = async (data: AppointmentSettings) => {
    try {
      await updateMutation.mutateAsync({
        appointments: data,
      })
      toast.success('تم حفظ إعدادات المواعيد بنجاح')
      onSaved?.()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل حفظ الإعدادات')
    }
  }

  const handleReset = () => {
    reset(settings)
  }

  const handleAddReminder = () => {
    // Add a new reminder offset (default 24 hours)
    append(24)
  }

  const isChanged = isDirty

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Default Duration */}
        <div>
          <label htmlFor="defaultDurationMinutes" className="block text-sm font-medium text-gray-700 mb-2">
            مدة الموعد الافتراضية (بالدقائق) <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <input
              id="defaultDurationMinutes"
              type="range"
              min="15"
              max="240"
              step="15"
              {...register('defaultDurationMinutes', { valueAsNumber: true })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>15 دقيقة</span>
              <div className="text-center">
                <div className="text-lg font-semibold text-primary-600">{defaultDurationMinutes} دقيقة</div>
                <div className="text-xs">({(defaultDurationMinutes / 60).toFixed(1)} ساعة)</div>
              </div>
              <span>240 دقيقة (4 ساعات)</span>
            </div>
          </div>
          <input
            type="number"
            min="15"
            max="240"
            step="15"
            {...register('defaultDurationMinutes', { valueAsNumber: true })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all mt-3 ${
              errors.defaultDurationMinutes ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.defaultDurationMinutes && (
            <p className="mt-1 text-sm text-red-600">{errors.defaultDurationMinutes.message}</p>
          )}
        </div>

        {/* Cancellation Window */}
        <div>
          <label htmlFor="cancellationWindowHours" className="block text-sm font-medium text-gray-700 mb-2">
            نافذة الإلغاء (بعدد الساعات) <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <input
              id="cancellationWindowHours"
              type="range"
              min="0"
              max="168"
              step="1"
              {...register('cancellationWindowHours', { valueAsNumber: true })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>0 ساعة</span>
              <div className="text-center">
                <div className="text-lg font-semibold text-primary-600">{cancellationWindowHours} ساعة</div>
                <div className="text-xs">
                  {cancellationWindowHours >= 24
                    ? `(${Math.floor(cancellationWindowHours / 24)} يوم)`
                    : cancellationWindowHours > 0
                      ? `(${Math.floor(cancellationWindowHours)} ساعة)`
                      : '(فوري)'}
                </div>
              </div>
              <span>168 ساعة (أسبوع)</span>
            </div>
          </div>
          <input
            type="number"
            min="0"
            max="168"
            step="1"
            {...register('cancellationWindowHours', { valueAsNumber: true })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all mt-3 ${
              errors.cancellationWindowHours ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.cancellationWindowHours && (
            <p className="mt-1 text-sm text-red-600">{errors.cancellationWindowHours.message}</p>
          )}
        </div>

        {/* Allow Reschedule */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register('allowReschedule')}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                السماح للمرضى بإعادة جدولة المواعيد
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                إذا كان مفعلاً، يمكن للمرضى تغيير مواعيدهم المحددة
              </div>
            </div>
          </label>
        </div>

        {/* Reminder Offsets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            أوقات التذكير بالمواعيد (بالساعات)
          </label>
          <div className="space-y-3">
            {fields.length > 0 ? (
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      {...register(`reminderOffsets.${index}` as const, { valueAsNumber: true })}
                      className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                        errors.reminderOffsets?.[index] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="عدد الساعات"
                    />
                    <span className="text-sm text-gray-600">ساعة</span>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                لا توجد تذكيرات محددة
              </div>
            )}

            {fields.length < 5 && (
              <button
                type="button"
                onClick={handleAddReminder}
                className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة تذكير
              </button>
            )}
          </div>
          {errors.reminderOffsets && (
            <p className="mt-1 text-sm text-red-600">
              {errors.reminderOffsets.root?.message || errors.reminderOffsets.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={updateMutation.isPending || !isChanged}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={!isChanged || updateMutation.isPending}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            إعادة الضبط
          </button>
        </div>
      </form>
    </div>
  )
}

