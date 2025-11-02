import { useState, useEffect } from 'react'
import { useCustomReport } from '@/hooks/useReports'
import { useQuery } from '@tanstack/react-query'
import { departmentsApi } from '@/api/departments'
import { doctorsApi } from '@/api/doctors'
import ReportSkeleton from './ReportSkeleton'
import ExportButtons from './ExportButtons'
import { Filter, Calendar, Save, Search } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/utils/format'
import type { CustomReportParams, Department } from '@/types'
import toast from 'react-hot-toast'

const STORAGE_FAVORITES_KEY = 'custom_report_favorites'

export default function CustomReport() {
  // تاريخ افتراضي: آخر 30 يوم
  const defaultStartDate = new Date()
  defaultStartDate.setDate(defaultStartDate.getDate() - 30)
  const defaultStart = defaultStartDate.toISOString().split('T')[0]
  const defaultEnd = new Date().toISOString().split('T')[0]

  const [filters, setFilters] = useState<CustomReportParams>({
    startDate: defaultStart,
    endDate: defaultEnd,
  })
  const [savedFilters, setSavedFilters] = useState<string[]>([])

  const { data, isLoading, error } = useCustomReport(filters)
  
  // تحميل الأقسام والأطباء
  const { data: departments } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll(),
  })

  const { data: doctorsData } = useQuery({
    queryKey: ['doctors', 'all'],
    queryFn: () => doctorsApi.getAll({ limit: 1000 }),
  })

  // تحميل الفلاتر المحفوظة من localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_FAVORITES_KEY)
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading saved filters', e)
      }
    }
  }, [])

  const handleFilterChange = (key: keyof CustomReportParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }

  const handleSaveFilters = () => {
    const saved = localStorage.getItem(STORAGE_FAVORITES_KEY)
    let favorites: any[] = []
    if (saved) {
      try {
        favorites = JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved filters', e)
      }
    }

    const filterName = `فلتر ${favorites.length + 1}`
    const newFavorite = { name: filterName, filters }
    favorites.push(newFavorite)

    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(favorites))
    setSavedFilters(favorites.map((f: any) => f.name))
    toast.success('تم حفظ الفلاتر بنجاح')
  }

  const handleLoadFavorite = (favoriteName: string) => {
    const saved = localStorage.getItem(STORAGE_FAVORITES_KEY)
    if (saved) {
      try {
        const favorites = JSON.parse(saved)
        const favorite = favorites.find((f: any) => f.name === favoriteName)
        if (favorite) {
          setFilters(favorite.filters)
          toast.success('تم تحميل الفلاتر بنجاح')
        }
      } catch (e) {
        console.error('Error loading favorite filters', e)
      }
    }
  }

  // إعداد بيانات التصدير
  const exportHeaders = data?.data && data.data.length > 0 ? Object.keys(data.data[0]) : []
  const exportRows = data?.data?.map((row) => Object.values(row)) || []
  const exportSummary = {
    'الفترة': `${filters.startDate} - ${filters.endDate}`,
    'إجمالي السجلات': data?.summary.totalRecords || 0,
    'إجمالي المواعيد': data?.summary.totalAppointments || 0,
    'إجمالي الإيرادات': formatCurrency(data?.summary.totalRevenue || 0),
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">حدث خطأ في تحميل التقرير المخصص</p>
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
    return <ReportSkeleton showCharts={false} />
  }

  return (
    <div className="space-y-6">
      {/* هيدر التقرير */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">تقرير مخصص</h2>
          <p className="mt-1 text-sm text-gray-600">إنشاء تقارير مخصصة بفلاتر مرنة</p>
        </div>
        <ExportButtons
          title="تقرير مخصص"
          headers={exportHeaders}
          rows={exportRows}
          summary={exportSummary}
        />
      </div>

      {/* الفلاتر */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">الفلاتر</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveFilters}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              حفظ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* تاريخ البداية والنهاية */}
          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">نطاق التاريخ</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* الأقسام */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">الأقسام</label>
            <select
              multiple
              value={filters.departmentIds || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value)
                handleFilterChange('departmentIds', values)
              }}
              className="h-32 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {departments?.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">اضغط Ctrl للاختيار المتعدد</p>
          </div>

          {/* الأطباء */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">الأطباء</label>
            <select
              multiple
              value={filters.doctorIds || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value)
                handleFilterChange('doctorIds', values)
              }}
              className="h-32 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {doctorsData?.data?.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">اضغط Ctrl للاختيار المتعدد</p>
          </div>

          {/* نوع الموعد */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">نوع الموعد</label>
            <select
              multiple
              value={filters.appointmentTypes || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value)
                handleFilterChange('appointmentTypes', values)
              }}
              className="h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="consultation">استشارة</option>
              <option value="follow_up">متابعة</option>
              <option value="emergency">حالة طارئة</option>
              <option value="surgery">عملية جراحية</option>
            </select>
          </div>

          {/* حالة الدفع */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">حالة الدفع</label>
            <select
              multiple
              value={filters.paymentStatuses || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value)
                handleFilterChange('paymentStatuses', values)
              }}
              className="h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="pending">معلق</option>
              <option value="paid">مدفوع</option>
              <option value="refunded">مسترد</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>

          {/* نوع الخدمة */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">نوع الخدمة</label>
            <select
              multiple
              value={filters.serviceTypes || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value)
                handleFilterChange('serviceTypes', values)
              }}
              className="h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="general">عام</option>
              <option value="specialist">استشاري</option>
              <option value="diagnostic">تشخيصي</option>
              <option value="therapeutic">علاجي</option>
            </select>
          </div>
        </div>
      </div>

      {/* الملخص */}
      {data?.summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-gray-600">إجمالي السجلات</p>
            <p className="mt-1 text-2xl font-bold text-blue-900">
              {formatNumber(data.summary.totalRecords)}
            </p>
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
        </div>
      )}

      {/* جدول البيانات */}
      {data?.data && data.data.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900">النتائج</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {exportHeaders.map((header) => (
                    <th key={header} className="p-4 text-right text-sm font-semibold text-gray-900">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exportRows.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-4 text-sm text-gray-600">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* حالة فارغة */}
      {!isLoading && (!data?.data || data.data.length === 0) && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">لا توجد نتائج</p>
          <p className="mt-1 text-sm text-gray-600">
            لم يتم العثور على بيانات تطابق الفلاتر المحددة. جرب تعديل معايير البحث.
          </p>
        </div>
      )}
    </div>
  )
}

