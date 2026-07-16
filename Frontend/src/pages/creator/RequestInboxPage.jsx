import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { requestsAPI } from '../../services/api'
import { useI18n } from '../../contexts/I18nContext'
import toast from 'react-hot-toast'

const statusVariant = {
  pending: 'warning',
  accepted: 'success',
  declined: 'danger',
  delivered: 'primary',
  countered: 'secondary',
}

export function RequestInboxPage() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const [counterPrices, setCounterPrices] = useState({})
  const [deliveryIds, setDeliveryIds] = useState({})

  const { data: requests = [], isLoading } = useQuery(
    ['requests-inbox'],
    () => requestsAPI.getInbox(),
    { select: (res) => res.data?.data || [] }
  )

  const respondMutation = useMutation(
    ({ id, ...data }) => requestsAPI.respond(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['requests-inbox'])
        toast.success(t('responseSent'))
      },
      onError: (err) => toast.error(err.response?.data?.message || t('failed')),
    }
  )

  const deliverMutation = useMutation(
    ({ id, contentId }) => requestsAPI.deliver(id, { contentId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['requests-inbox'])
        toast.success(t('markedDelivered'))
      },
      onError: (err) => toast.error(err.response?.data?.message || t('failed')),
    }
  )

  if (isLoading) return <PageSkeleton />

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-gray-100 mb-2">{t('requestInbox')}</h1>
        <p className="text-gray-400 mb-8">{t('respondToRequests')}</p>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card className="p-10 text-center text-gray-400">{t('noResults')}</Card>
          ) : (
            requests.map((req) => (
              <Card key={req.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={req.fan?.profileImage} size="md" />
                    <div>
                      <p className="font-semibold text-gray-100">
                        {req.fan?.isIncognito ? req.fan.username : `@${req.fan?.username}`}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">{req.description}</p>
                    </div>
                  </div>
                  <Badge variant={statusVariant[req.status] || 'secondary'}>
                    {t(req.status) || req.status}
                  </Badge>
                </div>

                <p className="text-sm text-gray-400">
                  {t('offeredPrice')}: <span className="text-primary-400 font-medium">{req.offeredPrice} {t('etb')}</span>
                  {req.counterPrice != null && (
                    <> · {t('counter')}: <span className="text-primary-400 font-medium">{req.counterPrice} {t('etb')}</span></>
                  )}
                </p>

                {req.status === 'pending' && (
                  <div className="flex flex-wrap gap-2 items-end">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => respondMutation.mutate({ id: req.id, action: 'accept' })}
                    >
                      {t('accept')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => respondMutation.mutate({ id: req.id, action: 'decline' })}
                    >
                      {t('decline')}
                    </Button>
                    <div className="flex gap-2 items-end flex-1 min-w-[200px]">
                      <Input
                        type="number"
                        placeholder={t('counter')}
                        value={counterPrices[req.id] || ''}
                        onChange={(e) => setCounterPrices((p) => ({ ...p, [req.id]: e.target.value }))}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => respondMutation.mutate({
                          id: req.id,
                          action: 'counter',
                          counterPrice: Number(counterPrices[req.id]),
                        })}
                      >
                        {t('counter')}
                      </Button>
                    </div>
                  </div>
                )}

                {req.status === 'accepted' && (
                  <div className="flex gap-2 items-end">
                    <Input
                      placeholder={t('contentIdOptional')}
                      value={deliveryIds[req.id] || ''}
                      onChange={(e) => setDeliveryIds((p) => ({ ...p, [req.id]: e.target.value }))}
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => deliverMutation.mutate({
                        id: req.id,
                        contentId: deliveryIds[req.id] || undefined,
                      })}
                    >
                      {t('deliver')}
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
