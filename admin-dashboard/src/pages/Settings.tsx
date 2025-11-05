import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { useSettings, useDraft, hasUnsavedChanges, clearAllDrafts } from '@/hooks/useSettings'
import GeneralSettings from '@/components/settings/GeneralSettings'
import AppointmentSettings from '@/components/settings/AppointmentSettings'
import PaymentSettings from '@/components/settings/PaymentSettings'
import NotificationSettings from '@/components/settings/NotificationSettings'
import { Settings, Globe, Calendar, CreditCard, Bell, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Skeleton } from '@/components/common/Skeleton'

type TabType = 'general' | 'appointments' | 'payments' | 'notifications'

const tabs: Array<{ id: TabType; label: string; icon: React.ElementType }> = [
  { id: 'general', label: 'الإعدادات العامة', icon: Globe },
  { id: 'appointments', label: 'مواعيد', icon: Calendar },
  { id: 'payments', label: 'مدفوعات', icon: CreditCard },
  { id: 'notifications', label: 'إشعارات', icon: Bell },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const { data: settings, isLoading, error } = useSettings()
  const [hasUnsaved, setHasUnsaved] = useState(false)

  // Check for unsaved changes periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setHasUnsaved(hasUnsavedChanges())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleTabChange = useCallback(
    (tabId: TabType) => {
      if (hasUnsaved) {
        const confirmed = confirm(
          'لديك تغييرات غير محفوظة. هل أنت متأكد من الانتقال؟ سيتم فقدان التغييرات غير المحفوظة.'
        )
        if (!confirmed) {
          return
        }
      }

      setActiveTab(tabId)
      // Clear unsaved flag after switching tabs
      setTimeout(() => setHasUnsaved(false), 100)
    },
    [hasUnsaved]
  )

  const handleSaved = useCallback(() => {
    // Clear all drafts when settings are saved
    clearAllDrafts()
    setHasUnsaved(false)
  }, [])

  if (isLoading) {
    return (
      <AdminLayout>
        <Breadcrumbs />
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
            <p className="mt-1 text-gray-600">إعدادات النظام والتطبيق</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Skeleton className="h-64" />
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <Breadcrumbs />
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
            <p className="mt-1 text-gray-600">إعدادات النظام والتطبيق</p>
          </div>
          <div className="bg-white rounded-lg border border-red-200 p-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">خطأ في تحميل الإعدادات</h3>
                <p className="text-sm mt-1">فشل في جلب بيانات الإعدادات. يرجى المحاولة مرة أخرى.</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!settings) {
    return null
  }

  return (
    <AdminLayout>
      <Breadcrumbs />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
        <p className="mt-1 text-gray-600">إعدادات النظام والتطبيق</p>
        {hasUnsaved && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>تغييرات غير محفوظة</span>
          </div>
        )}
      </div>

      {/* Last Updated Info */}
      {settings.updatedAt && (
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Settings className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">آخر تحديث</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {new Date(settings.updatedAt).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <GeneralSettings settings={settings.general} onSaved={handleSaved} />
          )}
          {activeTab === 'appointments' && (
            <AppointmentSettings settings={settings.appointments} onSaved={handleSaved} />
          )}
          {activeTab === 'payments' && (
            <PaymentSettings settings={settings.payments} onSaved={handleSaved} />
          )}
          {activeTab === 'notifications' && (
            <NotificationSettings settings={settings.notifications} onSaved={handleSaved} />
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

