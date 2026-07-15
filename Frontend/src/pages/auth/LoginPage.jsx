import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input, FormGroup, Label, ErrorMessage } from '../../components/ui/Input'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/home'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm()

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      await login(data)
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      setError('root', { message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-charcoal-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mb-4">
            <h1 className="text-3xl font-bold text-white">F</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-100">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to your Fanora account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-charcoal-800 p-6 rounded-lg border border-charcoal-700">
        <FormGroup>
          <Label htmlFor="email" required>Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
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

        <FormGroup>
          <Label htmlFor="password" required>Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              error={errors.password}
              {...register('password', {
                required: 'Password is required'
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
          {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
        </FormGroup>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-charcoal-600 rounded bg-charcoal-700"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>

          <Link
            to="/auth/forgot-password"
            className="text-sm text-primary-500 hover:text-primary-400 font-medium"
          >
            Forgot your password?
          </Link>
        </div>

        {errors.root && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
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
          Sign in
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-charcoal-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-charcoal-800 text-gray-400">New to Fanora?</span>
          </div>
        </div>

        <div className="mt-6">
          <Link to="/auth/signup">
            <Button variant="secondary" size="lg" className="w-full">
              Create your account
            </Button>
          </Link>
        </div>
      </div>

      {/* Features highlight */}
      <div className="mt-8 pt-6 border-t border-charcoal-700 text-center">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
            <span className="text-xs text-gray-400">Support creators on Fanora</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
            <span className="text-xs text-gray-400">Pay with Telebirr & CBE</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
            <span className="text-xs text-gray-400">Exclusive content on Fanora</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
