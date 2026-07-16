import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { usersAPI, contentAPI, subscriptionsAPI } from '../services/api'
import { PaywallSheet } from '../components/features/PaywallSheet'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { PageSkeleton } from '../components/ui/Skeleton'
import { useI18n } from '../contexts/I18nContext'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export function CreatorProfilePage() {
  const { t } = useI18n()
  const { username } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [paywall, setPaywall] = useState({ open: false, plan: null })

  const { data: profile, isLoading } = useQuery(['profile', username], async () => {
    const { data } = await usersAPI.getProfile(username)
    return data.user || data
  })

  const { data: posts = [] } = useQuery(
    ['creator-content', profile?.id],
    async () => {
      const { data } = await contentAPI.getCreatorContent(profile.id, { status: 'published' })
      return data.data || data || []
    },
    { enabled: !!profile?.id }
  )

  const { data: plans = [] } = useQuery(
    ['creator-plans', profile?.id],
    async () => {
      const { data } = await subscriptionsAPI.getCreatorPlans(profile.id)
      return data.data || data || []
    },
    { enabled: !!profile?.id }
  )

  const followMutation = useMutation(
    () =>
      profile?.isFollowing
        ? usersAPI.unfollowUser(profile.id)
        : usersAPI.followUser(profile.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profile', username])
        toast.success(profile?.isFollowing ? t('unfollowed') : t('followed'))
      },
      onError: (e) => toast.error(e.response?.data?.message || t('actionFailed')),
    }
  )

  const subscribeMutation = useMutation((planId) => subscriptionsAPI.subscribe(planId), {
    onSuccess: () => {
      toast.success(t('subscribedSuccessfully'))
      queryClient.invalidateQueries(['profile', username])
    },
    onError: (e) => toast.error(e.response?.data?.message || t('subscriptionFailed')),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <PageSkeleton />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center text-gray-300">
        {t('creatorNotFound')}
      </div>
    )
  }

  const isSelf = user?.id === profile.id

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-2xl overflow-hidden bg-charcoal-800 mb-6">
          <div
            className="h-40 bg-charcoal-700"
            style={
              profile.coverImage
                ? { backgroundImage: `url(${profile.coverImage})`, backgroundSize: 'cover' }
                : undefined
            }
          />
          <div className="p-6 -mt-10 relative">
            <Avatar
              src={profile.profileImage}
              alt={profile.username}
              className="w-20 h-20 ring-4 ring-charcoal-800"
            />
            <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-100">
                  {profile.firstName} {profile.lastName}
                  {profile.isVerified ? ' ✓' : ''}
                </h1>
                <p className="text-gray-400">@{profile.username}</p>
                <p className="text-gray-300 mt-2">{profile.bio || t('noBioYet')}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {profile.followerCount || 0} {t('followers')} · {profile.followingCount || 0} {t('following')}
                </p>
              </div>
              {!isSelf && (
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => followMutation.mutate()}>
                    {profile.isFollowing ? t('unfollow') : t('follow')}
                  </Button>
                  <Link to={`/messages/${profile.id}`}>
                    <Button variant="primary">{t('message')}</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {plans.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">{t('subscriptionPlans')}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {plans.map((plan) => (
                <div key={plan.id} className="p-4 rounded-xl bg-charcoal-800">
                  <p className="text-gray-100 font-medium">{plan.name}</p>
                  <p className="text-primary-400 text-lg font-bold mt-1">
                    {plan.price} {plan.currency || t('etb')}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
                  {!isSelf && (
                    <Button
                      className="mt-3"
                      variant="primary"
                      onClick={() => setPaywall({ open: true, plan })}
                    >
                      {t('subscribe')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold text-gray-100 mb-4">{t('posts')}</h2>
          {posts.length === 0 ? (
            <p className="text-gray-400">{t('noPublishedPosts')}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/content/${post.id}`}
                  className="rounded-xl overflow-hidden bg-charcoal-800 hover:bg-charcoal-700"
                >
                  {(post.thumbnailUrl || post.mediaUrl) && (
                    <img
                      src={post.thumbnailUrl || post.mediaUrl}
                      alt={post.title}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <p className="text-gray-100 font-medium truncate">{post.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{post.accessType}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-charcoal-900/95 border-t border-charcoal-700 md:hidden">
        {!isSelf && plans[0] && (
          <Button variant="primary" className="w-full" onClick={() => setPaywall({ open: true, plan: plans[0] })}>
            {t('subscribe')} — {plans[0].price} {t('etb')}/{t('month')}
          </Button>
        )}
      </div>

      <PaywallSheet
        isOpen={paywall.open}
        onClose={() => setPaywall({ open: false, plan: null })}
        mode="subscribe"
        plan={paywall.plan}
        creatorName={profile.username}
        onSuccess={() => queryClient.invalidateQueries(['profile', username])}
      />
    </div>
  )
}
