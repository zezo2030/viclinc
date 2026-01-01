import type { Department } from '@/types/department.types'
import { Spinner } from '@/components/common/Spinner'
import { AlertCircle, Building2, Plus } from 'lucide-react'

interface DepartmentsGridProps {
  departments: Department[]
  isLoading?: boolean
  error?: string | null
  onCreateClick?: () => void
  renderItem: (dept: Department) => React.ReactNode
}

export default function DepartmentsGrid({
  departments,
  isLoading,
  error,
  onCreateClick,
  renderItem,
}: DepartmentsGridProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-white border border-[#e2e8f0] p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-6">
          <Spinner size="lg" />
          <div className="text-center">
            <p className="text-lg font-semibold text-[#0f172a]">جاري التحميل...</p>
            <p className="text-sm text-[#64748b] mt-1">يرجى الانتظار</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-[#ef4444]/5 border border-[#ef4444]/20 p-8 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-[#ef4444]/10 mb-4">
          <AlertCircle className="w-8 h-8 text-[#ef4444]" />
        </div>
        <p className="text-lg font-semibold text-[#ef4444] mb-2">{error}</p>
        <p className="text-sm text-[#64748b] mb-4">حدث خطأ أثناء تحميل البيانات</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#ef4444] text-white rounded-lg font-medium hover:scale-[1.02] transition-all duration-150 ease-out shadow-sm"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-[#e2e8f0] p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-[#6366f1]/10">
            <Building2 className="w-10 h-10 text-[#6366f1]" />
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-[#0f172a] mb-2">لا توجد أقسام</p>
            <p className="text-[#64748b] mb-6">ابدأ بإضافة أول قسم لعيادتك</p>
          </div>
          {onCreateClick && (
            <button
              onClick={onCreateClick}
              className="px-8 py-4 bg-[#6366f1] text-white rounded-lg font-medium hover:scale-[1.02] transition-all duration-150 ease-out shadow-sm flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة قسم جديد</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {departments.map((d) => (
        <div key={d.id}>
          {renderItem(d)}
        </div>
      ))}
    </div>
  )
}


