import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import { contentAPI, subscriptionsAPI, walletAPI, mediaSecurityAPI, wishlistAPI } from '../services/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { ContentViewSkeleton } from '../components/ui/Skeleton'
import {
  HeartIcon,
  SparklesIcon,
  CheckCircleIcon,
  ShareIcon,
  LockClosedIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { PaywallSheet } from '../components/features/PaywallSheet'
import { getDataSaverEnabled, mediaPropsForDataSaver } from '../lib/dataSaver'
import toast from 'react-hot-toast'

function TiledWatermark({ label, opacity = 0.14, rotation = -24 }) {
  const tiles = Array.from({ length: 24 })
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden select-none"
      aria-hidden="true"
    >
      <div
        className="absolute -inset-16 grid grid-cols-4 gap-8"
        style={{
          opacity,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {tiles.map((_, i) => (
          <span
            key={i}
            className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function ContentViewPage() {
  const { id: contentId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useI18n()

  const [content, setContent] = useState(null)
  const [creator, setCreator] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [showTipModal, setShowTipModal] = useState(false)
  const [tipAmount, setTipAmount] = useState('')
  const [subscriptionPlans, setSubscriptionPlans] = useState([])
  const [wallet, setWallet] = useState(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [paywallMode, setPaywallMode] = useState('purchase')
  const [watermark, setWatermark] = useState(null)
  const [mediaReady, setMediaReady] = useState(!getDataSaverEnabled())
  const [isSaved, setIsSaved] = useState(false)

  const isLocked = content && !content.hasAccess && content.accessType !== 'free'
  const dataSaver = getDataSaverEnabled()
  const mediaProps = mediaPropsForDataSaver({ autoPlay: false })

  useEffect(() => {
    if (!user || !contentId) return
    wishlistAPI.status(contentId)
      .then((response) => setIsSaved(Boolean(response.data?.saved)))
      .catch(() => {})
  }, [contentId, user])

  const reportSecurityEvent = useCallback(async (eventType) => {
    if (!contentId || !user || (content?.accessType !== 'free' && !content?.hasAccess)) return
    try {
      await mediaSecurityAPI.reportEvent({
        contentId,
        eventType,
        platform: 'web',
        metadata: { userAgent: navigator.userAgent },
      })
    } catch {
      /* non-blocking */
    }
  }, [content, contentId, user])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'PrintScreen') reportSecurityEvent('screenshot')
    }
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        // heuristic for screen capture / tab switch during media
      }
    }
    window.addEventListener('keyup', onKey)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('keyup', onKey)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [reportSecurityEvent])

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true)
        const res = await contentAPI.getContent(contentId)
        const data = res.data?.data
        setContent(data)
        setCreator(data?.creator)
        setLikeCount(data?.likesCount || 0)
        setMediaReady(!getDataSaverEnabled())

        try {
          const commentsRes = await contentAPI.getComments(contentId, { limit: 20 })
          setComments(commentsRes.data?.data || [])
        } catch {
          /* ignore */
        }

        if (data?.creator?.id && data.accessType !== 'free') {
          try {
            const plansRes = await subscriptionsAPI.getCreatorPlans(data.creator.id)
            setSubscriptionPlans(plansRes.data?.data || [])
          } catch {
            /* ignore */
          }
        }

        if (user) {
          try {
            const walletRes = await walletAPI.getWallet()
            setWallet(walletRes.data?.data)
          } catch {
            /* ignore */
          }
          try {
            const wm = await mediaSecurityAPI.getWatermark(contentId)
            setWatermark(wm.data?.data || null)
          } catch {
            setWatermark({
              label: `@${user.username} · ${String(user.id || '').slice(0, 8)}`,
              opacity: 0.14,
              rotation: -24,
              tile: true,
            })
          }
        }
      } catch {
        setError(t('failedToLoadContentPage'))
        toast.error(t('failedToLoadContentPage'))
      } finally {
        setIsLoading(false)
      }
    }

    if (contentId) fetchContent()
  }, [contentId, user])

  const handleLike = async () => {
    if (!user) return navigate('/auth/login')
    try {
      if (isLiked) {
        await contentAPI.unlikeContent(contentId)
        setIsLiked(false)
        setLikeCount((c) => Math.max(0, c - 1))
      } else {
        await contentAPI.likeContent(contentId)
        setIsLiked(true)
        setLikeCount((c) => c + 1)
      }
    } catch {
      toast.error(t('failedToUpdateLike'))
    }
  }

  const handleWishlist = async () => {
    if (!user) return navigate('/auth/login')
    try {
      if (isSaved) await wishlistAPI.remove(contentId)
      else await wishlistAPI.add(contentId)
      setIsSaved((saved) => !saved)
      toast.success(isSaved ? t('removedFromWishlist') : t('addedToWishlist'))
    } catch {
      toast.error(t('actionFailed'))
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!user) return navigate('/auth/login')
    if (!commentText.trim()) return toast.error(t('commentEmpty'))

    try {
      setIsSubmittingComment(true)
      const res = await contentAPI.addComment(contentId, { text: commentText })
      setComments([res.data?.data, ...comments])
      setCommentText('')
      toast.success(t('commentAdded'))
    } catch {
      toast.error(t('failedToAddComment'))
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleSubscribe = async (planId) => {
    if (!user) return navigate('/auth/login')
    const plan = subscriptionPlans.find((p) => p.id === planId)
    if (!wallet || wallet.balance < plan.price) {
      toast.error(t('insufficientBalanceTopUp'))
      return navigate('/wallet')
    }
    try {
      await subscriptionsAPI.subscribe(planId, {})
      setShowSubscribeModal(false)
      toast.success(t('subscriptionSuccessful'))
    } catch (error) {
      toast.error(error.response?.data?.message || t('subscriptionFailed'))
    }
  }

  const handleSendTip = async () => {
    if (!user) return navigate('/auth/login')
    const amount = tipAmount || 100
    if (!wallet || wallet.balance < amount) {
      toast.error(t('insufficientBalance'))
      return
    }
    try {
      toast.success(t('tipSent').replace('{amount}', amount))
      setShowTipModal(false)
      setTipAmount('')
    } catch {
      toast.error(t('failedToSendTip'))
    }
  }

  if (isLoading) return <ContentViewSkeleton />

  if (error || !content) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <p className="text-gray-400 mb-4">{error || t('contentNotFound')}</p>
          <Button onClick={() => navigate('/home')} variant="primary">
            {t('home')}
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div className="bg-charcoal-900 aspect-video flex items-center justify-center relative">
                {isLocked && (
                  <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center">
                    <LockClosedIcon className="h-12 w-12 text-gray-100 mb-3" />
                    <p className="text-gray-100 font-bold mb-4">
                      {content.accessType === 'pay_per_view'
                        ? `${t('unlock')} · ${content.price} ${t('etb')}`
                        : t('subscribersOnly')}
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setPaywallMode(content.accessType === 'pay_per_view' ? 'purchase' : 'subscribe')
                        setShowPaywall(true)
                      }}
                    >
                      {content.accessType === 'pay_per_view' ? t('unlock') : t('subscribe')}
                    </Button>
                  </div>
                )}

                {!isLocked && !mediaReady && dataSaver ? (
                  <button
                    type="button"
                    className="absolute inset-0 z-[4] flex flex-col items-center justify-center bg-charcoal-800"
                    onClick={() => setMediaReady(true)}
                  >
                    {content.thumbnailUrl && (
                      <img
                        src={content.thumbnailUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                      />
                    )}
                    <span className="relative z-[1] px-4 py-2 rounded-pill bg-primary-500 text-charcoal-900 font-semibold text-sm">
                      {t('tapToLoad')} · {t('lowData')}
                    </span>
                  </button>
                ) : null}

                {!isLocked && mediaReady && content.type === 'video' ? (
                  <video
                    src={content.mediaUrl}
                    controls
                    className="w-full h-full"
                    poster={content.thumbnailUrl}
                    preload={mediaProps.preload}
                    autoPlay={mediaProps.autoPlay}
                  />
                ) : !isLocked && mediaReady ? (
                  <img
                    src={content.mediaUrl || content.thumbnailUrl}
                    alt={content.title}
                    loading={mediaProps.loading}
                    className="w-full h-full object-cover"
                  />
                ) : isLocked ? (
                  <img
                    src={content.thumbnailUrl || content.mediaUrl}
                    alt=""
                    className="w-full h-full object-cover blur-xl scale-110"
                  />
                ) : null}

                {!isLocked && watermark?.tile && watermark?.label && (
                  <TiledWatermark
                    label={watermark.label}
                    opacity={watermark.opacity}
                    rotation={watermark.rotation}
                  />
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-100 mb-2">{content.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{content.viewsCount || 0} {t('views')}</span>
                      <span>{new Date(content.publishedAt || content.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant={content.accessType === 'free' ? 'secondary' : 'primary'}>
                    {content.accessType === 'premium' || content.accessType === 'subscribers'
                      ? t('subscribersOnly')
                      : content.accessType === 'free'
                        ? t('free')
                        : content.accessType}
                  </Badge>
                </div>

                {content.description && (
                  <p className="text-gray-300 mb-4 line-clamp-3">{content.description}</p>
                )}

                {creator && (
                  <div className="border-t border-charcoal-700 pt-4">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="flex items-center gap-3 hover:opacity-80"
                        onClick={() => navigate(`/creator/${creator.username}`)}
                      >
                        <Avatar src={creator.profileImage} size="lg" />
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-100">{creator.username}</span>
                            {creator.isVerified && (
                              <CheckCircleIcon className="w-4 h-4 text-primary-500" />
                            )}
                          </div>
                          <span className="text-sm text-gray-400">{t('creator')}</span>
                        </div>
                      </button>
                      <Button variant="primary" size="sm" onClick={() => setShowSubscribeModal(true)}>
                        {t('subscribe')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {content.allowComments !== false && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-100 mb-4">
                  {t('comments')} ({comments.length})
                </h2>
                {user ? (
                  <form onSubmit={handleAddComment} className="mb-6">
                    <Input
                      placeholder={t('addComment')}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="mb-3"
                    />
                    <Button type="submit" variant="primary" size="sm" disabled={isSubmittingComment}>
                      {isSubmittingComment ? t('loading') : t('postComment')}
                    </Button>
                  </form>
                ) : (
                  <Button onClick={() => navigate('/auth/login')} variant="outline" className="w-full mb-6">
                    {t('login')}
                  </Button>
                )}
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-charcoal-800 rounded-lg p-4 border border-charcoal-700">
                        <div className="flex gap-3">
                          <Avatar src={comment.author?.profileImage} size="sm" />
                          <div className="flex-1">
                            <span className="font-semibold text-gray-100">{comment.author?.username}</span>
                            <p className="text-gray-300 mt-1 text-sm">{comment.text || comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">{t('noResults')}</p>
                  )}
                </div>
              </Card>
            )}
          </div>

          <div>
            <Card className="p-4 space-y-3 sticky top-20">
              <button
                type="button"
                onClick={handleLike}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-charcoal-800 border border-charcoal-700 hover:border-primary-500/40 transition"
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-5 h-5 text-primary-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-gray-100">{likeCount}</span>
              </button>

              <Button onClick={handleWishlist} variant="outline" className="w-full">
                <BookmarkIcon className={`w-4 h-4 ${isSaved ? 'fill-primary-500 text-primary-500' : ''}`} />
                {isSaved ? t('saved') : t('saveToWishlist')}
              </Button>

              {content.allowTips !== false && (
                <Button onClick={() => setShowTipModal(true)} variant="primary" className="w-full">
                  <SparklesIcon className="w-4 h-4" />
                  {t('tips')}
                </Button>
              )}

              <Button onClick={() => setShowSubscribeModal(true)} variant="primary" className="w-full py-3">
                {t('subscribeToView')}
              </Button>

              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success(t('linkCopied'))
                }}
                variant="outline"
                className="w-full"
              >
                <ShareIcon className="w-4 h-4" />
                {t('share')}
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <Modal isOpen={showSubscribeModal} onClose={() => setShowSubscribeModal(false)} title={t('subscribe')}>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {subscriptionPlans.length > 0 ? (
            subscriptionPlans.map((plan) => (
              <div key={plan.id} className="border border-charcoal-700 rounded-lg p-4 bg-charcoal-800">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-gray-100">{plan.name}</h3>
                  <Badge variant="primary">{plan.price} {t('etb')}</Badge>
                </div>
                {plan.description && <p className="text-sm text-gray-400 mb-3">{plan.description}</p>}
                <Button onClick={() => handleSubscribe(plan.id)} variant="primary" className="w-full mt-3" size="sm">
                  {t('subscribe')}
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">{t('noResults')}</p>
          )}
        </div>
      </Modal>

      <Modal isOpen={showTipModal} onClose={() => setShowTipModal(false)} title={t('tips')}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[50, 100, 500, 1000].map((amount) => (
              <Button
                key={amount}
                onClick={() => setTipAmount(amount.toString())}
                variant={tipAmount === amount.toString() ? 'primary' : 'outline'}
                className="py-3"
              >
                {amount} {t('etb')}
              </Button>
            ))}
          </div>
          <Input
            type="number"
            placeholder={`Custom (${t('etb')})`}
            value={tipAmount}
            onChange={(e) => setTipAmount(e.target.value)}
            min="1"
          />
          <div className="flex gap-3 pt-4 border-t border-charcoal-700">
            <Button onClick={() => { setShowTipModal(false); setTipAmount('') }} variant="secondary" className="flex-1">
              {t('cancel')}
            </Button>
            <Button onClick={handleSendTip} variant="primary" className="flex-1" disabled={!tipAmount || parseInt(tipAmount, 10) <= 0}>
              {t('send')}
            </Button>
          </div>
        </div>
      </Modal>

      <PaywallSheet
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        mode={paywallMode}
        content={content}
        plan={subscriptionPlans[0]}
        creatorName={creator?.username}
        onSuccess={() => window.location.reload()}
      />
    </div>
  )
}
