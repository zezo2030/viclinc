import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '@/api/auth'
import type { LoginRequest, LoginResponse } from '@/api/auth'

interface User {
  id: string
  email: string
  name: string
  phone: string
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT'
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // تحقق من التوكن عند التحميل
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        try {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        } catch (error) {
          console.error('Error parsing stored user:', error)
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
        }
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      console.log('AuthContext - Starting login...', credentials)
      
      const response: LoginResponse = await authApi.login(credentials)

      console.log('AuthContext - Login response received:', response)
      console.log('AuthContext - Response access_token exists:', !!response.access_token)
      console.log('AuthContext - Response user exists:', !!response.user)

      if (!response.access_token || !response.user) {
        console.error('AuthContext - Missing required fields:', {
          hasToken: !!response.access_token,
          hasUser: !!response.user,
          response
        })
        throw new Error('استجابة غير صحيحة من الخادم: البيانات المطلوبة غير موجودة')
      }

      // حفظ البيانات في localStorage أولاً
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))

      console.log('AuthContext - Data saved to localStorage')
      console.log('AuthContext - Token length:', response.access_token.length)
      console.log('AuthContext - User:', response.user)

      // تحديث state بشكل متزامن - React سيقوم بإعادة render تلقائياً
      setToken(response.access_token)
      setUser(response.user)
      
      // التحقق من التحديث
      console.log('AuthContext - State updated successfully')
      console.log('AuthContext - isAuthenticated will be:', !!(response.access_token && response.user))
      console.log('AuthContext - Token and user set, React will re-render')
      
      // Force re-render للتأكد من تحديث isAuthenticated
      // React سيحدث تلقائياً بعد setState
      
      // انتظار قصير للتأكد من تحديث state
      await new Promise(resolve => setTimeout(resolve, 50))
    } catch (error) {
      console.error('AuthContext - Login error:', error)
      // تنظيف localStorage في حالة الخطأ
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!user && !!token

  console.log('AuthContext - Render:', {
    hasUser: !!user,
    hasToken: !!token,
    isAuthenticated,
    isLoading,
    userRole: user?.role
  })

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

