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
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-gray-600 text-lg">لا توجد أقسام</p>
          <p className="text-gray-500 text-sm">ابدأ بإضافة قسم جديد</p>
          {onCreateClick && (
            <button
              onClick={onCreateClick}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              إضافة قسم
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {departments.map((d) => (
        <div key={d.id}>{renderItem(d)}</div>
      ))}
    </div>
  )
}


