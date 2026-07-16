import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { useI18n } from '../../contexts/I18nContext'
import { subscriptionsAPI, contentAPI, bundlesAPI, walletAPI } from '../../services/api'
import toast from 'react-hot-toast'

export function PaywallSheet({
  isOpen,
  onClose,
  mode = 'subscribe',
  plan,
  content,
  bundle,
  creatorName,
  onSuccess,
}) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('wallet')

  const price = plan?.price || content?.price || bundle?.price || 0
  const title = mode === 'subscribe'
    ? t('subscribeToCreator').replace('{name}', creatorName || t('creator'))
    : mode === 'bundle'
      ? bundle?.title || t('unlockBundle')
      : t('unlockContent')

  const paymentMethods = [
    { id: 'wallet', label: t('fanoraWallet'), desc: t('payFromBalance') },
    { id: 'telebirr', label: t('telebirr'), desc: t('mobileMoneyService') },
    { id: 'cbe', label: t('cbeBirr'), desc: t('bankTransfer') },
  ]

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const walletRes = await walletAPI.getWallet()
      const balance = walletRes.data?.data?.balance ?? 0
      if (balance < price) {
        toast.error(t('insufficientWalletBalance'))
        navigate('/wallet')
        return
      }

      if (mode === 'subscribe' && plan) {
        await subscriptionsAPI.subscribe(plan.id, {})
      } else if (mode === 'bundle' && bundle) {
        await bundlesAPI.purchaseBundle(bundle.id, {})
      } else if (content) {
        await contentAPI.purchaseContent(content.id)
      }

      setUnlocked(true)
      toast.success(t('unlocked'))
      setTimeout(() => {
        onSuccess?.()
        onClose()
        setUnlocked(false)
      }, 1200)
    } catch (error) {
      toast.error(error.response?.data?.message || t('paymentFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className={`transition-all duration-500 ${unlocked ? 'scale-[1.02] opacity-90' : ''}`}>
        {unlocked ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✨</div>
            <p className="text-xl font-display text-primary-500">{t('unlocked')}</p>
            <p className="text-gray-400 mt-2">{t('enjoyContent')}</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-4xl font-display font-bold text-primary-500">
                {parseFloat(price).toFixed(0)} <span className="text-lg text-gray-400">{t('etb')}</span>
              </p>
              {plan && (
                <p className="text-gray-400 mt-2">{plan.name} — {t('cancelPauseAnytime')}</p>
              )}
              {mode === 'purchase' && (
                <p className="text-gray-400 mt-2">{t('oneTimeUnlock')}</p>
              )}
            </div>

            <p className="text-sm font-medium text-gray-300 mb-3">{t('paymentMethod')}</p>
            <div className="space-y-2 mb-6">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`w-full p-4 rounded-card border-2 text-left transition ${
                    paymentMethod === m.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-charcoal-700 hover:border-charcoal-600'
                  }`}
                >
                  <p className="font-semibold text-gray-100">{m.label}</p>
                  <p className="text-sm text-gray-400">{m.desc}</p>
                </button>
              ))}
            </div>

            <Button variant="primary" className="w-full" onClick={handleConfirm} disabled={loading}>
              {loading ? t('processing') : t('confirmPayment').replace('{amount}', parseFloat(price).toFixed(0))}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-4">
              {t('securePaymentNote')}
            </p>
          </>
        )}
      </div>
    </BottomSheet>
  )
}
