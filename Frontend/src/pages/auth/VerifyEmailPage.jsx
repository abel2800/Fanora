import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'

export function VerifyEmailPage() {
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [error, setError] = useState('')
  const { token } = useParams()
  const { verifyEmail } = useAuth()

  useEffect(() => {
    const handleVerification = async () => {
      try {
        await verifyEmail(token)
        setStatus('success')
      } catch (error) {
        setStatus('error')
        setError(error.response?.data?.message || 'Email verification failed')
      }
    }

    if (token) {
      handleVerification()
    } else {
      setStatus('error')
      setError('Invalid verification token')
    }
  }, [token, verifyEmail])

  if (status === 'verifying') {
    return (
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email</h2>
        <p className="text-gray-600">Please wait while we verify your email address...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircleIcon className="h-6 w-6 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email verified!</h2>
        <p className="text-gray-600 mb-6">
          Your email has been successfully verified. You can now access all features of Fanora.
        </p>

        <div className="space-y-3">
          <Link to="/dashboard">
            <Button variant="primary" size="lg" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
          
          <Link to="/auth/login">
            <Button variant="outline" size="lg" className="w-full">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <XCircleIcon className="h-6 w-6 text-red-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification failed</h2>
      <p className="text-gray-600 mb-6">
        {error || 'We couldn\'t verify your email address. The link may have expired or is invalid.'}
      </p>

      <div className="space-y-3">
        <Link to="/auth/login">
          <Button variant="primary" size="lg" className="w-full">
            Sign In
          </Button>
        </Link>
        
        <Link to="/auth/register">
          <Button variant="outline" size="lg" className="w-full">
            Create New Account
          </Button>
        </Link>
      </div>
    </div>
  )
}
