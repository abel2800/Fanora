import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function CreatorRoute({ children }) {
  const { user } = useAuth()

  if (!user?.isCreator) {
    return <Navigate to="/home" replace />
  }

  return children
}
