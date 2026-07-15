import { useQuery } from 'react-query'
import { subscriptionsAPI } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import toast from 'react-hot-toast'
import {
  CreditCardIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

export function SubscriptionsPage() {
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['my-subscriptions'],
    queryFn: async () => {
      try {
        const response = await subscriptionsAPI.getSubscriptions()
        return response.data || []
      } catch (err) {
        toast.error('Failed to load subscriptions')
        return []
      }
    }
  })

  const subs = subscriptions || []

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 rounded"></div>)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Subscriptions</h1>
        <p className="text-gray-600 mt-2">
          Manage all your active subscriptions
        </p>
      </div>

      {subs.length > 0 ? (
        <div className="space-y-4">
          {subs.map((sub) => (
            <Card key={sub.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar
                    src={sub.creator?.avatar}
                    alt={sub.creator?.firstName}
                    className="h-12 w-12"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {sub.creator?.firstName} {sub.creator?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {sub.plan?.name} • ${sub.plan?.price}/month
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Subscribed since {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Badge variant={sub.status === 'active' ? 'success' : 'warning'}>
                    {sub.status}
                  </Badge>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => toast.success('Subscription cancelled')}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Subscription Details */}
              {sub.plan?.features && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">Includes:</p>
                  <ul className="space-y-1">
                    {sub.plan.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center">
                        <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No active subscriptions
          </h3>
          <p className="text-gray-600">
            Browse creators and subscribe to exclusive content
          </p>
        </Card>
      )}
    </div>
  )
}
