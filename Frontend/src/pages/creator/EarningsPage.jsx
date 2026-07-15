import { useState } from 'react'
import { useQuery } from 'react-query'
import { subscriptionsAPI, paymentsAPI } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ArrowTrendingUpIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export function EarningsPage() {
  const [dateRange, setDateRange] = useState('month')

  const { data: earnings = {}, isLoading } = useQuery(
    ['earnings', dateRange],
    () => subscriptionsAPI.getEarnings({ period: dateRange }).then(res => res.data?.data || {}),
    { onError: () => toast.error('Failed to load earnings') }
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const grossRevenue = earnings.totalRevenue || 0
  const creatorEarnings = Math.round(grossRevenue * 0.7)
  const platformFees = Math.round(grossRevenue * 0.3)

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Creator Earnings</h1>
        <p className="text-gray-400 mb-8">70% to you, 30% platform fee</p>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {['week', 'month', 'year', 'all'].map(period => (
            <button
              key={period}
              onClick={() => setDateRange(period)}
              className={`px-4 py-2 rounded-lg transition ${
                dateRange === period
                  ? 'bg-primary-500 text-white'
                  : 'bg-charcoal-800 text-gray-300 hover:bg-charcoal-700'
              }`}
            >
              {period === 'week' && 'This Week'}
              {period === 'month' && 'This Month'}
              {period === 'year' && 'This Year'}
              {period === 'all' && 'All Time'}
            </button>
          ))}
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-gray-400 text-sm">Your Earnings (70%)</p>
            <p className="text-4xl font-bold text-green-400 mt-2">{creatorEarnings.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">ETB</p>
          </Card>

          <Card className="p-6">
            <p className="text-gray-400 text-sm">Gross Revenue</p>
            <p className="text-4xl font-bold text-gray-100 mt-2">{grossRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">ETB</p>
          </Card>

          <Card className="p-6">
            <p className="text-gray-400 text-sm">Platform Fee (30%)</p>
            <p className="text-4xl font-bold text-primary-500 mt-2">{platformFees.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">ETB</p>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Revenue by Source</h2>
          <div className="space-y-4">
            {earnings.bySource?.map(source => (
              <div key={source.type} className="flex items-center justify-between p-4 bg-charcoal-700 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-100 capitalize">{source.type}</p>
                  <p className="text-sm text-gray-400">{source.count} transactions</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-500">{source.amount} ETB</p>
                  <p className="text-xs text-gray-400">{((source.amount / grossRevenue) * 100).toFixed(1)}%</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-400 text-center py-8">No earnings data yet</p>
            )}
          </div>
        </Card>

        {/* Transactions List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {earnings.transactions?.slice(0, 10).map(txn => (
              <div key={txn.id} className="flex items-center justify-between p-4 border border-charcoal-700 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-100">{txn.description}</p>
                  <p className="text-sm text-gray-400">{new Date(txn.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-400">+{(txn.amount * 0.7).toFixed(0)} ETB</p>
                  <p className="text-xs text-gray-400">You keep 70%</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-400 text-center py-8">No transactions yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
