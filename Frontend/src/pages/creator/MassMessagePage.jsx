import { useState } from 'react'
import { useMutation } from 'react-query'
import { messagesAPI } from '../../services/api'
import { useI18n } from '../../contexts/I18nContext'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import toast from 'react-hot-toast'

export function MassMessagePage() {
  const { t } = useI18n()
  const [content, setContent] = useState('')
  const [price, setPrice] = useState('')
  const [segment, setSegment] = useState('all')

  const segments = [
    { id: 'all', labelKey: 'allSubscribers' },
    { id: 'new', labelKey: 'newThisWeek' },
    { id: 'loyal', labelKey: 'loyal3Months' },
  ]

  const mutation = useMutation(
    () => messagesAPI.sendBlast({
      content,
      price: price ? parseFloat(price) : 0,
      segment,
    }),
    {
      onSuccess: (res) => {
        toast.success(res.data?.message || t('messageSent'))
        setContent('')
        setPrice('')
      },
      onError: (e) => toast.error(e.response?.data?.message || t('failedToSend')),
    }
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-gray-100 mb-2">{t('massMessageTitle')}</h1>
      <p className="text-gray-400 mb-8">{t('massMessageSubtitle')}</p>

      <Card className="p-6 space-y-6">
        <div>
          <label className="text-sm text-gray-300 mb-2 block">{t('audience')}</label>
          <div className="flex flex-wrap gap-2">
            {segments.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSegment(s.id)}
                className={`px-4 py-2 rounded-pill text-sm border ${
                  segment === s.id ? 'border-primary-500 bg-primary-500/10 text-primary-500' : 'border-charcoal-700 text-gray-400'
                }`}
              >
                {t(s.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-300 mb-2 block">{t('message')}</label>
          <textarea
            className="input-base min-h-[120px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('writeMessage')}
          />
        </div>

        <div>
          <label className="text-sm text-gray-300 mb-2 block">{t('ppvPriceOptional')}</label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t('freeMessage')} />
        </div>

        <Button
          variant="primary"
          onClick={() => mutation.mutate()}
          disabled={!content.trim() || mutation.isLoading}
        >
          {mutation.isLoading ? t('sending') : t('sendBlast')}
        </Button>
      </Card>
    </div>
  )
}
