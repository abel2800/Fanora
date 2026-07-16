import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { trustAPI } from '../services/api'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useI18n } from '../contexts/I18nContext'
import toast from 'react-hot-toast'

export function TrustCenterPage() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const [report, setReport] = useState({ type: 'user', reason: '', targetUserId: '' })

  const { data: reports = [] } = useQuery(['trust-reports'], () =>
    trustAPI.getReports().then((r) => r.data?.data || [])
  )

  const { data: blocked = [] } = useQuery(['blocked-users'], () =>
    trustAPI.getBlocked().then((r) => r.data?.data || [])
  )

  const submitMutation = useMutation(
    () => trustAPI.submitReport(report),
    {
      onSuccess: () => {
        toast.success(t('reportSubmitted'))
        queryClient.invalidateQueries('trust-reports')
        setReport({ type: 'user', reason: '', targetUserId: '' })
      },
      onError: (e) => toast.error(e.response?.data?.message || t('failedToSubmit')),
    }
  )

  const unblockMutation = useMutation(
    (userId) => trustAPI.unblockUser(userId),
    { onSuccess: () => queryClient.invalidateQueries('blocked-users') }
  )

  const reportTypeLabels = {
    user: t('reportUser'),
    content: t('reportContent'),
    refund: t('refundRequest'),
    dispute: t('dispute'),
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-gray-100 mb-2">{t('trust')}</h1>
      <p className="text-gray-400 mb-8">{t('trustCenterSubtitle')}</p>

      <Card className="p-6 mb-8 space-y-4">
        <h2 className="font-semibold text-gray-100">{t('fileAReport')}</h2>
        <select
          className="input-base"
          value={report.type}
          onChange={(e) => setReport({ ...report, type: e.target.value })}
        >
          <option value="user">{t('reportUser')}</option>
          <option value="content">{t('reportContent')}</option>
          <option value="refund">{t('refundRequest')}</option>
          <option value="dispute">{t('dispute')}</option>
        </select>
        <Input placeholder={t('targetUserId')} value={report.targetUserId} onChange={(e) => setReport({ ...report, targetUserId: e.target.value })} />
        <textarea className="input-base min-h-[100px]" placeholder={t('describeIssue')} value={report.reason} onChange={(e) => setReport({ ...report, reason: e.target.value })} />
        <Button variant="primary" onClick={() => submitMutation.mutate()} disabled={!report.reason.trim()}>{t('submitReport')}</Button>
      </Card>

      <Card className="p-6 mb-8">
        <h2 className="font-semibold text-gray-100 mb-4">{t('yourReports')}</h2>
        {reports.length ? reports.map((r) => (
          <div key={r.id} className="py-3 border-b border-charcoal-700 last:border-0">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{reportTypeLabels[r.type] || r.type}</span>
              <span className="text-primary-500">{t(r.status) || r.status}</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{r.reason}</p>
          </div>
        )) : <p className="text-gray-500">{t('noReportsYet')}</p>}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-100 mb-4">{t('blockedUsers')}</h2>
        {blocked.length ? blocked.map((u) => (
          <div key={u.id} className="flex justify-between items-center py-2">
            <span className="text-gray-300">@{u.username}</span>
            <Button size="sm" variant="outline" onClick={() => unblockMutation.mutate(u.id)}>{t('unblock')}</Button>
          </div>
        )) : <p className="text-gray-500">{t('noBlockedUsers')}</p>}
      </Card>
    </div>
  )
}
