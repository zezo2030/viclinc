import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useDoctorsPerformance } from '@/hooks/useReports'
import { useQuery } from '@tanstack/react-query'
import { departmentsApi } from '@/api/departments'
import ReportSkeleton from './ReportSkeleton'
import ExportButtons from './ExportButtons'
import { Filter, Calendar, Award } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/utils/format'
import type { DoctorsPerformanceParams, Department } from '@/types'

export default function DoctorsPerformanceReport() {
  const [filters, setFilters] = useState<DoctorsPerformanceParams>({
    limit: 10,
  })
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<keyof any>('totalAppointments')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const { data, isLoading, error } = useDoctorsPerformance(filters)
  
  // تحميل الأقسام للفلتر
  const { data: departments } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll(),
  })

  const handleFilterChange = (key: keyof DoctorsPerformanceParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }

  const handleSort = (column: keyof any) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  // ترتيب البيانات
  const sortedDoctors = data?.doctors
    ? [...data.doctors].sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    : []

  // إعداد بيانات التصدير
  const exportHeaders = ['الطبيب', 'القسم', 'المواعيد الكلية', 'المكتملة', 'الإيرادات', 'التقييم', 'عدد المرضى']
  const exportRows = sortedDoctors.map((doctor) => [
    doctor.doctorName,
    doctor.departmentName,
    doctor.totalAppointments,
    doctor.completedAppointments,
    formatCurrency(doctor.revenue),
    typeof doctor.averageRating === 'number' ? doctor.averageRating.toFixed(1) : '0.0',
    doctor.patientCount,
  ])
  const exportSummary = {
    'الفترة': filters.startDate && filters.endDate
      ? `${filters.startDate} - ${filters.endDate}`
      : 'كل الفترات',
    'إجمالي الأطباء': data?.summary.totalDoctors || 0,
    'إجمالي المواعيد': data?.summary.totalAppointments || 0,
    'إجمالي الإيرادات': formatCurrency(data?.summary.totalRevenue || 0),
    'متوسط التقييم': typeof data?.summary.averageRating === 'number' ? data.summary.averageRating.toFixed(1) : '0.0',
  }

  // بيانات الرسم البياني لأفضل 10 أطباء
  const top10Doctors = sortedDoctors.slice(0, 10).map((doctor) => ({
    اسم: doctor.doctorName.split(' ')[0], // أخذ الاسم الأول فقط
    المواعيد: doctor.completedAppointments,
    الإيرادات: doctor.revenue,
  }))

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">حدث خطأ في تحميل تقرير أداء الأطباء</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  if (isLoading) {
    return <ReportSkeleton showCharts={true} />
  }

  return (
    <div className="space-y-6">
      {/* هيدر التقرير */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">تقرير أداء الأطباء</h2>
          <p className="mt-1 text-sm text-gray-600">مقارنة وتحليل أداء الأطباء</p>
        </div>
        <ExportButtons
          title="تقرير أداء الأطباء"
          headers={exportHeaders}
          rows={exportRows}
          summary={exportSummary}
        />
      </div>

      {/* الفلاتر */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">الفلاتر</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">تاريخ البداية</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">تاريخ النهاية</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">القسم</label>
            <select
              value={filters.departmentId || ''}
              onChange={(e) => handleFilterChange('departmentId', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">جميع الأقسام</option>
              {departments?.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">عدد النتائج</label>
            <input
              type="number"
              min={5}
              max={50}
              value={filters.limit || 10}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* الملخص */}
      {data?.summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-gray-600">إجمالي الأطباء</p>
            <p className="mt-1 text-2xl font-bold text-blue-900">{data.summary.totalDoctors}</p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-gray-600">إجمالي المواعيد</p>
            <p className="mt-1 text-2xl font-bold text-green-900">
              {formatNumber(data.summary.totalAppointments)}
            </p>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
            <p className="mt-1 text-2xl font-bold text-yellow-900">
              {formatCurrency(data.summary.totalRevenue)}
            </p>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <p className="text-sm font-medium text-gray-600">متوسط التقييم</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-2xl font-bold text-purple-900">{typeof data.summary.averageRating === 'number' ? data.summary.averageRating.toFixed(1) : '0.0'}</p>
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* الرسم البياني لأفضل 10 أطباء */}
      {top10Doctors.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">أفضل 10 أطباء</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={top10Doctors} margin={{ top: 5, right: 30, left: 0, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="اسم"
                angle={-45}
                textAnchor="end"
                height={100}
                stroke="#6b7280"
                fontSize={12}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} tick={{ fill: '#6b7280' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} tick={{ fill: '#10b981' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => [
                  name === 'المواعيد' ? value : formatCurrency(value),
                  name,
                ]}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="المواعيد" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="الإيرادات" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* جدول أداء الأطباء */}
      {sortedDoctors.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900">جدول تفاصيل الأداء</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-right text-sm font-semibold text-gray-900">#</th>
                  <th
                    className="cursor-pointer p-4 text-right text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    onClick={() => handleSort('doctorName')}
                  >
                    الطبيب {sortColumn === 'doctorName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="cursor-pointer p-4 text-right text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    onClick={() => handleSort('departmentName')}
                  >
                    القسم
                  </th>
                  <th
                    className="cursor-pointer p-4 text-right text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    onClick={() => handleSort('totalAppointments')}
                  >
                    المواعيد الكلية {sortColumn === 'totalAppointments' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="cursor-pointer p-4 text-right text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    onClick={() => handleSort('completedAppointments')}
                  >
                    المكتملة {sortColumn === 'completedAppointments' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="cursor-pointer p-4 text-right text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    onClick={() => handleSort('revenue')}
                  >
                    الإيرادات {sortColumn === 'revenue' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="cursor-pointer p-4 text-right text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    onClick={() => handleSort('averageRating')}
                  >
                    التقييم {sortColumn === 'averageRating' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="p-4 text-right text-sm font-semibold text-gray-900">عدد المرضى</th>
                </tr>
              </thead>
              <tbody>
                {sortedDoctors.map((doctor, index) => (
                  <tr
                    key={doctor.doctorId}
                    className={`cursor-pointer transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${selectedDoctor === doctor.doctorId ? 'bg-blue-50 ring-2 ring-blue-500' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedDoctor(selectedDoctor === doctor.doctorId ? null : doctor.doctorId)}
                  >
                    <td className="p-4 text-sm text-gray-600">{index + 1}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">{doctor.doctorName}</td>
                    <td className="p-4 text-sm text-gray-600">{doctor.departmentName}</td>
                    <td className="p-4 text-sm text-gray-600">{formatNumber(doctor.totalAppointments)}</td>
                    <td className="p-4 text-sm text-gray-600">{formatNumber(doctor.completedAppointments)}</td>
                    <td className="p-4 text-sm text-gray-600">{formatCurrency(doctor.revenue)}</td>
                    <td className="p-4 text-sm text-gray-600">
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-yellow-800">
                        {typeof doctor.averageRating === 'number' ? doctor.averageRating.toFixed(1) : '0.0'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{formatNumber(doctor.patientCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* حالة فارغة */}
      {!isLoading && (!data?.doctors || data.doctors.length === 0) && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <Award className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">لا توجد بيانات متاحة</p>
          <p className="mt-1 text-sm text-gray-600">لا توجد بيانات أداء للأطباء حسب الفلاتر المحددة</p>
        </div>
      )}
    </div>
  )
}

