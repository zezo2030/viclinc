import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  // إعادة توجيه المستخدم إذا كان مسجل دخول بالفعل
  useEffect(() => {
    console.log('Login - useEffect triggered:', {
      isAuthenticated,
      authLoading,
      from,
      currentPath: window.location.pathname
    })
    
    if (!authLoading && isAuthenticated) {
      console.log('Login - User authenticated, redirecting to:', from)
      
      // التحقق من localStorage كنسخة احتياطية
      const token = localStorage.getItem('access_token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        // استخدام setTimeout لضمان تحديث React Router
        const timer = setTimeout(() => {
          const currentPath = window.location.pathname
          console.log('Login - useEffect: Current path:', currentPath)
          
          // التحقق من أننا ما زلنا في صفحة login
          if (currentPath.includes('/login') || currentPath.endsWith('/login')) {
            console.log('Login - useEffect: Redirecting via navigate to:', from)
            navigate(from, { replace: true })
            
            // Force redirect كنسخة احتياطية
            setTimeout(() => {
              if (window.location.pathname.includes('/login')) {
                console.log('Login - Navigate failed, forcing redirect...')
                const basePath = import.meta.env.BASE_URL || '/admin/'
                const redirectPath = from === '/' ? basePath : `${basePath}${from.replace(/^\//, '')}`
                window.location.href = redirectPath
              }
            }, 300)
          }
        }, 100)
        
        return () => clearTimeout(timer)
      } else {
        console.warn('Login - isAuthenticated is true but no token/user in localStorage')
      }
    }
  }, [isAuthenticated, authLoading, navigate, from])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // منع propagation

    if (!email || !password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }

    setIsLoading(true)

    try {
      console.log('Login - Calling login function with:', { email, passwordLength: password.length })
      await login({ email, password })
      
      console.log('Login - Login successful, checking localStorage...')
      const token = localStorage.getItem('access_token')
      const user = localStorage.getItem('user')
      
      console.log('Login - After login:', {
        hasToken: !!token,
        hasUser: !!user,
        tokenLength: token?.length || 0
      })
      
      if (!token || !user) {
        throw new Error('فشل حفظ بيانات تسجيل الدخول')
      }
      
      toast.success('تم تسجيل الدخول بنجاح')
      
      // تحديث loading state
      setIsLoading(false)
      
      // إعادة التوجيه مباشرة بعد التأكد من حفظ البيانات
      console.log('Login - Redirecting to:', from)
      
      // استخدام setTimeout لضمان تحديث state و React Router
      setTimeout(() => {
        // التحقق مرة أخرى من وجود البيانات
        const checkToken = localStorage.getItem('access_token')
        const checkUser = localStorage.getItem('user')
        
        if (checkToken && checkUser) {
          console.log('Login - Token and user confirmed, navigating...')
          
          // التحقق من base path
          const basePath = import.meta.env.BASE_URL || '/admin/'
          const redirectPath = from === '/' ? basePath : `${basePath}${from.replace(/^\//, '')}`
          
          console.log('Login - Redirect path:', redirectPath)
          console.log('Login - Base path:', basePath)
          
          // إعادة التوجيه إلى Dashboard
          try {
            navigate(from, { replace: true })
          } catch (error) {
            console.error('Login - Navigate error:', error)
          }
          
          // Force redirect إذا لم يعمل navigate (fallback)
          setTimeout(() => {
            const currentPath = window.location.pathname
            if (currentPath.includes('/login') || currentPath.endsWith('/login')) {
              console.log('Login - Navigate failed, forcing redirect to:', redirectPath)
              window.location.href = redirectPath
            }
          }, 500)
        } else {
          console.error('Login - Token or user missing after login')
          toast.error('حدث خطأ في حفظ بيانات تسجيل الدخول')
        }
      }, 200)
      
    } catch (error: any) {
      console.error('Login error:', error)
      console.error('Login error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code
      })
      
      let errorMessage = 'فشل تسجيل الدخول'
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = error.userMessage || 'لا يمكن الاتصال بالخادم. تأكد من أن الخادم الخلفي يعمل على المنفذ 3000'
      } else if (error.response?.status === 401) {
        errorMessage = error.response?.data?.message || error.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        
        // رسالة توضيحية إضافية
        console.warn('Login failed - 401 Unauthorized. Please check:')
        console.warn('1. Email is correct: admin@clinic.com')
        console.warn('2. Password is correct: password123')
        console.warn('3. Admin user exists in database (run seed script if needed)')
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }

  // عرض loading إذا كان النظام يتحقق من المصادقة
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366f1]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6366f1] text-white rounded-full mb-4 shadow-sm">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-semibold text-[#0f172a]">لوحة الإدارة</h1>
          <p className="text-[#64748b] mt-2">تسجيل الدخول إلى حسابك</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-[#e2e8f0]">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#0f172a] mb-2">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out"
                placeholder="admin@clinic.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#0f172a] mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out"
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0f172a] transition-colors duration-150"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#6366f1] text-white py-3 rounded-lg font-medium hover:bg-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-out shadow-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  جاري تسجيل الدخول...
                </span>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
            <p className="text-sm font-medium text-[#0f172a] mb-2">بيانات تجريبية:</p>
            <div className="text-xs text-[#64748b] space-y-1">
              <p>📧 admin@clinic.com</p>
              <p>🔒 password123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#64748b] mt-6">
          © 2024 نظام إدارة العيادات. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  )
}
