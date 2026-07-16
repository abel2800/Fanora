import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { creatorsAPI, contentAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { normalizeDashboardResponse } from '../../lib/content'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import {
  PlayIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline'

export function CreatorDashboardPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const creatorId = user?.id

  const { data: stats, isLoading } = useQuery({
    queryKey: ['creator-stats', creatorId],
    enabled: !!creatorId,
    queryFn: async () => {
      try {
        const response = await creatorsAPI.getDashboard(creatorId)
        return normalizeDashboardResponse(response.data)
      } catch (err) {
        toast.error(t('failedToLoadCreatorStats'))
        return normalizeDashboardResponse({})
      }
    }
  })

  const { data: contentData } = useQuery({
    queryKey: ['creator-content', creatorId],
    enabled: !!creatorId,
    queryFn: async () => {
      try {
        const response = await contentAPI.getCreatorContent(creatorId, { limit: 5 })
        return response.data?.data || []
      } catch (err) {
        return []
      }
    }
  })

  const dashboardStats = stats || {
    followers: 0,
    subscribers: 0,
    totalViews: 0,
    earnings: 0,
    content: [],
    recentActivity: []
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-charcoal-700 rounded-card"></div>)}
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: t('followers'), value: dashboardStats.followers || 0, change: '12%', icon: UserGroupIcon, color: 'blue' },
    { label: t('subscribers'), value: dashboardStats.subscribers || 0, change: '5%', icon: CurrencyDollarIcon, color: 'green' },
    { label: t('totalViews'), value: (dashboardStats.totalViews || 0).toLocaleString(), change: '45%', icon: EyeIcon, color: 'purple' },
    { label: t('earnings'), value: `${(dashboardStats.earnings || 0).toFixed(2)} ${t('etb')}`, change: '23%', icon: ArrowTrendingUpIcon, color: 'yellow' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">{t('creatorDashboard')}</h1>
          <p className="text-gray-400 mt-2">{t('manageContentEarnings')}</p>
        </div>
        <Link to="/creator/content/create">
          <Button variant="primary">
            <PlayIcon className="h-4 w-4 mr-2" />
            {t('uploadContent')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-gray-100 mt-1">{stat.value}</h3>
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    {stat.change} {t('thisMonth')}
                  </p>
                </div>
                <div className={`bg-${stat.color}-100 rounded-full p-3`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-100">{t('recentContent')}</h2>
          <Link to="/creator/content">
            <Button variant="outline" size="sm">{t('viewAll')}</Button>
          </Link>
        </div>

        {contentData && contentData.length > 0 ? (
          <div className="divide-y divide-charcoal-700">
            {contentData.slice(0, 5).map((content) => (
              <div key={content.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="h-12 w-12 bg-charcoal-700 rounded flex items-center justify-center">
                    <PlayIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-100 line-clamp-1">{content.title}</p>
                    <p className="text-sm text-gray-400">
                      <EyeIcon className="h-3 w-3 inline mr-1" />
                      {(content.viewsCount || content.views || 0).toLocaleString()} {t('views')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <p className="text-sm text-gray-400">{t('likes')}</p>
                    <p className="font-medium text-gray-100">{content.likesCount || content.likes || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">{t('revenue')}</p>
                    <p className="font-medium text-gray-100">${(content.revenue || 0).toFixed(2)}</p>
                  </div>
                  <Badge variant={content.status === 'published' ? 'success' : 'warning'}>
                    {content.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">{t('noContentUploaded')}</p>
            <Link to="/creator/content/create" className="mt-4 inline-block">
              <Button variant="primary">{t('uploadFirstContent')}</Button>
            </Link>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/creator/earnings">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow p-6 text-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-100">{t('viewEarnings')}</h3>
            <p className="text-sm text-gray-400 mt-1">{t('detailedEarningsAnalytics')}</p>
          </Card>
        </Link>

        <Link to="/creator/subscribers">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow p-6 text-center">
            <UserGroupIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-100">{t('subscribers')}</h3>
            <p className="text-sm text-gray-400 mt-1">{t('manageSubscribers')}</p>
          </Card>
        </Link>

        <Link to="/creator/plans">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow p-6 text-center">
            <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-100">{t('subscriptionPlans')}</h3>
            <p className="text-sm text-gray-400 mt-1">{t('createManagePlans')}</p>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        <Link to="/creator/mass-message"><Card className="p-4 text-center hover:border-primary-500"><p className="font-medium text-gray-100">{t('massMessage')}</p></Card></Link>
        <Link to="/creator/bundles"><Card className="p-4 text-center hover:border-primary-500"><p className="font-medium text-gray-100">{t('bundles')}</p></Card></Link>
        <Link to="/creator/insights"><Card className="p-4 text-center hover:border-primary-500"><p className="font-medium text-gray-100">{t('insights')}</p></Card></Link>
        <Link to="/creator/referral"><Card className="p-4 text-center hover:border-primary-500"><p className="font-medium text-gray-100">{t('referrals')}</p></Card></Link>
        <Link to="/creator/requests"><Card className="p-4 text-center hover:border-primary-500"><p className="font-medium text-gray-100">{t('requestInbox')}</p></Card></Link>
        <Link to="/creator/calendar"><Card className="p-4 text-center hover:border-primary-500"><p className="font-medium text-gray-100">{t('contentCalendar')}</p></Card></Link>
        <Link to="/creator/onboarding"><Card className="p-4 text-center hover:border-primary-500"><p className="font-medium text-gray-100">{t('verification')}</p></Card></Link>
      </div>
    </div>
  )
}
