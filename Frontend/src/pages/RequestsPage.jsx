import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { PageSkeleton } from '../components/ui/Skeleton'
import { requestsAPI, creatorsAPI } from '../services/api'
import { useI18n } from '../contexts/I18nContext'
import toast from 'react-hot-toast'

const statusVariant = {
  pending: 'warning',
  accepted: 'success',
  declined: 'danger',
  delivered: 'primary',
  countered: 'secondary',
}

export function RequestsPage() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ creatorId: '', description: '', offeredPrice: '', dueAt: '' })
  const [creatorSearch, setCreatorSearch] = useState('')

  const { data: requests = [], isLoading } = useQuery(
    ['requests-mine'],
    () => requestsAPI.getMine(),
    { select: (res) => res.data?.data || [] }
  )

  const { data: creators = [] } = useQuery(
    ['creators-for-request', creatorSearch],
    () => creatorsAPI.getCreators({ search: creatorSearch || undefined, limit: 12 }),
    { select: (res) => res.data?.creators || res.data?.data || [], enabled: showForm }
  )

  const createMutation = useMutation(
    (payload) => requestsAPI.create(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['requests-mine'])
        setShowForm(false)
        setForm({ creatorId: '', description: '', offeredPrice: '', dueAt: '' })
        toast.success(t('requestSent'))
      },
      onError: (err) => toast.error(err.response?.data?.message || t('failedToCreateRequest')),
    }
  )

  const payMutation = useMutation(
    (requestId) => requestsAPI.pay(requestId, {}),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['requests-mine'])
        toast.success(t('requestPaymentCompleted'))
      },
      onError: (err) => toast.error(err.response?.data?.message || t('paymentFailed')),
    }
  )

  if (isLoading) return <PageSkeleton />

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-100">{t('myRequests')}</h1>
            <p className="text-gray-400 mt-1">{t('customContentFromCreators')}</p>
          </div>
          <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
            {t('newRequest')}
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-8 space-y-4 border-primary-500/20">
            <Input
              placeholder={`${t('search')} creators...`}
              value={creatorSearch}
              onChange={(e) => setCreatorSearch(e.target.value)}
            />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {creators.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, creatorId: c.id }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-pill border whitespace-nowrap transition ${
                    form.creatorId === c.id
                      ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                      : 'border-charcoal-600 text-gray-300 hover:border-charcoal-500'
                  }`}
                >
                  <Avatar src={c.profileImage} size="sm" />
                  @{c.username}
                </button>
              ))}
            </div>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={t('description')}
              rows={4}
              className="w-full bg-charcoal-800 border border-charcoal-600 rounded-card px-4 py-3 text-gray-100 placeholder:text-gray-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder={`${t('offeredPrice')} (${t('etb')})`}
                value={form.offeredPrice}
                onChange={(e) => setForm((f) => ({ ...f, offeredPrice: e.target.value }))}
              />
              <Input
                type="date"
                value={form.dueAt}
                onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>{t('cancel')}</Button>
              <Button
                variant="primary"
                disabled={createMutation.isLoading}
                onClick={() => createMutation.mutate({
                  creatorId: form.creatorId,
                  description: form.description,
                  offeredPrice: Number(form.offeredPrice),
                  dueAt: form.dueAt || undefined,
                })}
              >
                {t('send')}
              </Button>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card className="p-10 text-center text-gray-400">{t('noResults')}</Card>
          ) : (
            requests.map((req) => (
              <Card key={req.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={req.creator?.profileImage} size="md" />
                    <div>
                      <p className="font-semibold text-gray-100">@{req.creator?.username}</p>
                      <p className="text-sm text-gray-400 mt-1">{req.description}</p>
                    </div>
                  </div>
                  <Badge variant={statusVariant[req.status] || 'secondary'}>
                    {t(req.status) || req.status}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
                  <span>{t('offeredPrice')}: <span className="text-primary-400 font-medium">{req.offeredPrice} {t('etb')}</span></span>
                  {req.counterPrice != null && (
                    <span>{t('counter')}: <span className="text-primary-400 font-medium">{req.counterPrice} {t('etb')}</span></span>
                  )}
                </div>
                {['accepted', 'countered'].includes(req.status) && req.paymentStatus !== 'paid' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-4"
                    disabled={payMutation.isLoading}
                    onClick={() => payMutation.mutate(req.id)}
                  >
                    {t('payAmount').replace('{amount}', req.counterPrice || req.offeredPrice)}
                  </Button>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
