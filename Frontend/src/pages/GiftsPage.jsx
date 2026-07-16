import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { PageSkeleton } from '../components/ui/Skeleton'
import { giftsAPI, subscriptionsAPI } from '../services/api'
import { useI18n } from '../contexts/I18nContext'
import toast from 'react-hot-toast'

export function GiftsPage() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('gift')
  const [planId, setPlanId] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [pin, setPin] = useState('')
  const [code, setCode] = useState('')

  const { data: gifts = [], isLoading } = useQuery(
    ['gifts-mine'],
    () => giftsAPI.getMine(),
    { select: (res) => res.data?.data || [] }
  )

  const { data: plans = [] } = useQuery(
    ['popular-plans-gifts'],
    () => subscriptionsAPI.getPopularPlans({ limit: 20 }),
    { select: (res) => res.data?.data || res.data?.plans || [] }
  )

  const createMutation = useMutation(
    (data) => giftsAPI.create(data),
    {
      onSuccess: (res) => {
        queryClient.invalidateQueries(['gifts-mine'])
        toast.success(t('giftCreated').replace('{code}', res.data?.data?.code))
        setRecipientPhone('')
        setPin('')
      },
      onError: (err) => toast.error(err.response?.data?.message || t('failedToCreateGift')),
    }
  )

  const redeemMutation = useMutation(
    (data) => giftsAPI.redeem(data),
    {
      onSuccess: () => {
        toast.success(t('giftRedeemed'))
        setCode('')
        queryClient.invalidateQueries(['my-subscriptions'])
      },
      onError: (err) => toast.error(err.response?.data?.message || t('invalidGiftCode')),
    }
  )

  if (isLoading) return <PageSkeleton />

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-gray-100 mb-2">{t('gifts')}</h1>
        <p className="text-gray-400 mb-8">{t('giftOrRedeemSubtitle')}</p>

        <div className="flex rounded-pill border border-charcoal-600 overflow-hidden mb-8 w-fit">
          <button
            type="button"
            onClick={() => setTab('gift')}
            className={`px-5 py-2 text-sm font-medium ${tab === 'gift' ? 'bg-primary-500 text-charcoal-900' : 'text-gray-300'}`}
          >
            {t('giftSubscription')}
          </button>
          <button
            type="button"
            onClick={() => setTab('redeem')}
            className={`px-5 py-2 text-sm font-medium ${tab === 'redeem' ? 'bg-primary-500 text-charcoal-900' : 'text-gray-300'}`}
          >
            {t('redeemGift')}
          </button>
        </div>

        {tab === 'gift' ? (
          <Card className="p-6 space-y-4 mb-8">
            <label className="block text-sm text-gray-400">
              {t('plan')}
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="mt-1 w-full bg-charcoal-800 border border-charcoal-600 rounded-lg px-3 py-2 text-gray-100"
              >
                <option value="">{t('selectPlan')}</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — {plan.price} {t('etb')}
                  </option>
                ))}
              </select>
            </label>
            <Input
              placeholder={t('recipientPhone')}
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
            />
            <Input
              type="password"
              placeholder={t('walletPinIfSet')}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <Button
              variant="primary"
              disabled={!planId || createMutation.isLoading}
              onClick={() => createMutation.mutate({
                planId,
                recipientPhone: recipientPhone || undefined,
                pin: pin || undefined,
              })}
            >
              {t('create')}
            </Button>
          </Card>
        ) : (
          <Card className="p-6 space-y-4 mb-8">
            <Input
              placeholder={t('giftCode')}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <Button
              variant="primary"
              disabled={!code.trim() || redeemMutation.isLoading}
              onClick={() => redeemMutation.mutate({ code: code.trim() })}
            >
              {t('redeem')}
            </Button>
          </Card>
        )}

        <h2 className="text-lg font-semibold text-gray-100 mb-4">{t('gifts')}</h2>
        <div className="space-y-3">
          {gifts.length === 0 ? (
            <Card className="p-8 text-center text-gray-400">{t('noGifts')}</Card>
          ) : (
            gifts.map((gift) => (
              <Card key={gift.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-primary-400 font-semibold">{gift.code}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {gift.plan?.name || 'Plan'} · {gift.amount} {t('etb')}
                  </p>
                </div>
                <Badge variant={gift.status === 'active' ? 'success' : gift.status === 'redeemed' ? 'primary' : 'secondary'}>
                  {gift.status}
                </Badge>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
