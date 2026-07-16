import { useQuery, useMutation, useQueryClient } from 'react-query'
import { adminAPI } from '../../services/api'
import { useI18n } from '../../contexts/I18nContext'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export function AdminDashboardPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const queryClient = useQueryClient()

  if (user?.role !== 'admin') return <Navigate to="/home" replace />

  const { data: stats } = useQuery(['admin-stats'], () =>
    adminAPI.getStats().then((r) => r.data?.data || {})
  )

  const { data: verification = [] } = useQuery(['admin-verification'], () =>
    adminAPI.getVerificationQueue().then((r) => r.data?.data || [])
  )

  const { data: moderation = [] } = useQuery(['admin-moderation'], () =>
    adminAPI.getModerationQueue().then((r) => r.data?.data || [])
  )

  const { data: disputes = [] } = useQuery(['admin-disputes'], () =>
    adminAPI.getDisputes().then((r) => r.data?.data || [])
  )

  const reviewVerification = useMutation(
    ({ userId, action }) => adminAPI.reviewVerification(userId, { action }),
    { onSuccess: () => queryClient.invalidateQueries('admin-verification') }
  )

  const reviewContent = useMutation(
    ({ contentId, action }) => adminAPI.reviewContent(contentId, { action }),
    { onSuccess: () => queryClient.invalidateQueries('admin-moderation') }
  )

  const resolveDispute = useMutation(
    (reportId) => adminAPI.resolveDispute(reportId, { status: 'resolved' }),
    { onSuccess: () => queryClient.invalidateQueries('admin-disputes') }
  )

  const statCards = [
    ['gmv', `${stats?.gmv || 0} ${t('etb')}`],
    ['creators', stats?.activeCreators || 0],
    ['fans', stats?.activeFans || 0],
    ['openReports', stats?.openReports || 0],
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-gray-100 mb-8">{t('adminPanel')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(([label, val]) => (
          <Card key={label} className="p-4 text-center">
            <p className="text-gray-400 text-sm">{t(label)}</p>
            <p className="text-xl font-display text-primary-500 mt-1">{val}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-100 mb-4">{t('verificationQueue')}</h2>
        {verification.map((application) => (
          <div key={application.id} className="flex flex-col gap-3 py-4 border-b border-charcoal-700 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-gray-100 font-medium">@{application.user?.username}</span>
              <p className="text-xs text-gray-500 mt-1">
                {application.idType} · {t('payout')}: {application.payoutMethod || t('notSet')}
              </p>
              <div className="flex gap-3 mt-2 text-xs">
                {application.idFrontUrl && <a className="text-primary-500" href={application.idFrontUrl} target="_blank" rel="noreferrer">{t('viewId')}</a>}
                {application.selfieUrl && <a className="text-primary-500" href={application.selfieUrl} target="_blank" rel="noreferrer">{t('viewSelfie')}</a>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={() => reviewVerification.mutate({ userId: application.userId, action: 'approve' })}>{t('approve')}</Button>
              <Button size="sm" variant="danger" onClick={() => reviewVerification.mutate({ userId: application.userId, action: 'reject' })}>{t('reject')}</Button>
            </div>
          </div>
        ))}
        {!verification.length && <p className="text-gray-500">{t('queueEmpty')}</p>}
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-100 mb-4">{t('contentModeration')}</h2>
        {moderation.map((c) => (
          <div key={c.id} className="flex justify-between items-center py-2 border-b border-charcoal-700">
            <span className="text-gray-300">{c.title}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={() => reviewContent.mutate({ contentId: c.id, action: 'approve' })}>{t('approve')}</Button>
              <Button size="sm" variant="danger" onClick={() => reviewContent.mutate({ contentId: c.id, action: 'reject' })}>{t('reject')}</Button>
            </div>
          </div>
        ))}
        {!moderation.length && <p className="text-gray-500">{t('queueEmpty')}</p>}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-100 mb-4">{t('disputes')}</h2>
        {disputes.map((d) => (
          <div key={d.id} className="flex justify-between items-center py-2 border-b border-charcoal-700">
            <span className="text-gray-300 text-sm">{d.reason}</span>
            <Button size="sm" variant="outline" onClick={() => resolveDispute.mutate(d.id)}>{t('resolve')}</Button>
          </div>
        ))}
        {!disputes.length && <p className="text-gray-500">{t('noOpenDisputes')}</p>}
      </Card>
    </div>
  )
}
