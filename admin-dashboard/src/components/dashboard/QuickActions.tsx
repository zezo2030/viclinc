import { useNavigate } from 'react-router-dom'
import type { QuickActionsProps } from '@/types'
import { UserPlus, Stethoscope, Building2, FileText } from 'lucide-react'

export default function QuickActions({
  actions: customActions,
}: Partial<QuickActionsProps>) {
  const navigate = useNavigate()

  const defaultActions = [
    {
      id: 'create-user',
      label: 'إضافة مستخدم',
      icon: <UserPlus className="h-6 w-6" />,
      onClick: () => navigate('/users?create=1'),
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100/50',
      hoverGradient: 'from-blue-100 to-blue-200/70',
      shadowColor: 'shadow-blue-500/20',
    },
    {
      id: 'create-doctor',
      label: 'إضافة طبيب',
      icon: <Stethoscope className="h-6 w-6" />,
      onClick: () => navigate('/doctors?create=1'),
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-green-100/50',
      hoverGradient: 'from-green-100 to-green-200/70',
      shadowColor: 'shadow-green-500/20',
    },
    {
      id: 'create-dept',
      label: 'إضافة قسم',
      icon: <Building2 className="h-6 w-6" />,
      onClick: () => navigate('/departments?create=1'),
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100/50',
      hoverGradient: 'from-purple-100 to-purple-200/70',
      shadowColor: 'shadow-purple-500/20',
    },
    {
      id: 'view-reports',
      label: 'عرض التقارير',
      icon: <FileText className="h-6 w-6" />,
      onClick: () => navigate('/reports'),
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-amber-100/50',
      hoverGradient: 'from-amber-100 to-amber-200/70',
      shadowColor: 'shadow-amber-500/20',
    },
  ]

  const actions = customActions || defaultActions

  return (
    <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-1 w-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <h3 className="text-xl font-bold text-gray-900">إجراءات سريعة</h3>
        <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-20"></div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`group relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-br ${action.bgGradient || 'from-white to-gray-50'} p-5 text-right shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl ${action.shadowColor || 'shadow-gray-500/20'}`}
          >
            <div className="relative z-10">
              <div className={`mb-3 inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient || 'from-blue-500 to-blue-600'} p-3 text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                {action.icon || <FileText className="h-6 w-6" />}
              </div>
              <span className="block text-base font-bold text-gray-800 transition-colors group-hover:text-gray-900">
                {action.label}
              </span>
            </div>
            <div className={`absolute inset-0 opacity-0 bg-gradient-to-br ${action.hoverGradient || 'from-blue-100 to-blue-200/70'} transition-opacity duration-300 group-hover:opacity-100`}></div>
          </button>
        ))}
      </div>
    </div>
  )
}





