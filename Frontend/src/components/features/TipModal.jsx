import { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import {
  HeartIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

const QUICK_TIP_AMOUNTS = [50, 100, 500, 1000]

export function TipModal({ creator, isOpen, onClose, onSubmit }) {
  const [selectedAmount, setSelectedAmount] = useState(null)
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const tipAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0)

  const handleSubmit = async () => {
    if (tipAmount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setIsLoading(true)
    try {
      // In real implementation, integrate with payment service
      await onSubmit({
        amount: tipAmount,
        message,
        isAnonymous,
        creatorId: creator.id
      })

      // Reset form
      setSelectedAmount(null)
      setCustomAmount('')
      setMessage('')
      setIsAnonymous(false)
      onClose()
    } catch (error) {
      alert('Failed to send tip: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-charcoal-700">
          <div>
            <h2 className="text-xl font-bold text-gray-100">Send a Tip</h2>
            <p className="text-sm text-gray-400 mt-1">
              Support {creator.name} - 100% goes directly to them
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Creator Info */}
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

          {/* Quick Tip Options */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Quick Amounts
            </label>
            <div className="grid grid-cols-4 gap-3">
              {QUICK_TIP_AMOUNTS.map((amount) => (
                <button
                  key={amount}
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
                  <div className="text-xs opacity-75">ETB</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Or Enter Custom Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                ₿
              </span>
              <Input
                type="number"
                min="1"
                max="50000"
                placeholder="Enter amount in ETB"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount(null)
                }}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Minimum: 1 ETB | Maximum: 50,000 ETB
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Optional Message
            </label>
            <textarea
              placeholder="Attach a message with your tip (max 280 characters)"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 280))}
              maxLength={280}
              className="w-full p-3 bg-charcoal-700 border border-charcoal-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-primary-500 focus:outline-none resize-none h-20"
            />
            <p className="text-xs text-gray-400 mt-1">
              {message.length}/280 characters
            </p>
          </div>

          {/* Anonymous Checkbox */}
          <label className="flex items-center space-x-3 cursor-pointer p-3 hover:bg-charcoal-700 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-charcoal-600 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-300">Send anonymously</span>
          </label>

          {/* Summary */}
          {tipAmount > 0 && (
            <div className="p-4 bg-charcoal-700 rounded-lg border border-charcoal-600">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-400">Tip Amount:</span>
                <span className="text-2xl font-bold text-primary-500">{tipAmount} ETB</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Creator Receives:</span>
                <span className="text-green-400 font-semibold">{tipAmount} ETB (100%)</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 border-t border-charcoal-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
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
                Processing...
              </>
            ) : (
              <>
                <HeartSolidIcon className="h-4 w-4 mr-2" />
                Send Tip
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
