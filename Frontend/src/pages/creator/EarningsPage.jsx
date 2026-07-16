import { useState } from 'react'
import { useQuery } from 'react-query'
import { subscriptionsAPI } from '../../services/api'
import { useI18n } from '../../contexts/I18nContext'
import { Card } from '../../components/ui/Card'
import { PageSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

export function EarningsPage() {
  const { t } = useI18n()
  const [dateRange, setDateRange] = useState('month')

  const periods = [
    { key: 'week', labelKey: 'thisWeek' },
    { key: 'month', labelKey: 'month' },
    { key: 'year', labelKey: 'thisYear' },
    { key: 'all', labelKey: 'allTime' },
  ]

  const { data: earnings = {}, isLoading } = useQuery(
    ['earnings', dateRange],
    () => subscriptionsAPI.getEarnings({ period: dateRange }).then(res => res.data?.data || {}),
    { onError: () => toast.error(t('failedToLoadEarnings')) }
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <PageSkeleton />
      </div>
    )
  }

  const grossRevenue = earnings.totalEarnings || 0
  const creatorEarnings = Math.round(grossRevenue * 0.7)
  const platformFees = Math.round(grossRevenue * 0.3)

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">{t('creatorEarnings')}</h1>
        <p className="text-gray-400 mb-8">{t('platformFeeNote')}</p>

        <div className="flex gap-2 mb-8">
          {periods.map(period => (
            <button
              key={period.key}
              onClick={() => setDateRange(period.key)}
              className={`px-4 py-2 rounded-lg transition ${
                dateRange === period.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-charcoal-800 text-gray-300 hover:bg-charcoal-700'
              }`}
            >
              {t(period.labelKey)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-gray-400 text-sm">{t('yourEarnings70')}</p>
            <p className="text-4xl font-bold text-green-400 mt-2">{creatorEarnings.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">{t('etb')}</p>
          </Card>

          <Card className="p-6">
            <p className="text-gray-400 text-sm">{t('grossRevenue')}</p>
            <p className="text-4xl font-bold text-gray-100 mt-2">{grossRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">{t('etb')}</p>
          </Card>

          <Card className="p-6">
            <p className="text-gray-400 text-sm">{t('platformFee30')}</p>
            <p className="text-4xl font-bold text-primary-500 mt-2">{platformFees.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">{t('etb')}</p>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-100 mb-4">{t('revenueBySource')}</h2>
          <div className="space-y-4">
            {earnings.bySource?.map(source => (
              <div key={source.type} className="flex items-center justify-between p-4 bg-charcoal-700 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-100 capitalize">{source.type}</p>
                  <p className="text-sm text-gray-400">{t('txnCount').replace('{count}', source.count)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-500">{source.amount} {t('etb')}</p>
                  <p className="text-xs text-gray-400">{((source.amount / grossRevenue) * 100).toFixed(1)}%</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-400 text-center py-8">{t('noEarningsData')}</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4">{t('recentTransactions')}</h2>
          <div className="space-y-3">
            {earnings.transactions?.slice(0, 10).map(txn => (
              <div key={txn.id} className="flex items-center justify-between p-4 border border-charcoal-700 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-100">{txn.description}</p>
                  <p className="text-sm text-gray-400">{new Date(txn.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-400">+{(txn.amount * 0.7).toFixed(0)} {t('etb')}</p>
                  <p className="text-xs text-gray-400">{t('youKeep70')}</p>
                </div>
              </div>
            )) || (
              <p className="text-gray-400 text-center py-8">{t('noTransactions')}</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
