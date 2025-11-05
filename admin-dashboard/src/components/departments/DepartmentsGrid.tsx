import type { Department } from '@/types/department.types'
import { Spinner } from '@/components/common/Spinner'

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
      <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 p-12 shadow-lg">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <Spinner size="lg" />
            <div className="absolute inset-0 animate-ping">
              <Spinner size="lg" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">جاري التحميل...</p>
            <p className="text-sm text-gray-500 mt-1">يرجى الانتظار</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 p-8 text-center shadow-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-200 mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xl font-bold text-red-800 mb-2">{error}</p>
        <p className="text-sm text-red-600 mb-4">حدث خطأ أثناء تحميل البيانات</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/30"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-white to-purple-50/30 border border-purple-100 p-12 shadow-lg">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100">
            <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 mb-2">لا توجد أقسام</p>
            <p className="text-gray-600 mb-6">ابدأ بإضافة أول قسم لعيادتك</p>
          </div>
          {onCreateClick && (
            <button
              onClick={onCreateClick}
              className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-xl shadow-purple-500/30 hover:shadow-2xl flex items-center gap-2"
            >
              <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">+</span>
              <span>إضافة قسم جديد</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {departments.map((d, index) => (
        <div 
          key={d.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {renderItem(d)}
        </div>
      ))}
    </div>
  )
}


