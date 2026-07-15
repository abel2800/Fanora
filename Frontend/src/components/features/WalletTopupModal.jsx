import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { Card } from './Card'
import { Badge } from './Badge'
import { walletAPI } from '../../services/api'
import toast from 'react-hot-toast'

export function WalletTopupModal({ isOpen, onClose }) {
  const [step, setStep] = useState('method') // method, amount, confirm
  const [method, setMethod] = useState(null) // 'telebirr' or 'cbe'
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const topupMethods = [
    {
      id: 'telebirr',
      name: 'Telebirr',
      description: 'Top up using Telebirr account',
      icon: '📱',
      minAmount: 100,
      maxAmount: 50000
    },
    {
      id: 'cbe',
      name: 'CBE Birr',
      description: 'Top up using CBE Mobile account',
      icon: '🏦',
      minAmount: 100,
      maxAmount: 50000
    }
  ]

  const handleTopup = async () => {
    if (!amount || parseInt(amount) < 100) {
      toast.error('Minimum amount is 100 ETB')
      return
    }

    setIsProcessing(true)
    try {
      const endpoint = method === 'telebirr'
        ? walletAPI.topupTelebirr
        : walletAPI.topupCBE

      await endpoint({ amount: parseInt(amount) })
      toast.success('Top up initiated! Please complete payment on your phone.')
      handleClose()
    } catch (error) {
      toast.error('Top up failed')
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Top Up Wallet">
      <div className="space-y-4">
        {step === 'method' && (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm">Choose payment method</p>
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
              <label className="block text-sm font-semibold text-gray-300 mb-2">Amount (ETB)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="100"
                max="50000"
              />
              <p className="text-xs text-gray-400 mt-2">Min: 100 ETB | Max: 50,000 ETB</p>
            </div>

            {/* Quick Amount Buttons */}
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
              <p className="text-sm text-gray-400">You will top up</p>
              <p className="text-2xl font-bold text-primary-500">{amount || '0'} ETB</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep('method')} variant="secondary" className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep('confirm')} variant="primary" className="flex-1" disabled={!amount}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <Card className="p-4 bg-charcoal-700">
              <p className="text-gray-400 text-sm mb-2">Payment Method</p>
              <p className="text-lg font-semibold text-gray-100">
                {topupMethods.find(m => m.id === method)?.name}
              </p>
            </Card>

            <Card className="p-4 bg-charcoal-700">
              <p className="text-gray-400 text-sm mb-2">Amount</p>
              <p className="text-3xl font-bold text-primary-500">{amount} ETB</p>
            </Card>

            <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-3">
              <p className="text-sm text-blue-300">
                You'll receive a payment prompt on your phone. Complete it to finish the top up.
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep('amount')} variant="secondary" className="flex-1">
                Back
              </Button>
              <Button onClick={handleTopup} variant="primary" className="flex-1" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Confirm & Pay'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
