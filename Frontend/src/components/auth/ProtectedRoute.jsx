import { Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PageSkeleton } from '../ui/Skeleton'

export function ProtectedRoute({ children, requireCreator = false, requireEmailVerified = false }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <PageSkeleton />
  }

  if (!isAuthenticated) {
    // Redirect to login with return url
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (requireEmailVerified && !user?.isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-900 px-4">
        <div className="max-w-md w-full bg-charcoal-800 rounded-card border border-charcoal-700 shadow-lg p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-100 mb-2">Email Verification Required</h3>
          <p className="text-gray-400 mb-4">
            Please verify your email address to access this feature.
          </p>
          <div className="space-y-2">
            <Link to="/auth/verify-email" className="btn-primary btn-md block w-full">
              Verify email
            </Link>
            <Link to="/home" className="block text-sm text-gray-400 hover:text-primary-500">Back home</Link>
          </div>
        </div>
      </div>
    )
  }

  if (requireCreator && !user?.isCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-900 px-4">
        <div className="max-w-md w-full bg-charcoal-800 rounded-card border border-charcoal-700 shadow-lg p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-100 mb-2">Creator Account Required</h3>
          <p className="text-gray-400 mb-4">
            You need a creator account to access this feature. Become a creator to start sharing content and earning money.
          </p>
          <div className="space-y-2">
            <Link to="/creator/onboarding" className="btn-primary btn-md block w-full">
              Become a Creator
            </Link>
            <Link to="/home" className="block text-sm text-gray-400 hover:text-primary-500">Back home</Link>
          </div>
        </div>
      </div>
    )
  }

  return children
}
