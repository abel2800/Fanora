import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import Cookies from 'js-cookie'
import { useI18n } from './I18nContext'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()
  const { t } = useI18n()

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await authAPI.getMe()
      setUser(response.data.user)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid token
      Cookies.remove('token')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setIsLoading(true)
      const response = await authAPI.login(credentials)

      const { token, user: userData } = response.data

      // Store token in cookies
      Cookies.set('token', token, {
        expires: 30, // 30 days
        secure: import.meta.env.PROD,
        sameSite: 'strict'
      })

      setUser(userData)
      setIsAuthenticated(true)

      toast.success(t('welcomeBack'))

      // Redirect based on user type
      if (userData.isCreator) {
        navigate('/creator/dashboard')
      } else {
        navigate('/home')
      }

      return response.data
    } catch (error) {
      const message = error.response?.data?.message || t('loginFailed')
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setIsLoading(true)
      const response = await authAPI.register(userData)

      const { token, user: newUser } = response.data

      // Store token in cookies
      Cookies.set('token', token, {
        expires: 30,
        secure: import.meta.env.PROD,
        sameSite: 'strict'
      })

      setUser(newUser)
      setIsAuthenticated(true)

      toast.success(t('accountCreatedSuccessfully'))
      navigate('/home')

      return response.data
    } catch (error) {
      const message = error.response?.data?.message || t('registrationFailed')
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear auth state regardless of API call result
      Cookies.remove('token')
      setUser(null)
      setIsAuthenticated(false)
      toast.success(t('loggedOutSuccessfully'))
      navigate('/')
    }
  }

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }))
  }

  const becomeCreator = async () => {
    try {
      const response = await authAPI.becomeCreator()
      setUser(prev => ({
        ...prev,
        isCreator: true,
        role: 'creator'
      }))
      toast.success(t('nowACreator'))
      navigate('/creator/dashboard')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || t('failedBecomeCreator')
      toast.error(message)
      throw error
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword({ email })
      toast.success(t('passwordResetEmailSent'))
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || t('failedToSendResetEmail')
      toast.error(message)
      throw error
    }
  }

  const resetPassword = async (token, password) => {
    try {
      const response = await authAPI.resetPassword(token, { password })
      toast.success(t('passwordResetSuccessfully'))
      navigate('/auth/login')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || t('failedToResetPassword')
      toast.error(message)
      throw error
    }
  }

  const verifyEmail = async (token) => {
    try {
      const response = await authAPI.verifyEmail(token)
      // Refresh user data
      await checkAuth()
      toast.success(t('emailVerifiedSuccessfully'))
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || t('emailVerificationFailed')
      toast.error(message)
      throw error
    }
  }

  const resendVerification = async () => {
    try {
      const response = await authAPI.resendVerification()
      toast.success(t('verificationEmailSent'))
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || t('failedSendVerificationEmail')
      toast.error(message)
      throw error
    }
  }

  const changePassword = async (passwords) => {
    try {
      const response = await authAPI.changePassword(passwords)
      toast.success(t('passwordChanged'))
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || t('failedToChangePassword')
      toast.error(message)
      throw error
    }
  }

  const loginWithOtp = async ({ phoneNumber, code }) => {
    try {
      setIsLoading(true)
      const response = await authAPI.verifyOtp({ phoneNumber, code, purpose: 'login' })
      const { token, user: userData } = response.data

      Cookies.set('token', token, {
        expires: 30,
        secure: import.meta.env.PROD,
        sameSite: 'strict',
      })

      setUser(userData)
      setIsAuthenticated(true)
      toast.success(t('welcomeBack'))
      navigate(userData.isCreator ? '/creator/dashboard' : '/home')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || t('otpLoginFailed')
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginWithOtp,
    register,
    logout,
    updateUser,
    becomeCreator,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    changePassword,
    checkAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
