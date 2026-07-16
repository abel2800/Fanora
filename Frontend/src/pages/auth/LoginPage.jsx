import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { authAPI } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input, FormGroup, Label, ErrorMessage } from '../../components/ui/Input'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { t, language, toggleLanguage } = useI18n()
  const [tab, setTab] = useState('email')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendIn, setResendIn] = useState(0)
  const { login, loginWithOtp } = useAuth()

  const { register, handleSubmit, formState: { errors }, setError } = useForm()

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = setTimeout(() => setResendIn(resendIn - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendIn])

  const onEmailSubmit = async (data) => {
    try {
      setIsLoading(true)
      await login(data)
    } catch (error) {
      setError('root', { message: error.response?.data?.message || t('loginFailed') })
    } finally {
      setIsLoading(false)
    }
  }

  const sendOtp = async () => {
    setIsLoading(true)
    try {
      const res = await authAPI.sendOtp({ phoneNumber: phone, purpose: 'login' })
      if (res.data?.devCode) toast.success(`Dev OTP: ${res.data.devCode}`)
      else toast.success(t('otpSent'))
      setResendIn(60)
    } catch (e) {
      toast.error(e.response?.data?.message || t('failedToSendOtp'))
    } finally {
      setIsLoading(false)
    }
  }

  const onPhoneLogin = async () => {
    const code = otp.join('')
    if (code.length !== 6) return toast.error(t('enterSixDigitCode'))
    try {
      setIsLoading(true)
      await loginWithOtp({ phoneNumber: phone, code })
    } catch (error) {
      toast.error(error.response?.data?.message || t('loginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const onOtpChange = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[idx] = digit
    setOtp(next)
    if (digit && idx < 5) document.getElementById(`login-otp-${idx + 1}`)?.focus()
  }

  return (
    <div className="min-h-screen bg-charcoal-900 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <button type="button" onClick={toggleLanguage} className="text-sm text-primary-400 border border-charcoal-600 rounded-pill px-3 py-1">
            {language === 'en' ? t('amharic') : t('english')}
          </button>
        </div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold text-gray-100">{t('login')}</h2>
        </div>

        <div className="flex mb-6 bg-charcoal-800 rounded-pill p-1 border border-charcoal-700">
          {['email', 'phone'].map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setTab(tabKey)}
              className={`flex-1 py-2 text-sm font-medium rounded-pill transition ${
                tab === tabKey ? 'bg-primary-500 text-charcoal-900' : 'text-gray-400'
              }`}
            >
              {tabKey === 'email' ? t('email') : t('phoneOtp')}
            </button>
          ))}
        </div>

        <div className="bg-charcoal-800 p-6 rounded-card border border-charcoal-700">
          {tab === 'email' ? (
            <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-5">
              <FormGroup>
                <Label required>{t('email')}</Label>
                <Input type="email" {...register('email', { required: true })} />
              </FormGroup>
              <FormGroup>
                <Label required>{t('password')}</Label>
                <Input type={showPassword ? 'text' : 'password'} {...register('password', { required: true })} />
              </FormGroup>
              <div className="flex justify-between text-sm">
                <Link to="/auth/forgot-password" className="text-primary-500">{t('forgotPassword')}</Link>
                <Link to="/trust" className="text-gray-400">{t('troubleLoggingIn')}</Link>
              </div>
              {errors.root && <ErrorMessage>{errors.root.message}</ErrorMessage>}
              <Button type="submit" variant="primary" className="w-full" loading={isLoading}>{t('signIn')}</Button>
            </form>
          ) : (
            <div className="space-y-5">
              <FormGroup>
                <Label>{t('phoneNumber')}</Label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251..." />
              </FormGroup>
              <Button variant="outline" className="w-full" onClick={sendOtp} disabled={resendIn > 0 || isLoading}>
                {resendIn > 0 ? `${t('resendIn')} ${resendIn}s` : t('sendOtp')}
              </Button>
              <div className="flex justify-center gap-2">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`login-otp-${i}`}
                    className="w-10 h-11 text-center rounded-lg bg-charcoal-900 border border-charcoal-700 text-gray-100"
                    maxLength={1}
                    value={d}
                    onChange={(e) => onOtpChange(i, e.target.value)}
                  />
                ))}
              </div>
              <Button variant="primary" className="w-full" onClick={onPhoneLogin} loading={isLoading}>{t('signInWithOtp')}</Button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          {t('newToFanora')} <Link to="/auth/signup" className="text-primary-500">{t('createAccount')}</Link>
        </p>
      </div>
    </div>
  )
}
