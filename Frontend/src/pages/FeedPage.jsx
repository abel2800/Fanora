import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { FeedSkeleton } from '../components/ui/Skeleton'
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  SparklesIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { contentAPI } from '../services/api'
import { StoryCarousel } from '../components/features/StoryCarousel'
import { normalizeFeedPost } from '../lib/content'
import { PaywallSheet } from '../components/features/PaywallSheet'
import { useI18n } from '../contexts/I18nContext'
import { getDataSaverEnabled } from '../lib/dataSaver'
import { useAuth } from '../contexts/AuthContext'

export function FeedPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const { user } = useAuth()
  const [mode, setMode] = useState('for-you')
  const [likedPosts, setLikedPosts] = useState({})
  const [paywall, setPaywall] = useState({ open: false, post: null })
  const dataSaver = getDataSaverEnabled()

  const { data, isLoading, error } = useQuery(
    ['feed', mode],
    () => contentAPI.getFeed({ limit: 20, page: 1, mode }),
    {
      select: (res) => (res.data?.data || []).map(normalizeFeedPost).filter(Boolean),
      staleTime: 60000,
      cacheTime: 300000,
    }
  )

  const posts = data || []

  const likeMutation = useMutation(
    (postId) => contentAPI.likeContent(postId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['feed', mode])
        toast.success(t('liked'))
      },
      onError: () => toast.error(t('failedToLike')),
    }
  )

  const unlikeMutation = useMutation(
    (postId) => contentAPI.unlikeContent(postId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['feed', mode])
      },
      onError: () => toast.error(t('failedToUnlike')),
    }
  )

  const handleLike = (postId) => {
    setLikedPosts((prev) => {
      const next = { ...prev }
      if (next[postId]) {
        unlikeMutation.mutate(postId)
        delete next[postId]
      } else {
        likeMutation.mutate(postId)
        next[postId] = true
      }
      return next
    })
  }

  if (isLoading) return <FeedSkeleton />

  if (error) {
    return (
      <div className="min-h-screen bg-charcoal-900">
        <div className="sticky top-0 z-10 bg-charcoal-800 border-b border-charcoal-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-100">{t('home')}</h1>
        </div>
        <div className="max-w-2xl mx-auto py-6 px-4">
          <Card className="p-12 text-center">
            <p className="text-red-400">{t('failedToLoadFeed')}</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-900">
      <div className="sticky top-0 z-10 bg-charcoal-800 border-b border-charcoal-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-100">{t('home')}</h1>
        <div className="mt-3 flex gap-2">
          {[
            { key: 'for-you', label: t('forYou') },
            { key: 'following', label: t('following') },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMode(tab.key)}
              className={`px-4 py-2 rounded-pill text-sm font-medium transition ${
                mode === tab.key
                  ? 'bg-primary-500 text-charcoal-900'
                  : 'bg-charcoal-700 text-gray-300 hover:bg-charcoal-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
        <StoryCarousel />
        {posts.length === 0 ? (
          <Card className="p-12 text-center">
            <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-100 mb-2">{t('noPosts')}</h3>
            <p className="text-gray-400 mb-6">
              {mode === 'following'
                ? t('followCreatorsForPosts')
                : t('discoverAndSubscribe')}
            </p>
            <Button variant="primary" onClick={() => navigate('/explore')}>
              {t('browseCreators')}
            </Button>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="p-4 border-b border-charcoal-700 flex items-center justify-between">
                <Link to={`/creator/${post.creatorUsername}`} className="flex items-center space-x-3">
                  <Avatar src={post.creatorAvatar} size="md" />
                  <div>
                    <p className="font-semibold text-gray-100">{post.creatorName}</p>
                    <p className="text-sm text-gray-400">@{post.creatorUsername}</p>
                  </div>
                </Link>
                <p className="text-xs text-gray-400">{post.timestamp}</p>
              </div>

              <div>
                {post.content && (
                  <p className="px-4 pt-4 text-gray-100">{post.content}</p>
                )}
                {post.image && (
                  <div className="relative mt-3">
                    {(post.type === 'paid' || post.type === 'subscription') && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-10">
                        <LockClosedIcon className="h-12 w-12 text-gray-100 mb-3" />
                        {post.type === 'paid' ? (
                          <>
                            <p className="text-gray-100 font-bold text-lg">
                              {t('unlock')} · {post.price} {t('etb')}
                            </p>
                            <Button variant="primary" className="mt-4" onClick={() => setPaywall({ open: true, post })}>
                              {t('unlockContent')}
                            </Button>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-100 font-bold text-lg">{t('subscribersOnly')}</p>
                            <Button
                              variant="primary"
                              className="mt-4"
                              onClick={() => post.creatorUsername && navigate(`/creator/${post.creatorUsername}`)}
                            >
                              {t('subscribeToView')}
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                    <img
                      src={post.image}
                      alt=""
                      loading={dataSaver ? 'lazy' : undefined}
                      className={`w-full h-auto object-cover ${dataSaver ? 'max-h-72' : ''}`}
                    />
                    {!post.isLocked && post.type !== 'free' && user && (
                      <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-4 overflow-hidden opacity-[0.14]">
                        {Array.from({ length: 12 }).map((_, index) => (
                          <span
                            key={index}
                            className="flex -rotate-[24deg] items-center justify-center whitespace-nowrap text-[10px] font-bold text-white"
                          >
                            @{user.username} · {String(user.id).slice(0, 8)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-charcoal-700 flex items-center justify-between text-gray-400">
                <button type="button" onClick={() => handleLike(post.id)} className="flex items-center space-x-2 hover:text-primary-500 transition">
                  {likedPosts[post.id] ? (
                    <HeartSolidIcon className="h-5 w-5 text-primary-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                  <span className="text-sm">{post.likesCount}</span>
                </button>
                <button type="button" onClick={() => navigate(`/content/${post.id}`)} className="flex items-center space-x-2 hover:text-primary-500 transition">
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  <span className="text-sm">{post.commentsCount}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/content/${post.id}`)
                    toast.success(t('linkCopied'))
                  }}
                  className="flex items-center space-x-2 hover:text-primary-500 transition"
                >
                  <ShareIcon className="h-5 w-5" />
                  <span className="text-sm">{t('share')}</span>
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <PaywallSheet
        isOpen={paywall.open}
        onClose={() => setPaywall({ open: false, post: null })}
        mode="purchase"
        content={paywall.post ? { id: paywall.post.id, price: paywall.post.price } : null}
        onSuccess={() => queryClient.invalidateQueries(['feed', mode])}
      />
    </div>
  )
}
