import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input, FormGroup, Label, ErrorMessage } from '../../components/ui/Input'

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { forgotPassword } = useAuth()

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
      const message = error.response?.data?.message || 'Failed to send reset email'
      setError('root', { message })
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <EnvelopeIcon className="h-6 w-6 text-primary-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-gray-600 mb-6">
          We've sent a password reset link to{' '}
          <span className="font-medium text-gray-900">{getValues('email')}</span>
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={() => setEmailSent(false)}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              try again
            </button>
          </p>

          <Link to="/auth/login">
            <Button variant="outline" size="lg" className="w-full">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Forgot your password?</h2>
        <p className="mt-2 text-sm text-gray-600">
          No worries, we'll send you reset instructions
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormGroup>
          <Label htmlFor="email" required>Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            error={errors.email}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Please enter a valid email address'
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
          Send reset instructions
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to sign in
        </Link>
      </div>
    </>
  )
}
