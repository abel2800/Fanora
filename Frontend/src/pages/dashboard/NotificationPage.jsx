import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { PageSkeleton } from '../../components/ui/Skeleton'
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
  StarIcon,
  GiftIcon,
} from '@heroicons/react/24/outline'
import { notificationsAPI } from '../../services/api'
import { formatRelativeTime } from '../../lib/utils'
import { useI18n } from '../../contexts/I18nContext'
import toast from 'react-hot-toast'

function resolveDeepLink(notification) {
  const data = notification?.data || {}
  if (data.deepLink) return data.deepLink
  if (notification.relatedContentId) return `/content/${notification.relatedContentId}`
  if (data.contentId) return `/content/${data.contentId}`
  if (data.requestId) {
    if (notification.type?.includes('custom_request') && !notification.type.includes('update')) {
      return `/creator/requests`
    }
    return '/requests'
  }
  if (data.messageId || notification.type === 'message_received') {
    return notification.relatedUserId ? `/messages/${notification.relatedUserId}` : '/messages'
  }
  if (notification.relatedUserId && (notification.type === 'new_follower' || notification.type === 'new_subscriber')) {
    return '/following'
  }
  if (notification.type === 'tip_received') return '/tips'
  if (notification.type === 'verification_update') return '/creator/onboarding'
  return null
}

const FILTER_KEYS = [
  { key: 'all', labelKey: 'all' },
  { key: 'likes', labelKey: 'filterLikes' },
  { key: 'comments', labelKey: 'filterComments' },
  { key: 'follows', labelKey: 'filterFollows' },
  { key: 'tips', labelKey: 'filterTips' },
]

export function NotificationPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useI18n()
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
        toast.success(t('allMarkedRead'))
      },
    }
  )

  const markReadMutation = useMutation(
    (id) => notificationsAPI.markAsRead(id),
    { onSuccess: () => queryClient.invalidateQueries('notifications') }
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
      case 'content_like': return <HeartIcon className="w-5 h-5 text-red-400" />
      case 'content_comment': return <ChatBubbleLeftIcon className="w-5 h-5 text-primary-400" />
      case 'new_follower': return <UserPlusIcon className="w-5 h-5 text-success-500" />
      case 'new_subscriber': return <StarIcon className="w-5 h-5 text-primary-500" />
      case 'tip_received': return <GiftIcon className="w-5 h-5 text-primary-400" />
      default: return <StarIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const openNotification = (notification) => {
    if (!notification.isRead) markReadMutation.mutate(notification.id)
    const link = resolveDeepLink(notification)
    if (link) navigate(link)
  }

  if (isLoading) return <PageSkeleton />

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-100">{t('notifications')}</h1>
          <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()}>
            {t('markAllRead')}
          </Button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {FILTER_KEYS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === f.key
                  ? 'bg-primary-500 text-charcoal-900'
                  : 'bg-charcoal-800 text-gray-400 hover:bg-charcoal-700'
              }`}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="p-8 text-center text-gray-400">{t('noNotifications')}</Card>
          ) : (
            filtered.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => openNotification(notification)}
                className="w-full text-left"
              >
                <Card
                  className={`p-4 flex items-start gap-4 hover:border-primary-500/30 transition ${
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
                    <Badge variant="primary" size="sm">{t('newBadge')}</Badge>
                  )}
                </Card>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
