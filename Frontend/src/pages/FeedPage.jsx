import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  SparklesIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { contentAPI } from '../services/api'
import { StoryCarousel } from '../components/features/StoryCarousel'

export function FeedPage() {
  const queryClient = useQueryClient()
  const [likedPosts, setLikedPosts] = useState({})

  // Fetch feed
  const { data, isLoading, error } = useQuery(
    ['feed'],
    () => contentAPI.getFeed({ limit: 20, offset: 0 }),
    {
      select: (res) => res.data || [],
      staleTime: 60000,
      cacheTime: 300000,
    }
  )

  const posts = data || []

  // Like mutation
  const likeMutation = useMutation(
    (postId) => contentAPI.likeContent(postId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('feed')
        toast.success('❤️ Liked!')
      },
      onError: () => {
        toast.error('Failed to like post')
      }
    }
  )

  // Unlike mutation
  const unlikeMutation = useMutation(
    (postId) => contentAPI.unlikeContent(postId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('feed')
        toast.success('❤️ Like removed')
      },
      onError: () => {
        toast.error('Failed to unlike post')
      }
    }
  )

  const handleLike = (postId) => {
    setLikedPosts(prev => {
      const newLiked = { ...prev }
      if (newLiked[postId]) {
        unlikeMutation.mutate(postId)
        delete newLiked[postId]
      } else {
        likeMutation.mutate(postId)
        newLiked[postId] = true
      }
      return newLiked
    })
  }

  const handleComment = (postId) => {
    toast.success('Opening comments...')
  }

  const handleShare = (postId) => {
    navigator.clipboard.writeText(`${window.location.origin}/content/${postId}`)
    toast.success('Link copied to clipboard!')
  }

  const handleUnlock = (postId, price) => {
    toast.success(`Unlocked for ${price} ETB!`)
  }

  const handleSubscribe = (creatorName) => {
    toast.success(`Subscribed to ${creatorName}!`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-charcoal-900">
        <div className="sticky top-0 z-10 bg-charcoal-800 border-b border-charcoal-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-100">Home</h1>
        </div>
        <div className="max-w-2xl mx-auto py-6 px-4">
          <Card className="p-12 text-center">
            <p className="text-red-400">Failed to load feed. Please try again.</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-charcoal-800 border-b border-charcoal-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-100">Home</h1>
        <p className="text-gray-400 text-sm">Posts from creators you follow</p>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
        <StoryCarousel />
        {posts.length === 0 ? (
          <Card className="p-12 text-center">
            <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-100 mb-2">
              No posts to show
            </h3>
            <p className="text-gray-400 mb-6">
              Subscribe to creators to see their posts in your feed
            </p>
            <Button variant="primary">
              Browse Creators
            </Button>
          </Card>
        ) : (
          posts.map(post => (
            <Card key={post.id} className="overflow-hidden">
              {/* Creator Info */}
              <div className="p-4 border-b border-charcoal-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar src={post.creatorAvatar} size="md" />
                  <div>
                    <p className="font-semibold text-gray-100">
                      {post.creatorName}
                    </p>
                    <p className="text-sm text-gray-400">
                      @{post.creatorUsername}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{post.timestamp}</p>
              </div>

              {/* Content */}
              <div>
                {/* Text */}
                {post.content && (
                  <p className="px-4 pt-4 text-gray-100">{post.content}</p>
                )}

                {/* Image/Media */}
                {post.image && (
                  <div className="relative mt-3">
                    {(post.type === 'paid' || post.type === 'subscription') && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-10 cursor-pointer hover:bg-black/70 transition">
                        <LockClosedIcon className="h-12 w-12 text-gray-100 mb-3" />
                        {post.type === 'paid' && (
                          <>
                            <p className="text-gray-100 font-bold text-lg">
                              Unlock for {post.price} ETB
                            </p>
                            <Button
                              variant="primary"
                              className="mt-4"
                              onClick={() => handleUnlock(post.id, post.price)}
                            >
                              Unlock Content
                            </Button>
                          </>
                        )}
                        {post.type === 'subscription' && (
                          <>
                            <p className="text-gray-100 font-bold text-lg">
                              Subscribers Only
                            </p>
                            <Button
                              variant="primary"
                              className="mt-4"
                              onClick={() => handleSubscribe(post.creatorName)}
                            >
                              Subscribe to View
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 py-3 border-t border-charcoal-700 flex items-center justify-between text-gray-400">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center space-x-2 hover:text-primary-500 transition group"
                >
                  {likedPosts[post.id] ? (
                    <HeartSolidIcon className="h-5 w-5 text-primary-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5 group-hover:text-primary-500" />
                  )}
                  <span className="text-sm">{post.likesCount}</span>
                </button>

                <button
                  onClick={() => handleComment(post.id)}
                  className="flex items-center space-x-2 hover:text-primary-500 transition"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  <span className="text-sm">{post.commentsCount}</span>
                </button>

                <button
                  onClick={() => handleShare(post.id)}
                  className="flex items-center space-x-2 hover:text-primary-500 transition"
                >
                  <ShareIcon className="h-5 w-5" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
