import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PageSkeleton } from '../ui/Skeleton'

export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return <PageSkeleton />
  }

  if (isAuthenticated) {
    const redirectPath = user?.isCreator ? '/creator/dashboard' : '/home'
    return <Navigate to={redirectPath} replace />
  }

  return children
}
