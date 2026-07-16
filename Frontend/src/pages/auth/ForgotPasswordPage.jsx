import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { Button } from '../../components/ui/Button'
import { Input, FormGroup, Label, ErrorMessage } from '../../components/ui/Input'

export function ForgotPasswordPage() {
  const { t, language, toggleLanguage } = useI18n()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { forgotPassword } = useAuth()

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues
  } = useForm()

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      await forgotPassword(data.email)
      setEmailSent(true)
    } catch (error) {
      const message = error.response?.data?.message || t('failedToSendResetEmail')
      setError('root', { message })
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
        {langToggle}
        <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <EnvelopeIcon className="h-6 w-6 text-primary-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-100 mb-2">{t('checkYourEmail')}</h2>
        <p className="text-gray-400 mb-6">
          {t('sentResetLinkTo')}{' '}
          <span className="font-medium text-gray-100">{getValues('email')}</span>
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            {t('didntReceiveEmail')}{' '}
            <button
              onClick={() => setEmailSent(false)}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              {t('tryAgain')}
            </button>
          </p>

          <Link to="/auth/login">
            <Button variant="outline" size="lg" className="w-full">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t('backToSignIn')}
            </Button>
          </Link>
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
      {langToggle}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-100">{t('forgotPassword')}</h2>
        <p className="mt-2 text-sm text-gray-400">
          {t('forgotPasswordSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormGroup>
          <Label htmlFor="email" required>{t('email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('enterYourEmail')}
            error={errors.email}
            {...register('email', {
              required: t('emailRequired'),
              pattern: {
                value: /^\S+@\S+$/i,
                message: t('validEmailRequired')
              }
            })}
          />
          {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
        </FormGroup>

        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <ErrorMessage>{errors.root.message}</ErrorMessage>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          {t('sendResetInstructions')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="text-sm text-gray-400 hover:text-gray-100 flex items-center justify-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          {t('backToSignIn')}
        </Link>
      </div>
      </div>
    </div>
  )
}
