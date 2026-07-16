import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { useI18n } from '../../contexts/I18nContext'
import toast from 'react-hot-toast'

export function PaymentModal({ isOpen, onClose, contentTitle, amount, creator }) {
  const { t } = useI18n()
  const [step, setStep] = useState('confirm')
  const [pin, setPin] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    if (!pin) {
      toast.error(t('pleaseEnterWalletPin'))
      return
    }

    setIsProcessing(true)
    try {
      // In production: Call payment API with PIN verification
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success(t('paymentSuccessfulUnlocked'))
      handleClose()
    } catch (error) {
      toast.error(t('paymentFailed'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setStep('confirm')
    setPin('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('unlockContent')}>
      <div className="space-y-4">
        {step === 'confirm' && (
          <div className="space-y-4">
            <Card className="p-4 bg-charcoal-700">
              <p className="text-gray-400 text-sm mb-1">{t('content')}</p>
              <p className="font-semibold text-gray-100 line-clamp-2">{contentTitle}</p>
            </Card>

            <Card className="p-4 bg-charcoal-700">
              <p className="text-gray-400 text-sm mb-1">{t('creator')}</p>
              <p className="font-semibold text-gray-100">{creator}</p>
            </Card>

            <Card className="p-6 bg-charcoal-800 border-2 border-primary-500 text-center">
              <p className="text-gray-400 text-sm mb-2">{t('paymentRequired')}</p>
              <p className="text-4xl font-bold text-primary-500">{amount}</p>
              <p className="text-gray-400 text-sm">{t('etb')}</p>
            </Card>

            <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-3">
              <p className="text-sm text-green-300">{t('noRefundsNotice')}</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleClose} variant="secondary" className="flex-1">
                {t('cancel')}
              </Button>
              <Button onClick={() => setStep('pin')} variant="primary" className="flex-1">
                {t('continue')}
              </Button>
            </div>
          </div>
        )}

        {step === 'pin' && (
          <div className="space-y-4">
            <Card className="p-4 bg-charcoal-700">
              <p className="text-gray-400 text-sm">{t('totalPayment')}</p>
              <p className="text-3xl font-bold text-primary-500">{amount} {t('etb')}</p>
            </Card>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">{t('walletPin')}</label>
              <Input
                type="password"
                placeholder={t('enterWalletPin')}
                value={pin}
                onChange={(e) => setPin(e.target.value.slice(0, 4))}
                maxLength="4"
              />
              <p className="text-xs text-gray-400 mt-2">
                <a href="/settings" className="text-primary-500 hover:underline">{t('forgotPin')}</a>
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep('confirm')} variant="secondary" className="flex-1">
                {t('back')}
              </Button>
              <Button onClick={handlePayment} variant="primary" className="flex-1" disabled={isProcessing || pin.length !== 4}>
                {isProcessing ? t('processing') : t('payNow')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
