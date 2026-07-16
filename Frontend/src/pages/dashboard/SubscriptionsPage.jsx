import { useQuery, useMutation, useQueryClient } from 'react-query'
import { subscriptionsAPI } from '../../services/api'
import { useI18n } from '../../contexts/I18nContext'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import toast from 'react-hot-toast'
import { CreditCardIcon } from '@heroicons/react/24/outline'

export function SubscriptionsPage() {
  const { t } = useI18n()
  const queryClient = useQueryClient()

  const { data: subs = [], isLoading } = useQuery({
    queryKey: ['my-subscriptions'],
    queryFn: () => subscriptionsAPI.getMySubscriptions().then((r) => r.data?.data || []),
  })

  const pauseMutation = useMutation(
    (id) => subscriptionsAPI.pauseSubscription(id),
    { onSuccess: () => { queryClient.invalidateQueries('my-subscriptions'); toast.success(t('subscriptionPaused')) } }
  )

  const cancelMutation = useMutation(
    (id) => subscriptionsAPI.cancelSubscription(id, { reason: 'User cancelled' }),
    { onSuccess: () => { queryClient.invalidateQueries('my-subscriptions'); toast.success(t('cancelled')) } }
  )

  if (isLoading) {
    return <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-charcoal-800 rounded-card" />)}</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-gray-100 mb-2">{t('mySubscriptions')}</h1>
      <p className="text-gray-400 mb-8">{t('pauseOrCancelAnytime')}</p>

      {subs.length > 0 ? (
        <div className="space-y-4">
          {subs.map((sub) => {
            const creator = sub.plan?.creator
            return (
              <Card key={sub.id} className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar src={creator?.profileImage} size="md" />
                    <div>
                      <h3 className="font-semibold text-gray-100">@{creator?.username || t('creator')}</h3>
                      <p className="text-sm text-gray-400">{sub.plan?.name} · {sub.plan?.price} {t('etb')}/mo</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('renews')} {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={sub.status === 'active' ? 'success' : 'warning'}>{sub.status}</Badge>
                    {sub.status === 'active' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => pauseMutation.mutate(sub.id)}>{t('pause')}</Button>
                        <Button size="sm" variant="danger" onClick={() => cancelMutation.mutate(sub.id)}>{t('cancel')}</Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CreditCardIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">{t('noActiveSubscriptions')}</p>
        </Card>
      )}
    </div>
  )
}
