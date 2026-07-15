import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { HeartIcon, ChatBubbleLeftIcon, UserPlusIcon, StarIcon, GiftIcon } from '@heroicons/react/24/outline'
import { notificationsAPI } from '../../services/api'
import { formatRelativeTime } from '../../lib/utils'
import toast from 'react-hot-toast'

export function NotificationPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all')

  const { data, isLoading } = useQuery(
    ['notifications'],
    () => notificationsAPI.getNotifications({ limit: 50 }),
    { select: (res) => res.data.data || [] }
  )

  const markAllMutation = useMutation(
    () => notificationsAPI.markAllAsRead(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications')
        toast.success('All notifications marked as read')
      },
    }
  )

  const notifications = data || []

  const filtered = notifications.filter((notification) => {
    if (filter === 'all') return true
    if (filter === 'likes') return notification.type === 'content_like'
    if (filter === 'comments') return notification.type === 'content_comment'
    if (filter === 'follows') return notification.type === 'new_follower'
    if (filter === 'tips') return notification.type === 'tip_received'
    return true
  })

  const getIcon = (type) => {
    switch (type) {
      case 'content_like': return <HeartIcon className="w-5 h-5 text-red-500" />
      case 'content_comment': return <ChatBubbleLeftIcon className="w-5 h-5 text-blue-400" />
      case 'new_follower': return <UserPlusIcon className="w-5 h-5 text-green-400" />
      case 'new_subscriber': return <StarIcon className="w-5 h-5 text-primary-500" />
      case 'tip_received': return <GiftIcon className="w-5 h-5 text-yellow-400" />
      default: return <StarIcon className="w-5 h-5 text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Notifications</h1>
          <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()}>
            Mark all as read
          </Button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'likes', 'comments', 'follows', 'tips'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-charcoal-800 text-gray-400 hover:bg-charcoal-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="p-8 text-center text-gray-400">
              No notifications yet
            </Card>
          ) : (
            filtered.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 flex items-start gap-4 ${
                  !notification.isRead ? 'border-primary-500/30 bg-charcoal-800/80' : ''
                }`}
              >
                <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                <Avatar
                  src={notification.relatedUser?.profileImage}
                  alt={notification.relatedUser?.username}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-100">
                    {notification.relatedUser && (
                      <span className="font-semibold">@{notification.relatedUser.username} </span>
                    )}
                    {notification.message || notification.title}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead && (
                  <Badge variant="primary" size="sm">New</Badge>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
