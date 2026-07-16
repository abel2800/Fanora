import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'

export function VerifyEmailPage() {
  const { t, language, toggleLanguage } = useI18n()
  const [status, setStatus] = useState('verifying')
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
        setError(error.response?.data?.message || t('emailVerificationFailed'))
      }
    }

    if (token) {
      handleVerification()
    } else {
      setStatus('error')
      setError(t('invalidVerificationToken'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, verifyEmail])

  const langToggle = (
    <div className="flex justify-end mb-4">
      <button
        type="button"
        onClick={toggleLanguage}
        className="text-sm text-primary-400 border border-charcoal-600 rounded-pill px-3 py-1"
      >
        {language === 'en' ? t('amharic') : t('english')}
      </button>
    </div>
  )

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-charcoal-900 flex flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-sm space-y-4 text-center">
          {langToggle}
          <Skeleton className="mx-auto h-14 w-14 rounded-full" />
          <Skeleton className="mx-auto h-8 w-64" />
          <Skeleton className="mx-auto h-4 w-72" />
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-charcoal-900 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          {langToggle}
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-100 mb-2">{t('emailVerified')}</h2>
          <p className="text-gray-400 mb-6">
            {t('emailVerifiedSuccess')}
          </p>

          <div className="space-y-3">
            <Link to="/home">
              <Button variant="primary" size="lg" className="w-full">
                {t('goToDashboard')}
              </Button>
            </Link>

            <Link to="/auth/login">
              <Button variant="outline" size="lg" className="w-full">
                {t('signIn')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        {langToggle}
        <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <XCircleIcon className="h-6 w-6 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-100 mb-2">{t('verificationFailed')}</h2>
        <p className="text-gray-400 mb-6">
          {error || t('verificationFailedDefault')}
        </p>

        <div className="space-y-3">
          <Link to="/auth/login">
            <Button variant="primary" size="lg" className="w-full">
              {t('signIn')}
            </Button>
          </Link>

          <Link to="/auth/signup">
            <Button variant="outline" size="lg" className="w-full">
              {t('createAccount')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
