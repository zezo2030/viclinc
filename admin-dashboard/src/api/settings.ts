import apiClient from './client'
import type {
  SystemSettings,
  UpdateSettingsRequest,
  UpdateGeneralSettingsRequest,
} from '../types'

// Mock data as fallback when backend is not available
const mockSettings: SystemSettings = {
  general: {
    appName: 'نظام العيادة الذكي',
    logoUrl: undefined,
    primaryColor: '#2563eb',
    defaultLanguage: 'ar',
    timezone: 'Asia/Riyadh',
  },
  appointments: {
    defaultDurationMinutes: 30,
    cancellationWindowHours: 24,
    allowReschedule: true,
    reminderOffsets: [24, 2],
  },
  payments: {
    defaultCurrency: 'SAR',
    provider: 'stripe',
    providerConfig: {},
    processingFeePercent: 2.5,
    enableRefunds: true,
  },
  notifications: {
    channels: {
      email: true,
      sms: true,
      push: true,
      inApp: true,
    },
    templates: [
      {
        id: '1',
        name: 'إشعار موعد جديد',
        subject: 'موعد جديد مع د. {{doctorName}}',
        body: 'تم حجز موعد جديد مع {{doctorName}} في {{departmentName}} بتاريخ {{appointmentDate}}',
        channel: 'email',
      },
      {
        id: '2',
        name: 'تذكير بالموعد',
        subject: 'تذكير: موعدك غداً',
        body: 'تذكير: لديك موعد مع {{doctorName}} غداً الساعة {{appointmentTime}}',
        channel: 'sms',
      },
      {
        id: '3',
        name: 'إلغاء موعد',
        subject: 'تم إلغاء موعدك',
        body: 'تم إلغاء موعدك مع {{doctorName}} بتاريخ {{appointmentDate}}',
        channel: 'push',
      },
    ],
    defaultSenderEmail: 'noreply@clinicsystem.com',
    defaultSenderName: 'نظام العيادة',
    smsProvider: 'twilio',
  },
  updatedAt: new Date().toISOString(),
  updatedBy: undefined,
}

// Helper function to load from localStorage or return mock
const loadSettingsFromStorage = (): SystemSettings => {
  try {
    const stored = localStorage.getItem('settings_data')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading settings from localStorage:', error)
  }
  return mockSettings
}

// Helper function to save to localStorage
const saveSettingsToStorage = (settings: SystemSettings): void => {
  try {
    localStorage.setItem('settings_data', JSON.stringify(settings))
  } catch (error) {
    console.error('Error saving settings to localStorage:', error)
  }
}

export const settingsApi = {
  // الحصول على جميع الإعدادات
  getSettings: async (): Promise<SystemSettings> => {
    try {
      const response = await apiClient.get('/admin/settings')
      // إذا كانت الاستجابة ناجحة، احفظها في localStorage
      if (response.data) {
        saveSettingsToStorage(response.data)
      }
      return response.data
    } catch (error) {
      // إذا فشل الطلب (مثل أن Backend غير متاح)، استخدم localStorage أو mock
      console.warn('Failed to fetch settings from API, using local storage or mock:', error)
      return loadSettingsFromStorage()
    }
  },

  // تحديث الإعدادات الجزئي
  updateSettings: async (data: UpdateSettingsRequest): Promise<SystemSettings> => {
    try {
      // محاولة الحفظ في Backend
      const response = await apiClient.patch('/admin/settings', data)
      if (response.data) {
        saveSettingsToStorage(response.data)
        return response.data
      }
      throw new Error('No data in response')
    } catch (error) {
      // إذا فشل، احفظ محلياً
      console.warn('Failed to update settings via API, saving locally:', error)
      const currentSettings = loadSettingsFromStorage()
      
      // دمج التحديثات مع الإعدادات الحالية
      const updatedSettings: SystemSettings = {
        ...currentSettings,
        general: data.general ? { ...currentSettings.general, ...data.general } : currentSettings.general,
        appointments: data.appointments
          ? { ...currentSettings.appointments, ...data.appointments }
          : currentSettings.appointments,
        payments: data.payments ? { ...currentSettings.payments, ...data.payments } : currentSettings.payments,
        notifications: data.notifications
          ? {
              ...currentSettings.notifications,
              ...data.notifications,
              templates: data.notifications.templates || currentSettings.notifications.templates,
              channels: data.notifications.channels
                ? { ...currentSettings.notifications.channels, ...data.notifications.channels }
                : currentSettings.notifications.channels,
            }
          : currentSettings.notifications,
        updatedAt: new Date().toISOString(),
        updatedBy: JSON.parse(localStorage.getItem('user') || '{}').id,
      }

      saveSettingsToStorage(updatedSettings)
      return updatedSettings
    }
  },

  // تحديث الإعدادات العامة مع دعم رفع الشعار
  updateGeneralSettings: async (data: UpdateGeneralSettingsRequest): Promise<SystemSettings> => {
    try {
      // إذا كان هناك ملف شعار، استخدم FormData
      if (data.logo) {
        const formData = new FormData()
        Object.keys(data).forEach((key) => {
          if (key !== 'logo' && data[key as keyof UpdateGeneralSettingsRequest]) {
            formData.append(key, String(data[key as keyof UpdateGeneralSettingsRequest]))
          }
        })
        formData.append('logo', data.logo)

        const response = await apiClient.patch('/admin/settings/general', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        if (response.data) {
          saveSettingsToStorage(response.data)
          return response.data
        }
      } else {
        // بدون ملف، استخدم JSON
        const response = await apiClient.patch('/admin/settings/general', data)
        if (response.data) {
          saveSettingsToStorage(response.data)
          return response.data
        }
      }
      throw new Error('No data in response')
    } catch (error) {
      // إذا فشل، احفظ محلياً
      console.warn('Failed to update general settings via API, saving locally:', error)
      const currentSettings = loadSettingsFromStorage()

      // تحديث إعدادات الشعار
      let logoUrl = currentSettings.general.logoUrl
      if (data.logo) {
        // في حالة الـ mock، نُنشئ URL محلي للصورة
        logoUrl = URL.createObjectURL(data.logo)
      }

      const updatedSettings: SystemSettings = {
        ...currentSettings,
        general: {
          ...currentSettings.general,
          ...data,
          logoUrl,
        },
        updatedAt: new Date().toISOString(),
        updatedBy: JSON.parse(localStorage.getItem('user') || '{}').id,
      }

      saveSettingsToStorage(updatedSettings)
      return updatedSettings
    }
  },

  // مسح الشعار
  removeLogo: async (): Promise<SystemSettings> => {
    try {
      const response = await apiClient.delete('/admin/settings/general/logo')
      if (response.data) {
        saveSettingsToStorage(response.data)
        return response.data
      }
      throw new Error('No data in response')
    } catch (error) {
      console.warn('Failed to remove logo via API, saving locally:', error)
      const currentSettings = loadSettingsFromStorage()
      const updatedSettings: SystemSettings = {
        ...currentSettings,
        general: {
          ...currentSettings.general,
          logoUrl: undefined,
        },
        updatedAt: new Date().toISOString(),
      }
      saveSettingsToStorage(updatedSettings)
      return updatedSettings
    }
  },
}

