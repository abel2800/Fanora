import { useState } from 'react'
import { useQuery } from 'react-query'
import { walletAPI } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  QrCodeIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

export function WalletPage() {
  const { data: walletData, isLoading, refetch } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const response = await walletAPI.getWallet()
      return response.data?.data || { balance: 0, transactions: [] }
    },
    onError: () => toast.error('Failed to load wallet')
  })

  const [showTopupModal, setShowTopupModal] = useState(false)
  const [topupMethod, setTopupMethod] = useState('telebirr') // 'telebirr' or 'cbe'
  const [topupAmount, setTopupAmount] = useState('')
  const [showQR, setShowQR] = useState(false)

  const wallet = walletData || { balance: 0, transactions: [], paymentMethods: [] }

  const handleTopup = async () => {
    if (!topupAmount || topupAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      const endpoint = topupMethod === 'telebirr' ? 'telebirr' : 'cbe'
      await walletAPI[`topup${endpoint.charAt(0).toUpperCase()}${endpoint.slice(1)}`]?.({
        amount: topupAmount
      })
      setShowQR(true)
      toast.success('QR code generated. Scan to complete payment.')
    } catch (error) {
      toast.error('Failed to generate QR code')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">My Wallet</h1>
          <p className="text-gray-400 mt-2">Manage your balance and transactions</p>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white mb-8 p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm opacity-90">Available Balance</p>
              <h2 className="text-4xl font-bold mt-2">
                {typeof wallet.balance === 'number' ? `${wallet.balance.toFixed(2)} ETB` : '0.00 ETB'}
              </h2>
            </div>
            <div className="bg-primary-500 bg-opacity-30 rounded-full p-4">
              <CurrencyDollarIcon className="h-12 w-12" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <Button onClick={() => setShowTopupModal(true)} variant="secondary" size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              Top Up
            </Button>
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-primary-600">
              <ArrowUpIcon className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center py-6">
            <div className="flex items-center justify-center h-10 w-10 bg-green-500 bg-opacity-20 rounded-full mx-auto mb-3">
              <ArrowDownIcon className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm">Total Received</p>
            <p className="text-2xl font-bold text-gray-100 mt-2">
              {wallet.totalReceived ? `${wallet.totalReceived} ETB` : 'N/A'}
            </p>
          </Card>

          <Card className="text-center py-6">
            <div className="flex items-center justify-center h-10 w-10 bg-red-500 bg-opacity-20 rounded-full mx-auto mb-3">
              <ArrowUpIcon className="h-6 w-6 text-red-400" />
            </div>
            <p className="text-gray-400 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-gray-100 mt-2">
              {wallet.totalSpent ? `${wallet.totalSpent} ETB` : 'N/A'}
            </p>
          </Card>

          <Card className="text-center py-6">
            <div className="flex items-center justify-center h-10 w-10 bg-primary-500 bg-opacity-20 rounded-full mx-auto mb-3">
              <CurrencyDollarIcon className="h-6 w-6 text-primary-400" />
            </div>
            <p className="text-gray-400 text-sm">Transactions</p>
            <p className="text-2xl font-bold text-gray-100 mt-2">{wallet.transactions?.length || 0}</p>
          </Card>
        </div>

        {/* Payment Methods */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telebirr */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-100">Telebirr</h3>
                  <p className="text-sm text-gray-400 mt-1">Mobile money service</p>
                </div>
                {wallet.telebirrLinked ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                ) : (
                  <InformationCircleIcon className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              <p className="text-sm text-gray-400 mb-4">
                {wallet.telebirrLinked ? 'Connected to your account' : 'Not connected'}
              </p>
              <Button variant="primary" size="sm" className="w-full">
                {wallet.telebirrLinked ? 'Manage' : 'Link Account'}
              </Button>
            </Card>

            {/* CBE Birr */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-100">CBE Birr</h3>
                  <p className="text-sm text-gray-400 mt-1">Commercial Bank of Ethiopia</p>
                </div>
                {wallet.cbeLinked ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                ) : (
                  <InformationCircleIcon className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              <p className="text-sm text-gray-400 mb-4">
                {wallet.cbeLinked ? 'Connected to your account' : 'Not connected'}
              </p>
              <Button variant="primary" size="sm" className="w-full">
                {wallet.cbeLinked ? 'Manage' : 'Link Account'}
              </Button>
            </Card>
          </div>
        </div>

        {/* Transaction History */}
        <Card>
          <div className="p-6 border-b border-charcoal-700">
            <h3 className="text-lg font-semibold text-gray-100">Transaction History</h3>
          </div>

          {wallet.transactions && wallet.transactions.length > 0 ? (
            <div className="divide-y divide-charcoal-700">
              {wallet.transactions.map((transaction) => (
                <div key={transaction.id} className="py-4 px-6 flex items-center justify-between hover:bg-charcoal-800 transition">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' || transaction.type === 'income'
                          ? 'bg-green-500 bg-opacity-20'
                          : 'bg-red-500 bg-opacity-20'
                      }`}
                    >
                      {transaction.type === 'credit' || transaction.type === 'income' ? (
                        <ArrowDownIcon className="h-6 w-6 text-green-400" />
                      ) : (
                        <ArrowUpIcon className="h-6 w-6 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-100">{transaction.description || transaction.type}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(transaction.createdAt || transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === 'credit' || transaction.type === 'income'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {transaction.type === 'credit' || transaction.type === 'income' ? '+' : '-'}
                      {Math.abs(transaction.amount || 0).toFixed(2)} ETB
                    </p>
                    <Badge
                      variant={
                        transaction.status === 'completed' || transaction.status === 'success'
                          ? 'success'
                          : transaction.status === 'pending'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {transaction.status || 'pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No transactions yet. Top up your wallet to get started!</p>
            </div>
          )}
        </Card>
      </div>

      {/* Top Up Modal */}
      <Modal isOpen={showTopupModal} onClose={() => { setShowTopupModal(false); setShowQR(false) }} title="Top Up Wallet">
        {!showQR ? (
          <div className="space-y-6">
            <p className="text-gray-300">Choose your payment method and enter the amount</p>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-300">Payment Method</label>
              <div className="space-y-2">
                {[
                  { value: 'telebirr', label: 'Telebirr', desc: 'Mobile money service' },
                  { value: 'cbe', label: 'CBE Birr', desc: 'Commercial Bank of Ethiopia' }
                ].map(method => (
                  <button
                    key={method.value}
                    onClick={() => setTopupMethod(method.value)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition ${
                      topupMethod === method.value
                        ? 'border-primary-500 bg-primary-500 bg-opacity-10'
                        : 'border-charcoal-700 hover:border-charcoal-600'
                    }`}
                  >
                    <p className="font-semibold text-gray-100">{method.label}</p>
                    <p className="text-sm text-gray-400">{method.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Amount (ETB)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                min="10"
                max="100000"
              />
              <p className="text-xs text-gray-400 mt-1">Minimum: 10 ETB, Maximum: 100,000 ETB</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-charcoal-700">
              <Button onClick={() => setShowTopupModal(false)} variant="secondary" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleTopup} variant="primary" className="flex-1" disabled={!topupAmount || topupAmount <= 0}>
                Continue to Payment
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <QrCodeIcon className="w-16 h-16 text-primary-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Scan QR Code</h3>
              <p className="text-gray-400 mb-4">Scan with {topupMethod === 'telebirr' ? 'Telebirr' : 'CBE Birr'} app</p>
              <div className="bg-charcoal-800 p-4 rounded-lg aspect-square flex items-center justify-center">
                <p className="text-gray-400">[QR Code Placeholder]</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">Amount: <strong className="text-gray-100">{topupAmount} ETB</strong></p>
            <Button onClick={() => { setShowTopupModal(false); setShowQR(false) }} variant="primary" className="w-full">
              I've Completed Payment
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
