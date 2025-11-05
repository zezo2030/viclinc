import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateGeneralSettings, useRemoveLogo } from '@/hooks/useSettings'
import { generalSettingsSchema } from '@/validations/settings.validation'
import type { BrandingSettings, UpdateGeneralSettingsRequest } from '@/types'
import toast from 'react-hot-toast'

interface GeneralSettingsProps {
  settings: BrandingSettings
  onSaved?: () => void
}

// Get timezones using Intl API
const getTimezones = () => {
  try {
    return Intl.supportedValuesOf('timeZone')
  } catch (error) {
    // Fallback for browsers that don't support the API
    return [
      'Asia/Riyadh',
      'Africa/Cairo',
      'Europe/London',
      'America/New_York',
      'Asia/Dubai',
      'Asia/Kuala_Lumpur',
      'Australia/Sydney',
    ]
  }
}

export default function GeneralSettings({ settings, onSaved }: GeneralSettingsProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(settings.logoUrl)
  const [logoError, setLogoError] = useState<string | null>(null)
  const timezones = getTimezones()

  const updateMutation = useUpdateGeneralSettings()
  const removeLogoMutation = useRemoveLogo()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<BrandingSettings>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: settings,
  })

  const primaryColor = watch('primaryColor')

  // Reset form when settings change
  useEffect(() => {
    reset(settings)
    setPreviewUrl(settings.logoUrl)
    setLogoFile(null)
  }, [settings, reset])

  const onSubmit = async (data: BrandingSettings) => {
    try {
      const updateData: UpdateGeneralSettingsRequest = {
        appName: data.appName,
        primaryColor: data.primaryColor,
        defaultLanguage: data.defaultLanguage,
        timezone: data.timezone,
      }

      if (logoFile) {
        updateData.logo = logoFile
      }

      await updateMutation.mutateAsync(updateData)
      toast.success('تم حفظ الإعدادات العامة بنجاح')
      setLogoFile(null)
      onSaved?.()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل حفظ الإعدادات')
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setLogoError(null)

    if (!file) {
      setLogoFile(null)
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(settings.logoUrl)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setLogoError('الملف المختار ليس صورة')
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('حجم الصورة يتجاوز 2MB')
      return
    }

    setLogoFile(file)
    
    // Create preview URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleRemoveLogo = async () => {
    try {
      await removeLogoMutation.mutateAsync()
      setLogoFile(null)
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(undefined)
      toast.success('تم حذف الشعار بنجاح')
      onSaved?.()
    } catch (error: any) {
      toast.error('فشل حذف الشعار')
    }
  }

  const handleReset = () => {
    reset(settings)
    setLogoFile(null)
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(settings.logoUrl)
  }

  const isChanged = isDirty || logoFile !== null

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* App Name */}
        <div>
          <label htmlFor="appName" className="block text-sm font-medium text-gray-700 mb-2">
            اسم التطبيق <span className="text-red-500">*</span>
          </label>
          <input
            id="appName"
            type="text"
            {...register('appName')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
              errors.appName ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="أدخل اسم التطبيق"
          />
          {errors.appName && <p className="mt-1 text-sm text-red-600">{errors.appName.message}</p>}
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">شعار التطبيق</label>
          <div className="space-y-3">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleLogoChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
            {logoError && <p className="text-sm text-red-600">{logoError}</p>}

            {previewUrl && (
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img src={previewUrl} alt="Logo preview" className="w-full h-full object-contain" />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  disabled={removeLogoMutation.isPending}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 disabled:opacity-50"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Primary Color */}
        <div>
          <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
            اللون الأساسي
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              {...register('primaryColor')}
              className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
            <div className="flex-1">
              <input
                type="text"
                {...register('primaryColor')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                  errors.primaryColor ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="#2563eb"
              />
              {errors.primaryColor && <p className="mt-1 text-sm text-red-600">{errors.primaryColor.message}</p>}
            </div>
            {primaryColor && (
              <div
                className="w-12 h-12 rounded-lg border border-gray-300"
                style={{ backgroundColor: primaryColor }}
              />
            )}
          </div>
        </div>

        {/* Default Language */}
        <div>
          <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700 mb-2">
            اللغة الافتراضية <span className="text-red-500">*</span>
          </label>
          <select
            id="defaultLanguage"
            {...register('defaultLanguage')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
              errors.defaultLanguage ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>
          {errors.defaultLanguage && <p className="mt-1 text-sm text-red-600">{errors.defaultLanguage.message}</p>}
        </div>

        {/* Timezone */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
            المنطقة الزمنية <span className="text-red-500">*</span>
          </label>
          <select
            id="timezone"
            {...register('timezone')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
              errors.timezone ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          {errors.timezone && <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>}
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

