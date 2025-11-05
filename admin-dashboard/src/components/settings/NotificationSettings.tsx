import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateSettings } from '@/hooks/useSettings'
import { notificationSettingsSchema } from '@/validations/settings.validation'
import type { NotificationSettings, NotificationTemplate } from '@/types'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, Mail, MessageSquare, Bell, Check } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface NotificationSettingsProps {
  settings: NotificationSettings
  onSaved?: () => void
}

// Template Modal Component
interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template?: NotificationTemplate | null
  onSave: (template: NotificationTemplate) => void
  isSubmitting?: boolean
}

function TemplateModal({ isOpen, onClose, template, onSave, isSubmitting }: TemplateModalProps) {
  const [formData, setFormData] = useState<NotificationTemplate>(
    template || {
      id: '',
      name: '',
      subject: '',
      body: '',
      channel: 'email',
    }
  )

  useEffect(() => {
    if (template) {
      setFormData(template)
    } else {
      setFormData({
        id: '',
        name: '',
        subject: '',
        body: '',
        channel: 'email',
      })
    }
  }, [template, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const channelIcon = {
    email: <Mail className="w-5 h-5" />,
    sms: <MessageSquare className="w-5 h-5" />,
    push: <Bell className="w-5 h-5" />,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{template ? 'تعديل قالب' : 'إضافة قالب جديد'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isSubmitting}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم القالب</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Channel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">القناة</label>
            <select
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="email">البريد الإلكتروني</option>
              <option value="sms">رسالة نصية</option>
              <option value="push">إشعار فوري</option>
            </select>
          </div>

          {/* Subject (Email only) */}
          {formData.channel === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الموضوع</label>
              <input
                type="text"
                value={formData.subject || ''}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          )}

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المحتوى</label>
            <textarea
              rows={6}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              يمكنك استخدام المتغيرات مثل: {`{{doctorName}}, {{appointmentDate}}, {{departmentName}}`}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border" disabled={isSubmitting}>
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NotificationSettings({ settings, onSaved }: NotificationSettingsProps) {
  const updateMutation = useUpdateSettings()
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: settings,
  })

  const templates = watch('templates')
  const channels = watch('channels')

  // Reset form when settings change
  useEffect(() => {
    reset(settings)
  }, [settings, reset])

  const onSubmit = async (data: NotificationSettings) => {
    try {
      await updateMutation.mutateAsync({
        notifications: data,
      })
      toast.success('تم حفظ إعدادات الإشعارات بنجاح')
      onSaved?.()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل حفظ الإعدادات')
    }
  }

  const handleReset = () => {
    reset(settings)
  }

  const handleAddTemplate = (template: NotificationTemplate) => {
    const currentTemplates = templates || []
    if (editingTemplate) {
      // Update existing template
      const updated = currentTemplates.map((t) => (t.id === editingTemplate.id ? template : t))
      setValue('templates', updated, { shouldDirty: true })
    } else {
      // Add new template
      const newTemplate = { ...template, id: uuidv4() }
      setValue('templates', [...currentTemplates, newTemplate], { shouldDirty: true })
    }
    setIsTemplateModalOpen(false)
    setEditingTemplate(null)
  }

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template)
    setIsTemplateModalOpen(true)
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا القالب؟')) {
      const updated = (templates || []).filter((t) => t.id !== templateId)
      setValue('templates', updated, { shouldDirty: true })
      toast.success('تم حذف القالب')
    }
  }

  const handleChannelToggle = (channel: keyof typeof channels) => {
    setValue(`channels.${channel}` as any, !channels[channel], { shouldDirty: true })
  }

  const isChanged = isDirty

  const channelConfig = {
    email: { icon: Mail, label: 'البريد الإلكتروني', color: 'bg-blue-100 text-blue-700' },
    sms: { icon: MessageSquare, label: 'رسالة نصية', color: 'bg-green-100 text-green-700' },
    push: { icon: Bell, label: 'إشعار فوري', color: 'bg-purple-100 text-purple-700' },
    inApp: { icon: Check, label: 'إشعار في التطبيق', color: 'bg-orange-100 text-orange-700' },
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Notification Channels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">قنوات الإشعارات</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(channelConfig).map(([key, config]) => {
              const Icon = config.icon
              return (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    channels[key as keyof typeof channels]
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={channels[key as keyof typeof channels]}
                    onChange={() => handleChannelToggle(key as keyof typeof channels)}
                    className="w-5 h-5 text-primary-600 rounded"
                  />
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{config.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Sender Info (for email) */}
        {channels.email && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="defaultSenderEmail" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني للمرسل <span className="text-red-500">*</span>
              </label>
              <input
                id="defaultSenderEmail"
                type="email"
                {...register('defaultSenderEmail')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                  errors.defaultSenderEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="noreply@example.com"
              />
              {errors.defaultSenderEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.defaultSenderEmail.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="defaultSenderName" className="block text-sm font-medium text-gray-700 mb-2">
                اسم المرسل
              </label>
              <input
                id="defaultSenderName"
                type="text"
                {...register('defaultSenderName')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="نظام العيادة"
              />
            </div>
          </div>
        )}

        {/* SMS Provider */}
        {channels.sms && (
          <div>
            <label htmlFor="smsProvider" className="block text-sm font-medium text-gray-700 mb-2">
              مزود الرسائل النصية
            </label>
            <select
              id="smsProvider"
              {...register('smsProvider')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            >
              <option value="twilio">Twilio</option>
              <option value="vonage">Vonage</option>
              <option value="other">آخر</option>
            </select>
          </div>
        )}

        {/* Notification Templates */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">قوالب الإشعارات</label>
            {templates && templates.length < 20 && (
              <button
                type="button"
                onClick={() => {
                  setEditingTemplate(null)
                  setIsTemplateModalOpen(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة قالب
              </button>
            )}
          </div>

          {templates && templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {channelConfig[template.channel].icon({ className: 'w-3 h-3' })}
                        {channelConfig[template.channel].label}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditTemplate(template)}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {template.subject && (
                    <p className="text-sm text-gray-600 font-medium mb-1">{template.subject}</p>
                  )}
                  <p className="text-sm text-gray-500 line-clamp-2">{template.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">لا توجد قوالب محددة</p>
              <button
                type="button"
                onClick={() => {
                  setEditingTemplate(null)
                  setIsTemplateModalOpen(true)
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة قالب
              </button>
            </div>
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

      {/* Template Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => {
          setIsTemplateModalOpen(false)
          setEditingTemplate(null)
        }}
        template={editingTemplate}
        onSave={handleAddTemplate}
        isSubmitting={false}
      />
    </div>
  )
}

