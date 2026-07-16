import { useQuery } from 'react-query'
import { creatorsAPI } from '../../services/api'
import { useI18n } from '../../contexts/I18nContext'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import toast from 'react-hot-toast'

export function ReferralProgramPage() {
  const { t } = useI18n()

  const { data, isLoading } = useQuery(['referral'], () =>
    creatorsAPI.getReferral().then((r) => r.data?.data || {})
  )

  const copyLink = () => {
    navigator.clipboard.writeText(data.referralLink || '')
    toast.success(t('linkCopied'))
  }

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse h-64 bg-charcoal-800 rounded-card" />
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-gray-100 mb-2">{t('referralProgram')}</h1>
      <p className="text-gray-400 mb-8">{t('referralSubtitle')}</p>

      <Card className="p-6 mb-6">
        <p className="text-gray-400 text-sm">{t('yourReferralCode')}</p>
        <p className="text-2xl font-display text-primary-500 mt-1">{data.referralCode}</p>
        <Button variant="primary" className="mt-4" onClick={copyLink}>{t('copyReferralLink')}</Button>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-6 text-center">
          <p className="text-3xl font-display text-gray-100">{data.qualifiedCount || 0}</p>
          <p className="text-gray-400 text-sm mt-1">{t('qualifiedReferrals')}</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-3xl font-display text-primary-500">{data.totalBonus || 0} {t('etb')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('bonusEarned')}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-100 mb-4">{t('recentReferrals')}</h2>
        {(data.referrals || []).length ? (
          <ul className="space-y-2">
            {data.referrals.map((r) => (
              <li key={r.id} className="flex justify-between text-gray-300 text-sm">
                <span>{r.referredCreator?.username || t('pending')}</span>
                <span className="text-gray-500">{r.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">{t('shareLinkToStart')}</p>
        )}
      </Card>
    </div>
  )
}
