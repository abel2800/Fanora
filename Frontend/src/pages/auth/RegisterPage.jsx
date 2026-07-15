import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input, FormGroup, Label, ErrorMessage, HelpText } from '../../components/ui/Input'

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const { register: registerUser } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    trigger
  } = useForm()

  const watchedFields = watch()
  const password = watch('password')

  const validateAge = (dateString) => {
    const today = new Date()
    const birthDate = new Date(dateString)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18
    }
    
    return age >= 18
  }

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['firstName', 'lastName', 'username', 'email'] 
      : ['password', 'confirmPassword', 'phoneNumber', 'dateOfBirth']
    
    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep(2)
    }
  }

  const prevStep = () => {
    setCurrentStep(1)
  }

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      const { confirmPassword, ...userData } = data
      await registerUser(userData)
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
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
    <div className="min-h-screen bg-charcoal-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mb-4">
            <h1 className="text-3xl font-bold text-white">F</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-100">Join Fanora</h2>
          <p className="mt-2 text-sm text-gray-400">
            Create your account and start supporting creators on Fanora
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 bg-charcoal-800 p-4 rounded-lg border border-charcoal-700">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-primary-500' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep >= 1 ? 'border-primary-500 bg-primary-500 text-white' : 'border-charcoal-700'
              }`}>
                {currentStep > 1 ? <CheckIcon className="h-5 w-5" /> : '1'}
              </div>
              <span className="ml-2 text-sm font-medium">Basic Info</span>
            </div>
            <div className={`w-12 h-0.5 ${currentStep > 1 ? 'bg-primary-500' : 'bg-charcoal-700'}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-primary-500' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                currentStep >= 2 ? 'border-primary-500 bg-primary-500 text-white' : 'border-charcoal-700'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Account Details</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-charcoal-800 p-6 rounded-lg border border-charcoal-700">
        {currentStep === 1 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup>
                <Label htmlFor="firstName" required>First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  error={errors.firstName}
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters'
                    }
                  })}
                />
                {errors.firstName && <ErrorMessage>{errors.firstName.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="lastName" required>Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  error={errors.lastName}
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters'
                    }
                  })}
                />
                {errors.lastName && <ErrorMessage>{errors.lastName.message}</ErrorMessage>}
              </FormGroup>
            </div>

            <FormGroup>
              <Label htmlFor="username" required>Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                error={errors.username}
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters'
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Username can only contain letters, numbers, and underscores'
                  }
                })}
              />
              {errors.username && <ErrorMessage>{errors.username.message}</ErrorMessage>}
              <HelpText>This will be your unique identifier on Fanora</HelpText>
            </FormGroup>

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

            <Button
              type="button"
              onClick={nextStep}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Continue
            </Button>
          </>
        )}

        {currentStep === 2 && (
          <>
            <FormGroup>
              <Label htmlFor="password" required>Password</Label>
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
                          strength.score < 3 ? 'bg-red-500/200' : 
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
              <Label htmlFor="confirmPassword" required>Confirm password</Label>
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

            <FormGroup>
              <Label htmlFor="phoneNumber" required>Phone number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                autoComplete="tel"
                placeholder="+251912345678 or 0912345678"
                error={errors.phoneNumber}
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^(\+251|0)[1-9]\d{8}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
              />
              {errors.phoneNumber && <ErrorMessage>{errors.phoneNumber.message}</ErrorMessage>}
              <HelpText>We support Telebirr and CBE mobile banking</HelpText>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="dateOfBirth" required>Date of birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                error={errors.dateOfBirth}
                {...register('dateOfBirth', {
                  required: 'Date of birth is required',
                  validate: value => validateAge(value) || 'You must be 18 years or older'
                })}
              />
              {errors.dateOfBirth && <ErrorMessage>{errors.dateOfBirth.message}</ErrorMessage>}
              <HelpText>You must be 18 years or older to join Fanora</HelpText>
            </FormGroup>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-charcoal-700 rounded mt-1"
                {...register('terms', {
                  required: 'You must accept the terms and conditions'
                })}
              />
              <div className="ml-3">
                <label htmlFor="terms" className="text-sm text-gray-100">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-500 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-500 font-medium">
                    Privacy Policy
                  </Link>
                </label>
                {errors.terms && <ErrorMessage>{errors.terms.message}</ErrorMessage>}
              </div>
            </div>

            {errors.root && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <ErrorMessage>{errors.root.message}</ErrorMessage>
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1"
                loading={isLoading}
                disabled={isLoading}
              >
                Create Account
              </Button>
            </div>
          </>
        )}
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary-500 hover:text-primary-400 font-medium">
            Sign in
          </Link>
        </p>
      </div>
      </div>
    </div>
  )
}
