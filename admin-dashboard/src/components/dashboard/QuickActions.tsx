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
      gradient: 'bg-[#6366f1]',
      bgGradient: 'bg-white',
      hoverGradient: 'bg-[#6366f1]/10',
    },
    {
      id: 'create-doctor',
      label: 'إضافة طبيب',
      icon: <Stethoscope className="h-6 w-6" />,
      onClick: () => navigate('/doctors?create=1'),
      gradient: 'bg-[#8b5cf6]',
      bgGradient: 'bg-white',
      hoverGradient: 'bg-[#8b5cf6]/10',
    },
    {
      id: 'create-dept',
      label: 'إضافة قسم',
      icon: <Building2 className="h-6 w-6" />,
      onClick: () => navigate('/departments?create=1'),
      gradient: 'bg-[#06b6d4]',
      bgGradient: 'bg-white',
      hoverGradient: 'bg-[#06b6d4]/10',
    },
    {
      id: 'view-reports',
      label: 'عرض التقارير',
      icon: <FileText className="h-6 w-6" />,
      onClick: () => navigate('/reports'),
      gradient: 'bg-[#10b981]',
      bgGradient: 'bg-white',
      hoverGradient: 'bg-[#10b981]/10',
    },
  ]

  const actions = customActions || defaultActions

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-1 w-1 rounded-full bg-[#6366f1]"></div>
        <h3 className="text-xl font-semibold text-[#0f172a]">إجراءات سريعة</h3>
        <div className="h-0.5 flex-1 bg-[#6366f1] opacity-20"></div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`group relative overflow-hidden rounded-lg border border-[#e2e8f0] ${action.bgGradient || 'bg-white'} p-5 text-right shadow-sm transition-all duration-150 ease-out hover:scale-[1.02] hover:shadow-sm`}
          >
            <div className="relative z-10">
              <div className={`mb-3 inline-flex items-center justify-center rounded-lg ${action.gradient || 'bg-[#6366f1]'} p-3 text-white shadow-sm transition-all duration-150 ease-out`}>
                {action.icon || <FileText className="h-6 w-6" />}
              </div>
              <span className="block text-base font-medium text-[#0f172a] transition-colors duration-150 group-hover:text-[#6366f1]">
                {action.label}
              </span>
            </div>
            <div className={`absolute inset-0 opacity-0 ${action.hoverGradient || 'bg-[#6366f1]/10'} transition-opacity duration-150 ease-out group-hover:opacity-100`}></div>
          </button>
        ))}
      </div>
    </div>
  )
}





