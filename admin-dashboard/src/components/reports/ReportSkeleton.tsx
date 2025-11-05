import { Skeleton } from '@/components/common/Skeleton'

interface ReportSkeletonProps {
  showCharts?: boolean
}

export default function ReportSkeleton({ showCharts = false }: ReportSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* هيدر التقرير */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* بطاقات الملخص */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="mb-2 h-8 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      {/* الرسوم البيانية (اختياري) */}
      {showCharts && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <Skeleton className="mb-4 h-6 w-32" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <Skeleton className="mb-4 h-6 w-32" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      )}

      {/* الجدول */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[1, 2, 3, 4, 5].map((i) => (
                  <th key={i} className="p-4 text-right">
                    <Skeleton className="h-4 w-24" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row} className="border-b border-gray-100">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <td key={i} className="p-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}






