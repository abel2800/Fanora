import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { walletAPI } from '../../services/api'
import { useI18n } from '../../contexts/I18nContext'
import toast from 'react-hot-toast'

export function WalletTopupModal({ isOpen, onClose }) {
  const { t } = useI18n()
  const [step, setStep] = useState('method')
  const [method, setMethod] = useState(null)
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const topupMethods = [
    {
      id: 'telebirr',
      name: t('telebirr'),
      description: t('topUpTelebirrDesc'),
      icon: '📱',
      minAmount: 100,
      maxAmount: 50000
    },
    {
      id: 'cbe',
      name: t('cbeBirr'),
      description: t('topUpCbeDesc'),
      icon: '🏦',
      minAmount: 100,
      maxAmount: 50000
    }
  ]

  const handleTopup = async () => {
    if (!amount || parseInt(amount) < 100) {
      toast.error(t('minTopupAmount'))
      return
    }

    setIsProcessing(true)
    try {
      const endpoint = method === 'telebirr'
        ? walletAPI.topupTelebirr
        : walletAPI.topupCBE

      await endpoint({ amount: parseInt(amount) })
      toast.success(t('topUpInitiated'))
      handleClose()
    } catch (error) {
      toast.error(error.response?.data?.message || t('topUpFailed'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setStep('method')
    setMethod(null)
    setAmount('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('topUpWallet')}>
      <div className="space-y-4">
        {step === 'method' && (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm">{t('choosePaymentMethod')}</p>
            {topupMethods.map(m => (
              <Card
                key={m.id}
                onClick={() => { setMethod(m.id); setStep('amount') }}
                className={`p-4 cursor-pointer transition ${
                  method === m.id ? 'ring-2 ring-primary-500 bg-charcoal-700' : 'hover:bg-charcoal-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{m.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-100">{m.name}</h3>
                    <p className="text-xs text-gray-400">{m.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {step === 'amount' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">{t('amount')} ({t('etb')})</label>
              <Input
                type="number"
                placeholder={t('enterAmount')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="100"
                max="50000"
              />
              <p className="text-xs text-gray-400 mt-2">{t('minMaxTopup')}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 5000].map(amt => (
                <Button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  variant={amount === amt.toString() ? 'primary' : 'outline'}
                  size="sm"
                >
                  {amt}
                </Button>
              ))}
            </div>

            <div className="bg-charcoal-700 rounded-lg p-4">
              <p className="text-sm text-gray-400">{t('youWillTopUp')}</p>
              <p className="text-2xl font-bold text-primary-500">{amount || '0'} {t('etb')}</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep('method')} variant="secondary" className="flex-1">
                {t('back')}
              </Button>
              <Button onClick={() => setStep('confirm')} variant="primary" className="flex-1" disabled={!amount}>
                {t('continue')}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <Card className="p-4 bg-charcoal-700">
              <p className="text-gray-400 text-sm mb-2">{t('paymentMethod')}</p>
              <p className="text-lg font-semibold text-gray-100">
                {topupMethods.find(m => m.id === method)?.name}
              </p>
            </Card>

            <Card className="p-4 bg-charcoal-700">
              <p className="text-gray-400 text-sm mb-2">{t('amount')}</p>
              <p className="text-3xl font-bold text-primary-500">{amount} {t('etb')}</p>
            </Card>

            <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-3">
              <p className="text-sm text-blue-300">{t('topUpPhonePrompt')}</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep('amount')} variant="secondary" className="flex-1">
                {t('back')}
              </Button>
              <Button onClick={handleTopup} variant="primary" className="flex-1" disabled={isProcessing}>
                {isProcessing ? t('processing') : t('confirmAndPay')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
