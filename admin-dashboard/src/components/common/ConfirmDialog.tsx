import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmButtonColor?: 'red' | 'blue' | 'green'
  isLoading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  confirmButtonColor = 'red',
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const confirmColorClasses = {
    red: 'bg-[#ef4444] hover:bg-[#dc2626] shadow-sm',
    blue: 'bg-[#6366f1] hover:bg-[#4f46e5] shadow-sm',
    green: 'bg-[#10b981] hover:bg-[#059669] shadow-sm',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden animate-slide-in-up">
        {/* Header */}
        <div className="relative px-6 py-5 bg-[#f8fafc] border-b border-[#e2e8f0]">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#ef4444] flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-[#0f172a]">{title}</h3>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-[#f8fafc] text-[#64748b] hover:text-[#0f172a] transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-[#64748b] leading-relaxed whitespace-pre-line">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] hover:border-[#6366f1] transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-150 ease-out shadow-sm hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${confirmColorClasses[confirmButtonColor]}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                جاري الحذف...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

