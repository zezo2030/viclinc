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
      icon: <UserPlus className="h-5 w-5" />,
      onClick: () => navigate('/users?create=1'),
    },
    {
      id: 'create-doctor',
      label: 'إضافة طبيب',
      icon: <Stethoscope className="h-5 w-5" />,
      onClick: () => navigate('/doctors?create=1'),
    },
    {
      id: 'create-dept',
      label: 'إضافة قسم',
      icon: <Building2 className="h-5 w-5" />,
      onClick: () => navigate('/departments?create=1'),
    },
    {
      id: 'view-reports',
      label: 'عرض التقارير',
      icon: <FileText className="h-5 w-5" />,
      onClick: () => navigate('/reports'),
    },
  ]

  const actions = customActions || defaultActions

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">إجراءات سريعة</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-right transition-all hover:border-primary-300 hover:bg-primary-50 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-200">
              {action.icon || <FileText className="h-5 w-5" />}
            </div>
            <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-primary-700">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}



