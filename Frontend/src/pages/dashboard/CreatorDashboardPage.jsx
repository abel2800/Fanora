import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { creatorsAPI, contentAPI } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import {
  HomeIcon,
  PlayIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  HeartIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline'

export function CreatorDashboardPage() {
  // Fetch creator stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['creator-stats'],
    queryFn: async () => {
      try {
        const response = await creatorsAPI.getDashboard()
        return response.data
      } catch (err) {
        toast.error('Failed to load creator stats')
        return {
          followers: 0,
          subscribers: 0,
          totalViews: 0,
          earnings: 0,
          content: [],
          recentActivity: []
        }
      }
    }
  })

  // Fetch recent content
  const { data: contentData } = useQuery({
    queryKey: ['creator-content'],
    queryFn: async () => {
      try {
        const response = await contentAPI.getCreatorContent()
        return response.data || []
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
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your content and earnings</p>
        </div>
        <Link to="/creator/content/create">
          <Button variant="primary">
            <PlayIcon className="h-4 w-4 mr-2" />
            Upload Content
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Followers</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {dashboardStats.followers || 0}
              </h3>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                12% this month
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Subscribers</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {dashboardStats.subscribers || 0}
              </h3>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                5% this month
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Views</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {(dashboardStats.totalViews || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                45% this month
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <EyeIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Earnings</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                ${(dashboardStats.earnings || 0).toFixed(2)}
              </h3>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                23% this month
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Content */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Content</h2>
          <Link to="/creator/content/manage">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>

        {contentData && contentData.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {contentData.slice(0, 5).map((content) => (
              <div key={content.id} className="py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                    <PlayIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 line-clamp-1">{content.title}</p>
                    <p className="text-sm text-gray-600">
                      <EyeIcon className="h-3 w-3 inline mr-1" />
                      {(content.views || 0).toLocaleString()} views
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <p className="text-sm text-gray-600">Likes</p>
                    <p className="font-medium text-gray-900">{content.likes || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="font-medium text-gray-900">${(content.revenue || 0).toFixed(2)}</p>
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
            <p className="text-gray-600">No content uploaded yet</p>
            <Link to="/creator/content/create" className="mt-4 inline-block">
              <Button variant="primary">Upload Your First Content</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/creator/earnings">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow p-6 text-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">View Earnings</h3>
            <p className="text-sm text-gray-600 mt-1">Detailed earnings analytics</p>
          </Card>
        </Link>

        <Link to="/creator/subscribers">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow p-6 text-center">
            <UserGroupIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Subscribers</h3>
            <p className="text-sm text-gray-600 mt-1">Manage subscribers</p>
          </Card>
        </Link>

        <Link to="/creator/plans">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow p-6 text-center">
            <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Subscription Plans</h3>
            <p className="text-sm text-gray-600 mt-1">Create & manage plans</p>
          </Card>
        </Link>
      </div>
    </div>
  )
}
