import { useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import DailyReport from '@/components/reports/DailyReport'
import WeeklyReport from '@/components/reports/WeeklyReport'
import MonthlyReport from '@/components/reports/MonthlyReport'
import DoctorsPerformanceReport from '@/components/reports/DoctorsPerformanceReport'
import CustomReport from '@/components/reports/CustomReport'
import { Calendar, TrendingUp, Users, FileText, Award } from 'lucide-react'

type ReportTab = 'daily' | 'weekly' | 'monthly' | 'doctors' | 'custom'

const tabs: { id: ReportTab; label: string; icon: JSX.Element }[] = [
  { id: 'daily', label: 'يومي', icon: <Calendar className="h-5 w-5" /> },
  { id: 'weekly', label: 'أسبوعي', icon: <TrendingUp className="h-5 w-5" /> },
  { id: 'monthly', label: 'شهري', icon: <FileText className="h-5 w-5" /> },
  { id: 'doctors', label: 'أداء الأطباء', icon: <Award className="h-5 w-5" /> },
  { id: 'custom', label: 'مخصص', icon: <Users className="h-5 w-5" /> },
]

export default function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('daily')

  const renderReport = () => {
    switch (activeTab) {
      case 'daily':
        return <DailyReport />
      case 'weekly':
        return <WeeklyReport />
      case 'monthly':
        return <MonthlyReport />
      case 'doctors':
        return <DoctorsPerformanceReport />
      case 'custom':
        return <CustomReport />
      default:
        return <DailyReport />
    }
  }

  return (
    <AdminLayout>
      <Breadcrumbs />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">التقارير</h1>
        <p className="mt-1 text-gray-600">عرض وتحليل التقارير الإدارية والإحصائيات</p>
      </div>

      {/* التبويبات */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 space-x-reverse">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* محتوى التقرير */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {renderReport()}
      </div>
    </AdminLayout>
  )
}










