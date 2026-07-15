import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Card } from './Card'
import { Badge } from './Badge'
import { Input } from './Input'
import toast from 'react-hot-toast'

export function PaymentModal({ isOpen, onClose, contentTitle, amount, creator }) {
  const [step, setStep] = useState('confirm') // confirm, pin
  const [pin, setPin] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    if (!pin) {
      toast.error('Please enter your wallet PIN')
      return
    }

    setIsProcessing(true)
    try {
      // In production: Call payment API with PIN verification
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      toast.success('Payment successful! Content unlocked.')
      handleClose()
    } catch (error) {
      toast.error('Payment failed')
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Unlock Content">
      <div className="space-y-4">
        {step === 'confirm' && (
          <div className="space-y-4">
            <Card className="p-4 bg-charcoal-700">
              <p className="text-gray-400 text-sm mb-1">Content</p>
              <p className="font-semibold text-gray-100 line-clamp-2">{contentTitle}</p>
            </Card>

            <Card className="p-4 bg-charcoal-700">
              <p className="text-gray-400 text-sm mb-1">Creator</p>
              <p className="font-semibold text-gray-100">{creator}</p>
            </Card>

            <Card className="p-6 bg-charcoal-800 border-2 border-primary-500 text-center">
              <p className="text-gray-400 text-sm mb-2">Payment Required</p>
              <p className="text-4xl font-bold text-primary-500">{amount}</p>
              <p className="text-gray-400 text-sm">ETB</p>
            </Card>

            <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-3">
              <p className="text-sm text-green-300">
                You'll be able to watch this content after payment. No refunds.
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleClose} variant="secondary" className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setStep('pin')} variant="primary" className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'pin' && (
          <div className="space-y-4">
            <Card className="p-4 bg-charcoal-700">
              <p className="text-gray-400 text-sm">Total Payment</p>
              <p className="text-3xl font-bold text-primary-500">{amount} ETB</p>
            </Card>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Wallet PIN</label>
              <Input
                type="password"
                placeholder="Enter your 4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.slice(0, 4))}
                maxLength="4"
              />
              <p className="text-xs text-gray-400 mt-2">
                <a href="/settings" className="text-primary-500 hover:underline">Forgot PIN?</a>
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep('confirm')} variant="secondary" className="flex-1">
                Back
              </Button>
              <Button onClick={handlePayment} variant="primary" className="flex-1" disabled={isProcessing || pin.length !== 4}>
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
