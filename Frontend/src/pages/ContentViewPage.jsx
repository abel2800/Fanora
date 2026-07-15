import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { contentAPI, subscriptionsAPI, walletAPI } from '../services/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'
import {
  HeartIcon as HeartSolidIcon,
  SparklesIcon,
  CheckCircleIcon,
  EyeIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import { HeartIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export function ContentViewPage() {
  const { contentId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [content, setContent] = useState(null)
  const [creator, setCreator] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')

  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showTipModal, setShowTipModal] = useState(false)
  const [tipAmount, setTipAmount] = useState('')

  const [subscriptionPlans, setSubscriptionPlans] = useState([])
  const [wallet, setWallet] = useState(null)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true)
        const res = await contentAPI.getContent(contentId)
        const data = res.data?.data

        setContent(data)
        setCreator(data?.creator)
        setLikeCount(data?.likesCount || 0)

        // Fetch comments
        try {
          const commentsRes = await contentAPI.getComments(contentId, { limit: 20 })
          setComments(commentsRes.data?.data || [])
        } catch (e) {
          console.warn('Failed to fetch comments')
        }

        // Fetch plans
        if (data?.creator?.id && data.accessType !== 'free') {
          try {
            const plansRes = await subscriptionsAPI.getCreatorPlans(data.creator.id)
            setSubscriptionPlans(plansRes.data?.data || [])
          } catch (e) {
            console.warn('Failed to fetch plans')
          }
        }

        // Fetch wallet if logged in
        if (user) {
          try {
            const walletRes = await walletAPI.getWallet()
            setWallet(walletRes.data?.data)
          } catch (e) {
            console.warn('Failed to fetch wallet')
          }
        }
      } catch (err) {
        setError('Failed to load content')
        toast.error('Failed to load content')
      } finally {
        setIsLoading(false)
      }
    }

    if (contentId) {
      fetchContent()
    }
  }, [contentId, user])

  const handleLike = async () => {
    if (!user) return navigate('/auth/login')
    try {
      if (isLiked) {
        await contentAPI.unlikeContent(contentId)
        setIsLiked(false)
        setLikeCount(Math.max(0, likeCount - 1))
      } else {
        await contentAPI.likeContent(contentId)
        setIsLiked(true)
        setLikeCount(likeCount + 1)
      }
    } catch (error) {
      toast.error('Failed to update like')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!user) return navigate('/auth/login')
    if (!commentText.trim()) return toast.error('Comment cannot be empty')

    try {
      setIsSubmittingComment(true)
      const res = await contentAPI.addComment(contentId, { text: commentText })
      setComments([res.data?.data, ...comments])
      setCommentText('')
      toast.success('Comment added!')
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleSubscribe = async (planId) => {
    if (!user) return navigate('/auth/login')
    const plan = subscriptionPlans.find(p => p.id === planId)
    if (!wallet || wallet.balance < plan.price) {
      toast.error('Insufficient balance. Please top up wallet first.')
      return navigate('/dashboard/wallet')
    }

    try {
      await subscriptionsAPI.subscribe(planId, {})
      setShowSubscribeModal(false)
      toast.success('Subscription successful!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe')
    }
  }

  const handlePayment = async () => {
    if (!user) return navigate('/auth/login')
    if (!wallet || wallet.balance < content.price) {
      toast.error('Insufficient balance')
      return
    }

    try {
      toast.success('Payment successful!')
      setShowPaymentModal(false)
    } catch (error) {
      toast.error('Payment failed')
    }
  }

  const handleSendTip = async () => {
    if (!user) return navigate('/auth/login')
    const amount = tipAmount || 100
    if (!wallet || wallet.balance < amount) {
      toast.error('Insufficient balance')
      return
    }

    try {
      toast.success(`Sent ${amount} ETB tip! 🎉`)
      setShowTipModal(false)
      setTipAmount('')
    } catch (error) {
      toast.error('Failed to send tip')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <p className="text-gray-400 mb-4">{error || 'Content not found'}</p>
          <Button onClick={() => navigate('/')} variant="primary">
            Go Back Home
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              {/* Video/Image Player */}
              <div className="bg-black aspect-video flex items-center justify-center relative">
                {content.type === 'video' ? (
                  <video
                    src={content.mediaUrl}
                    controls
                    className="w-full h-full"
                    poster={content.thumbnailUrl}
                  />
                ) : (
                  <img
                    src={content.mediaUrl || content.thumbnailUrl}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Content Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-100 mb-2">{content.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{content.viewsCount || 0} views</span>
                      <span>{new Date(content.publishedAt || content.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant={content.accessType === 'free' ? 'secondary' : 'primary'}>
                    {content.accessType === 'premium' ? 'Subscribers' : 'Free'}
                  </Badge>
                </div>

                {content.description && (
                  <p className="text-gray-300 mb-4 line-clamp-3">{content.description}</p>
                )}

                {creator && (
                  <div className="border-t border-charcoal-700 pt-4">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                        onClick={() => navigate(`/creator/${creator.username}`)}
                      >
                        <Avatar src={creator.profileImage} size="lg" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-100">{creator.username}</span>
                            {creator.isVerified && (
                              <CheckCircleIcon className="w-4 h-4 text-primary-500" />
                            )}
                          </div>
                          <span className="text-sm text-gray-400">Creator</span>
                        </div>
                      </div>
                      <Button variant="primary" size="sm">
                        Subscribe
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Comments Section */}
            {content.allowComments && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-100 mb-4">
                  Comments ({comments.length})
                </h2>

                {user ? (
                  <form onSubmit={handleAddComment} className="mb-6">
                    <Input
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="mb-3"
                    />
                    <Button type="submit" variant="primary" size="sm" disabled={isSubmittingComment}>
                      {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </form>
                ) : (
                  <Button onClick={() => navigate('/auth/login')} variant="outline" className="w-full mb-6">
                    Login to comment
                  </Button>
                )}

                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment.id} className="bg-charcoal-700 rounded-lg p-4">
                        <div className="flex gap-3">
                          <Avatar src={comment.author?.profileImage} size="sm" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-100 cursor-pointer hover:text-primary-500">
                                {comment.author?.username}
                              </span>
                              {comment.author?.isVerified && (
                                <CheckCircleIcon className="w-3 h-3 text-primary-500" />
                              )}
                            </div>
                            <p className="text-gray-300 mt-1 text-sm">{comment.text}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No comments yet. Be first!</p>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Engagement Sidebar */}
          <div>
            <Card className="p-4 space-y-3 sticky top-20">
              {/* Like Button */}
              <button
                onClick={handleLike}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-charcoal-700 hover:bg-charcoal-600 transition"
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-gray-100">{likeCount} Likes</span>
              </button>

              {/* Tip Button */}
              {content.allowTips && (
                <Button onClick={() => setShowTipModal(true)} variant="primary" className="w-full">
                  <SparklesIcon className="w-4 h-4" />
                  Send Tip
                </Button>
              )}

              {/* Subscribe Button */}
              <Button
                onClick={() => setShowSubscribeModal(true)}
                variant="primary"
                className="w-full py-3"
              >
                Subscribe to View
              </Button>

              {/* Share Button */}
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Link copied!')
                }}
                variant="outline"
                className="w-full"
              >
                <ShareIcon className="w-4 h-4" />
                Share
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showSubscribeModal} onClose={() => setShowSubscribeModal(false)} title="Subscribe">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {subscriptionPlans.length > 0 ? (
            subscriptionPlans.map(plan => (
              <div key={plan.id} className="border border-charcoal-700 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-gray-100">{plan.name}</h3>
                  <Badge variant="primary">{plan.price} ETB</Badge>
                </div>
                {plan.description && <p className="text-sm text-gray-400 mb-3">{plan.description}</p>}
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  variant="primary"
                  className="w-full mt-3"
                  size="sm"
                >
                  Subscribe
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No subscription plans available</p>
          )}
        </div>
      </Modal>

      <Modal isOpen={showTipModal} onClose={() => setShowTipModal(false)} title="Send Tip">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[50, 100, 500, 1000].map(amount => (
              <Button
                key={amount}
                onClick={() => setTipAmount(amount.toString())}
                variant={tipAmount === amount.toString() ? 'primary' : 'outline'}
                className="py-3"
              >
                {amount} ETB
              </Button>
            ))}
          </div>
          <Input
            type="number"
            placeholder="Custom amount (ETB)"
            value={tipAmount}
            onChange={(e) => setTipAmount(e.target.value)}
            min="1"
          />
          <div className="flex gap-3 pt-4 border-t border-charcoal-700">
            <Button onClick={() => { setShowTipModal(false); setTipAmount('') }} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSendTip} variant="primary" className="flex-1" disabled={!tipAmount || parseInt(tipAmount) <= 0}>
              Send Tip
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
