import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  console.log('ProtectedRoute - State:', {
    isLoading,
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role,
    requiredRole,
    currentPath: location.pathname
  })

  // Loading state - الانتظار حتى يتم تحميل البيانات من localStorage
  if (isLoading) {
    console.log('ProtectedRoute - Showing loading...')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Not authenticated - إعادة التوجيه لصفحة تسجيل الدخول
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to /login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role if required
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ليس لديك صلاحية</h1>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

