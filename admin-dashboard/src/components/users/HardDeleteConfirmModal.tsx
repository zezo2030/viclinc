import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import type { User } from '@/types/user.types'

interface HardDeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onConfirm: (payload: { 
    reason?: string; 
    purgeRelated?: boolean; 
    anonymize?: boolean 
  }) => Promise<void>
}

export default function HardDeleteConfirmModal({
  isOpen,
  onClose,
  user,
  onConfirm,
}: HardDeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [reason, setReason] = useState('')
  const [purgeRelated, setPurgeRelated] = useState(false)
  const [anonymize, setAnonymize] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isConfirmValid = confirmText === user.email

  const handleSubmit = async () => {
    if (!isConfirmValid) return

    setIsSubmitting(true)
    try {
      await onConfirm({ reason, purgeRelated, anonymize })
      handleClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    setReason('')
    setPurgeRelated(false)
    setAnonymize(true)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-900">تحذير: حذف نهائي</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-red-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ هذا الإجراء <strong>لا يمكن التراجع عنه</strong>!
            </p>
            <p className="text-sm text-red-700 mt-2">
              سيتم حذف المستخدم نهائياً من قاعدة البيانات. قد يؤثر ذلك على:
            </p>
            <ul className="text-sm text-red-700 mt-2 mr-4 list-disc space-y-1">
              <li>المواعيد المرتبطة</li>
              <li>السجلات الطبية</li>
              <li>الجلسات والمحادثات</li>
            </ul>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">المستخدم المراد حذفه:</p>
            <p className="font-bold text-gray-900 mt-1">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-xs text-gray-500 mt-1">الدور: {user.role}</p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              سبب الحذف (اختياري)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              rows={3}
              placeholder="اكتب سبب الحذف للمراجعة..."
              disabled={isSubmitting}
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={purgeRelated}
                onChange={(e) => setPurgeRelated(e.target.checked)}
                className="mt-1"
                disabled={isSubmitting}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">حذف البيانات المرتبطة</p>
                <p className="text-xs text-gray-600">حذف المواعيد والملفات المرتبطة</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={anonymize}
                onChange={(e) => setAnonymize(e.target.checked)}
                className="mt-1"
                disabled={isSubmitting}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">إخفاء الهوية بدلاً من الحذف</p>
                <p className="text-xs text-gray-600">للسجلات الطبية والبيانات الحساسة</p>
              </div>
            </label>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              للتأكيد، اكتب البريد الإلكتروني للمستخدم:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder={user.email}
              disabled={isSubmitting}
              dir="ltr"
            />
            {confirmText && !isConfirmValid && (
              <p className="text-xs text-red-600 mt-1">البريد الإلكتروني غير متطابق</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            disabled={isSubmitting}
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isConfirmValid || isSubmitting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'جاري الحذف...' : 'حذف نهائي'}
          </button>
        </div>
      </div>
    </div>
  )
}

