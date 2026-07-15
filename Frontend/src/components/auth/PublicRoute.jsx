import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PageLoader } from '../ui/LoadingSpinner'

export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <PageLoader text="Loading..." />
  }

  if (isAuthenticated) {
    // Redirect authenticated users to appropriate dashboard
    const redirectPath = user?.isCreator ? '/creator' : '/dashboard'
    return <Navigate to={redirectPath} replace />
  }

  return children
}
