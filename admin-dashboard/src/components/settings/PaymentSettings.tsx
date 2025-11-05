import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateSettings } from '@/hooks/useSettings'
import { paymentSettingsSchema } from '@/validations/settings.validation'
import type { PaymentSettings } from '@/types'
import toast from 'react-hot-toast'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'

interface PaymentSettingsProps {
  settings: PaymentSettings
  onSaved?: () => void
}

export default function PaymentSettings({ settings, onSaved }: PaymentSettingsProps) {
  const updateMutation = useUpdateSettings()
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [providerConfigEntries, setProviderConfigEntries] = useState<Array<{ key: string; value: string }>>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<PaymentSettings>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: settings,
  })

  const selectedProvider = watch('provider')

  // Initialize provider config entries from settings
  useEffect(() => {
    const entries = Object.entries(settings.providerConfig || {}).map(([key, value]) => ({
      key,
      value: String(value),
    }))
    if (entries.length === 0) {
      entries.push({ key: '', value: '' })
    }
    setProviderConfigEntries(entries)
  }, [])

  // Reset form when settings change
  useEffect(() => {
    reset(settings)
    const entries = Object.entries(settings.providerConfig || {}).map(([key, value]) => ({
      key,
      value: String(value),
    }))
    if (entries.length === 0) {
      entries.push({ key: '', value: '' })
    }
    setProviderConfigEntries(entries)
  }, [settings, reset])

  // Update providerConfig when entries change
  const updateProviderConfig = () => {
    const config: Record<string, string> = {}
    providerConfigEntries.forEach((entry) => {
      if (entry.key && entry.value) {
        config[entry.key] = entry.value
      }
    })
    setValue('providerConfig', config, { shouldDirty: true })
  }

  const handleAddConfigEntry = () => {
    setProviderConfigEntries([...providerConfigEntries, { key: '', value: '' }])
  }

  const handleRemoveConfigEntry = (index: number) => {
    const updated = providerConfigEntries.filter((_, i) => i !== index)
    setProviderConfigEntries(updated)
    if (updated.length === 0) {
      updated.push({ key: '', value: '' })
    }
    updateProviderConfig()
  }

  const handleConfigKeyChange = (index: number, value: string) => {
    const updated = [...providerConfigEntries]
    updated[index].key = value
    setProviderConfigEntries(updated)
    updateProviderConfig()
  }

  const handleConfigValueChange = (index: number, value: string) => {
    const updated = [...providerConfigEntries]
    updated[index].value = value
    setProviderConfigEntries(updated)
    updateProviderConfig()
  }

  const toggleVisibility = (index: number) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(String(index))) {
      newVisible.delete(String(index))
    } else {
      newVisible.add(String(index))
    }
    setVisibleKeys(newVisible)
  }

  const onSubmit = async (data: PaymentSettings) => {
    try {
      await updateMutation.mutateAsync({
        payments: data,
      })
      toast.success('تم حفظ إعدادات الدفع بنجاح')
      onSaved?.()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل حفظ الإعدادات')
    }
  }

  const handleReset = () => {
    reset(settings)
    const entries = Object.entries(settings.providerConfig || {}).map(([key, value]) => ({
      key,
      value: String(value),
    }))
    if (entries.length === 0) {
      entries.push({ key: '', value: '' })
    }
    setProviderConfigEntries(entries)
    setVisibleKeys(new Set())
  }

  const isChanged = isDirty

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Default Currency */}
        <div>
          <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700 mb-2">
            العملة الافتراضية <span className="text-red-500">*</span>
          </label>
          <select
            id="defaultCurrency"
            {...register('defaultCurrency')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
              errors.defaultCurrency ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="SAR">ريال سعودي (SAR)</option>
            <option value="USD">دولار أمريكي (USD)</option>
            <option value="EUR">يورو (EUR)</option>
            <option value="GBP">جنيه إسترليني (GBP)</option>
            <option value="AED">درهم إماراتي (AED)</option>
          </select>
          {errors.defaultCurrency && <p className="mt-1 text-sm text-red-600">{errors.defaultCurrency.message}</p>}
        </div>

        {/* Payment Provider */}
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
            مزود الدفع <span className="text-red-500">*</span>
          </label>
          <select
            id="provider"
            {...register('provider')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
              errors.provider ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="tap">Tap Payments</option>
            <option value="manual">يدوي (Manual)</option>
          </select>
          {errors.provider && <p className="mt-1 text-sm text-red-600">{errors.provider.message}</p>}
        </div>

        {/* Provider Config */}
        {selectedProvider !== 'manual' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">مفاتيح API</label>
            <div className="space-y-3">
              {providerConfigEntries.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={entry.key}
                    onChange={(e) => handleConfigKeyChange(index, e.target.value)}
                    placeholder="اسم المفتاح (مثال: apiKey)"
                    className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                  <div className="flex-1 relative">
                    <input
                      type={visibleKeys.has(String(index)) ? 'text' : 'password'}
                      value={entry.value}
                      onChange={(e) => handleConfigValueChange(index, e.target.value)}
                      placeholder="قيمة المفتاح"
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility(index)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    >
                      {visibleKeys.has(String(index)) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveConfigEntry(index)}
                    disabled={providerConfigEntries.length === 1}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddConfigEntry}
                className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة مفتاح
              </button>
            </div>
            {errors.providerConfig && <p className="mt-1 text-sm text-red-600">{errors.providerConfig.message}</p>}
          </div>
        )}

        {/* Processing Fee */}
        <div>
          <label htmlFor="processingFeePercent" className="block text-sm font-medium text-gray-700 mb-2">
            نسبة رسوم المعالجة (%)
          </label>
          <input
            id="processingFeePercent"
            type="number"
            min="0"
            max="100"
            step="0.1"
            {...register('processingFeePercent', { valueAsNumber: true })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
              errors.processingFeePercent ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="2.5"
          />
          {errors.processingFeePercent && (
            <p className="mt-1 text-sm text-red-600">{errors.processingFeePercent.message}</p>
          )}
        </div>

        {/* Enable Refunds */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register('enableRefunds')}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">تفعيل المرتجعات</div>
              <div className="text-xs text-gray-500 mt-0.5">السماح بإرجاع الأموال للمرضى</div>
            </div>
          </label>
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

