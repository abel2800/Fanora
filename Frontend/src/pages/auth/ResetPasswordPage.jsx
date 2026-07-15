import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input, FormGroup, Label, ErrorMessage } from '../../components/ui/Input'

export function ResetPasswordPage() {
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
      const message = error.response?.data?.message || 'Failed to reset password'
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
    
    if (score < 3) return { score, text: 'Weak', color: 'text-red-600' }
    if (score < 4) return { score, text: 'Good', color: 'text-yellow-600' }
    return { score, text: 'Strong', color: 'text-green-600' }
  }

  const strength = passwordStrength(password)

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormGroup>
          <Label htmlFor="password" required>New password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              error={errors.password}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain at least one uppercase letter, lowercase letter, and number'
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
                <div className="flex-1 bg-gray-200 rounded-full h-2">
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
          <Label htmlFor="confirmPassword" required>Confirm new password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={errors.confirmPassword}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
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
          Reset password
        </Button>
      </form>
    </>
  )
}
