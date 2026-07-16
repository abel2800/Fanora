import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { Button } from '../../components/ui/Button'
import { Input, FormGroup, Label, ErrorMessage } from '../../components/ui/Input'

export function ResetPasswordPage() {
  const { t, language, toggleLanguage } = useI18n()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { token } = useParams()
  const { resetPassword } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      await resetPassword(token, data.password)
    } catch (error) {
      const message = error.response?.data?.message || t('failedToResetPassword')
      setError('root', { message })
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: '' }
    
    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    
    score = Object.values(checks).filter(Boolean).length
    
    if (score < 3) return { score, text: t('passwordWeak'), color: 'text-red-600' }
    if (score < 4) return { score, text: t('passwordGood'), color: 'text-yellow-600' }
    return { score, text: t('passwordStrong'), color: 'text-green-600' }
  }

  const strength = passwordStrength(password)

  return (
    <div className="min-h-screen bg-charcoal-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={toggleLanguage}
          className="text-sm text-primary-400 border border-charcoal-600 rounded-pill px-3 py-1"
        >
          {language === 'en' ? t('amharic') : t('english')}
        </button>
      </div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-100">{t('resetYourPassword')}</h2>
        <p className="mt-2 text-sm text-gray-400">
          {t('enterNewPassword')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormGroup>
          <Label htmlFor="password" required>{t('newPassword')}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              error={errors.password}
              {...register('password', {
                required: t('passwordRequired'),
                minLength: {
                  value: 8,
                  message: t('passwordMinLength')
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: t('passwordComplexity')
                }
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-charcoal-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      strength.score < 3 ? 'bg-red-500' : 
                      strength.score < 4 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-medium ${strength.color}`}>
                  {strength.text}
                </span>
              </div>
            </div>
          )}
          {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="confirmPassword" required>{t('confirmNewPassword')}</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={errors.confirmPassword}
            {...register('confirmPassword', {
              required: t('pleaseConfirmPassword'),
              validate: value => value === password || t('passwordsDoNotMatch')
            })}
          />
          {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>}
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
          {t('resetPassword')}
        </Button>
      </form>
      </div>
    </div>
  )
}
