import { useQuery } from 'react-query'
import { creatorsAPI } from '../../services/api'
import { useI18n } from '../../contexts/I18nContext'
import { Card } from '../../components/ui/Card'
import { FeedSkeleton } from '../../components/ui/Skeleton'

export function AudienceInsightsPage() {
  const { t } = useI18n()

  const { data, isLoading } = useQuery(['creator-insights'], () =>
    creatorsAPI.getInsights({ days: 30 }).then((r) => r.data?.data || {})
  )

  if (isLoading) return <FeedSkeleton />

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-gray-100 mb-8">{t('audienceInsights')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <p className="text-gray-400 text-sm">{t('activeSubscribers')}</p>
          <p className="text-3xl font-display text-primary-500 mt-2">{data.activeSubscribers || 0}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-400 text-sm">{t('tips30d')}</p>
          <p className="text-3xl font-display text-primary-500 mt-2">{data.tipsRevenue || 0} {t('etb')}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-400 text-sm">{t('bestContentType')}</p>
          <p className="text-3xl font-display text-primary-500 mt-2 capitalize">{data.bestContentType || '—'}</p>
        </Card>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">{t('retentionCurve')}</h2>
        <div className="flex items-end gap-4 h-32">
          {(data.retentionCurve || []).map((w) => (
            <div key={w.week} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-primary-500/80 rounded-t-md"
                style={{ height: `${Math.max(12, (w.subscribers / Math.max(1, data.activeSubscribers)) * 100)}%` }}
              />
              <span className="text-xs text-gray-500">{w.week}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">{t('churnReasons')}</h2>
        {Object.keys(data.churnReasons || {}).length ? (
          <ul className="space-y-2">
            {Object.entries(data.churnReasons).map(([reason, count]) => (
              <li key={reason} className="flex justify-between text-gray-300">
                <span>{reason}</span>
                <span className="text-gray-500">{count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">{t('noChurnData')}</p>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">{t('topPerformingContent')}</h2>
        <div className="space-y-3">
          {(data.topContent || []).map((c) => (
            <div key={c.id} className="flex justify-between text-gray-300">
              <span>{c.title}</span>
              <span className="text-gray-500">{c.viewsCount || 0} {t('views')}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
