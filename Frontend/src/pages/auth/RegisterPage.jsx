import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { authAPI } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input, FormGroup, Label, ErrorMessage, HelpText } from '../../components/ui/Input'
import toast from 'react-hot-toast'
import { useI18n } from '../../contexts/I18nContext'

export function RegisterPage() {
  const [step, setStep] = useState(0)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendIn, setResendIn] = useState(0)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register: registerUser } = useAuth()
  const { t, language, toggleLanguage } = useI18n()
  const { register, handleSubmit, formState: { errors }, setError, watch } = useForm()

  const stepLabels = [t('stepPhone'), t('stepOtp'), t('stepAge'), t('stepAccount')]

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = setTimeout(() => setResendIn(resendIn - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  const sendOtp = async () => {
    if (!/^(\+251|0)[1-9]\d{8}$/.test(phone)) {
      toast.error(t('invalidPhoneNumber'))
      return
    }
    setIsLoading(true)
    try {
      const res = await authAPI.sendOtp({ phoneNumber: phone })
      if (res.data?.devCode) toast.success(`Dev OTP: ${res.data.devCode}`)
      else toast.success(t('otpSent'))
      setResendIn(60)
      setStep(1)
    } catch (e) {
      toast.error(e.response?.data?.message || t('failedToSendOtp'))
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async () => {
    const code = otp.join('')
    if (code.length !== 6) return toast.error(t('enterSixDigitCode'))
    setIsLoading(true)
    try {
      await authAPI.verifyOtp({ phoneNumber: phone, code, purpose: 'register' })
      setPhoneVerified(true)
      toast.success(t('phoneVerified'))
      setStep(2)
    } catch (e) {
      toast.error(e.response?.data?.message || t('invalidOtp'))
    } finally {
      setIsLoading(false)
    }
  }

  const onOtpChange = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[idx] = digit
    setOtp(next)
    if (digit && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus()
  }

  const validateAge = (dateString) => {
    const today = new Date()
    const birth = new Date(dateString)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age >= 18
  }

  const onSubmit = async (data) => {
    if (!phoneVerified) return toast.error(t('verifyPhoneFirst'))
    try {
      setIsLoading(true)
      const { confirmPassword, ...userData } = data
      await registerUser({ ...userData, phoneNumber: phone })
    } catch (error) {
      setError('root', { message: error.response?.data?.message || t('registrationFailed') })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-charcoal-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <button
            type="button"
            onClick={toggleLanguage}
            className="mb-5 rounded-pill border border-charcoal-700 px-4 py-2 text-sm text-primary-500"
          >
            {language === 'en' ? t('amharic') : t('english')}
          </button>
          <h2 className="text-2xl font-display font-bold text-gray-100">{t('joinFanora')}</h2>
          <p className="text-sm text-gray-400 mt-2">{t('step')} {step + 1} {t('of')} 4 — {stepLabels[step]}</p>
          <div className="mt-4 h-1.5 bg-charcoal-800 rounded-pill overflow-hidden">
            <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${((step + 1) / 4) * 100}%` }} />
          </div>
        </div>

        <div className="bg-charcoal-800 p-6 rounded-card border border-charcoal-700 space-y-6">
          {step === 0 && (
            <>
              <FormGroup>
                <Label required>{t('phoneNumber')}</Label>
                <Input
                  type="tel"
                  placeholder="+251912345678 or 0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <HelpText>{t('smsVerificationHelp')}</HelpText>
              </FormGroup>
              <Button variant="primary" className="w-full" onClick={sendOtp} loading={isLoading}>{t('sendCode')}</Button>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-gray-400 text-sm text-center">{t('enterCodeSentTo')} {phone}</p>
              <div className="flex justify-center gap-2">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    className="w-11 h-12 text-center text-lg rounded-lg bg-charcoal-900 border border-charcoal-700 text-gray-100 focus:border-primary-500 outline-none"
                    maxLength={1}
                    value={d}
                    onChange={(e) => onOtpChange(i, e.target.value)}
                  />
                ))}
              </div>
              <Button variant="primary" className="w-full" onClick={verifyOtp} loading={isLoading}>{t('verify')}</Button>
              <button
                type="button"
                disabled={resendIn > 0}
                onClick={sendOtp}
                className="w-full text-sm text-primary-500 disabled:text-gray-400"
              >
                {resendIn > 0 ? `${t('resendIn')} ${resendIn}s` : t('resendCode')}
              </button>
              <Button variant="outline" className="w-full" onClick={() => setStep(0)}>{t('back')}</Button>
            </>
          )}

          {step === 2 && (
            <>
              <FormGroup>
                <Label required>{t('dateOfBirth')}</Label>
                <Input type="date" {...register('dateOfBirth', {
                  required: t('required'),
                  validate: (v) => validateAge(v) || t('mustBe18'),
                })} />
                {errors.dateOfBirth && <ErrorMessage>{errors.dateOfBirth.message}</ErrorMessage>}
                <HelpText>{t('ageVerificationHelp')}</HelpText>
              </FormGroup>
              <Button variant="primary" className="w-full" onClick={() => {
                const dob = watch('dateOfBirth')
                if (!dob) return toast.error(t('selectDateOfBirth'))
                if (!validateAge(dob)) return toast.error(t('mustBe18Short'))
                setStep(3)
              }}>{t('continue')}</Button>
            </>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormGroup>
                  <Label required>{t('firstName')}</Label>
                  <Input {...register('firstName', { required: true })} />
                </FormGroup>
                <FormGroup>
                  <Label required>{t('lastName')}</Label>
                  <Input {...register('lastName', { required: true })} />
                </FormGroup>
              </div>
              <FormGroup>
                <Label required>{t('username')}</Label>
                <Input {...register('username', { required: true, pattern: /^[a-zA-Z0-9_]+$/ })} />
              </FormGroup>
              <FormGroup>
                <Label required>{t('email')}</Label>
                <Input type="email" {...register('email', { required: true })} />
              </FormGroup>
              <FormGroup>
                <Label required>{t('password')}</Label>
                <Input type="password" {...register('password', { required: true, minLength: 8 })} />
              </FormGroup>
              <FormGroup>
                <Label required>{t('confirmPassword')}</Label>
                <Input type="password" {...register('confirmPassword', {
                  required: true,
                  validate: (v) => v === watch('password') || t('passwordsDoNotMatch'),
                })} />
              </FormGroup>
              {errors.root && <ErrorMessage>{errors.root.message}</ErrorMessage>}
              <Button type="submit" variant="primary" className="w-full" loading={isLoading}>{t('createAccount')}</Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          {t('alreadyAccount')} <Link to="/auth/login" className="text-primary-500">{t('signIn')}</Link>
        </p>
      </div>
    </div>
  )
}
