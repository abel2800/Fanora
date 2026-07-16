import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { useI18n } from '../../contexts/I18nContext'

const QUICK_TIP_AMOUNTS = [50, 100, 500, 1000]

export function TipModal({ creator, isOpen, onClose, onSubmit }) {
  const { t } = useI18n()
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const tipAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0)

  const handleSubmit = async () => {
    if (tipAmount <= 0) {
      alert(t('enterValidAmount'))
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        amount: tipAmount,
        message,
        isAnonymous,
        creatorId: creator.id
      })

      setSelectedAmount(null)
      setCustomAmount('')
      setMessage('')
      setIsAnonymous(false)
      onClose()
    } catch (error) {
      alert(t('failedToSendTip') + ': ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex items-center justify-between p-6 border-b border-charcoal-700">
          <div>
            <h2 className="text-xl font-bold text-gray-100">{t('sendATip')}</h2>
            <p className="text-sm text-gray-400 mt-1">
              {t('supportCreatorGoesToThem').replace('{name}', creator.name)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-3 p-4 bg-charcoal-700 rounded-lg">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="h-10 w-10 rounded-full"
            />
            <div>
              <p className="font-semibold text-gray-100">{creator.name}</p>
              <p className="text-xs text-gray-400">@{creator.username}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              {t('quickAmounts')}
            </label>
            <div className="grid grid-cols-4 gap-3">
              {QUICK_TIP_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(selectedAmount === amount ? null : amount)
                    setCustomAmount('')
                  }}
                  className={`p-3 rounded-lg font-semibold transition-all ${
                    selectedAmount === amount
                      ? 'bg-primary-500 text-white ring-2 ring-primary-500/50'
                      : 'bg-charcoal-700 text-gray-300 hover:bg-charcoal-600'
                  }`}
                >
                  {amount}
                  <div className="text-xs opacity-75">{t('etb')}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('orEnterCustomAmount')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                ₿
              </span>
              <Input
                type="number"
                min="1"
                max="50000"
                placeholder={t('enterAmountInEtb')}
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount(null)
                }}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{t('tipMinMax')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('optionalMessage')}
            </label>
            <textarea
              placeholder={t('tipMessagePlaceholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 280))}
              maxLength={280}
              className="w-full p-3 bg-charcoal-700 border border-charcoal-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-primary-500 focus:outline-none resize-none h-20"
            />
            <p className="text-xs text-gray-400 mt-1">
              {t('charactersCount').replace('{count}', String(message.length))}
            </p>
          </div>

          <label className="flex items-center space-x-3 cursor-pointer p-3 hover:bg-charcoal-700 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-charcoal-600 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-300">{t('sendAnonymously')}</span>
          </label>

          {tipAmount > 0 && (
            <div className="p-4 bg-charcoal-700 rounded-lg border border-charcoal-600">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400">{t('tipAmountLabel')}</span>
                <span className="text-2xl font-bold text-primary-500">{tipAmount} {t('etb')}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>{t('creatorReceives')}</span>
                <span className="text-green-400 font-semibold">{tipAmount} {t('etb')} (100%)</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3 p-6 border-t border-charcoal-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || tipAmount <= 0}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                {t('processing')}
              </>
            ) : (
              <>
                <HeartSolidIcon className="h-4 w-4 mr-2" />
                {t('sendTip')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
