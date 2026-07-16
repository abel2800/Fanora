import { useState } from 'react'
import { useQuery } from 'react-query'
import { subscriptionsAPI } from '../../services/api'
import { useI18n } from '../../contexts/I18nContext'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { EnvelopeIcon, TrashIcon } from '@heroicons/react/24/outline'

export function SubscribersPage() {
  const { t } = useI18n()
  const [selectedPlan, setSelectedPlan] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const { data: plans = [], isLoading: plansLoading } = useQuery(
    ['my-plans'],
    () => subscriptionsAPI.getMyPlans().then(res => res.data?.data || [])
  )

  const { data: subscribers = [], isLoading: subsLoading } = useQuery(
    ['subscribers', selectedPlan, page],
    () => subscriptionsAPI.getSubscribers(selectedPlan !== 'all' ? selectedPlan : null, { page, limit: 20 }).then(res => res.data?.data || [])
  )

  const totalSubscribers = plans.reduce((sum, p) => sum + (p.subscriberCount || 0), 0)
  const isLoading = plansLoading || subsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <PageSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">{t('subscribers')}</h1>
        <p className="text-gray-400 mb-8">{t('manageSubscriberBase')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-gray-400 text-sm">{t('totalSubscribers')}</p>
            <p className="text-3xl font-bold text-gray-100 mt-2">{totalSubscribers}</p>
          </Card>
          <Card className="p-6">
            <p className="text-gray-400 text-sm">{t('avgMonthlyValue')}</p>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {plans.length > 0 ? Math.round(plans.reduce((s, p) => s + p.price, 0) / plans.length) : 0} {t('etb')}
            </p>
          </Card>
        </div>

        <div className="mb-6 flex gap-4">
          <Input
            placeholder={t('searchSubscribers')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <select
            value={selectedPlan}
            onChange={(e) => { setSelectedPlan(e.target.value); setPage(1) }}
            className="px-4 py-2 bg-charcoal-800 border border-charcoal-700 rounded-lg text-gray-300"
          >
            <option value="all">{t('allPlans')}</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
        </div>

        <Card>
          {subscribers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-charcoal-700">
                  <tr className="bg-charcoal-800">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">{t('subscriber')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">{t('plan')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">{t('joined')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">{t('status')}</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-300">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.filter(s => s.username?.toLowerCase().includes(searchQuery.toLowerCase())).map(sub => (
                    <tr key={sub.id} className="border-b border-charcoal-700 hover:bg-charcoal-800 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={sub.profileImage} size="sm" />
                          <div>
                            <p className="font-semibold text-gray-100">{sub.username}</p>
                            <p className="text-xs text-gray-400">{sub.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="primary">{sub.planName}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={sub.status === 'active' ? 'success' : 'secondary'}>
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <EnvelopeIcon className="w-4 h-4" />
                          </Button>
                          <Button variant="danger" size="sm">
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-400">{t('noSubscribersYet')}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
