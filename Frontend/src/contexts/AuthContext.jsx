import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import Cookies from 'js-cookie'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

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
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
      
      setUser(userData)
      setIsAuthenticated(true)
      
      toast.success('Welcome back!')
      
      // Redirect based on user type
      if (userData.isCreator) {
        navigate('/creator/dashboard')
      } else {
        navigate('/home')
      }
      
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
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
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
      
      setUser(newUser)
      setIsAuthenticated(true)
      
      toast.success('Account created successfully!')
      navigate('/home')
      
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
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
      toast.success('Logged out successfully')
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
      toast.success('You are now a creator!')
      navigate('/creator/dashboard')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to become creator'
      toast.error(message)
      throw error
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword({ email })
      toast.success('Password reset email sent!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email'
      toast.error(message)
      throw error
    }
  }

  const resetPassword = async (token, password) => {
    try {
      const response = await authAPI.resetPassword(token, { password })
      toast.success('Password reset successfully!')
      navigate('/auth/login')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password'
      toast.error(message)
      throw error
    }
  }

  const verifyEmail = async (token) => {
    try {
      const response = await authAPI.verifyEmail(token)
      // Refresh user data
      await checkAuth()
      toast.success('Email verified successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed'
      toast.error(message)
      throw error
    }
  }

  const resendVerification = async () => {
    try {
      const response = await authAPI.resendVerification()
      toast.success('Verification email sent!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send verification email'
      toast.error(message)
      throw error
    }
  }

  const changePassword = async (passwords) => {
    try {
      const response = await authAPI.changePassword(passwords)
      toast.success('Password changed successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password'
      toast.error(message)
      throw error
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
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
