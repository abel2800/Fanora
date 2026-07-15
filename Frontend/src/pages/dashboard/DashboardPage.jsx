import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { contentAPI } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Avatar } from '../../components/ui/Avatar'
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  PlayCircleIcon,
  PaperAirplaneIcon,
  EllipsisHorizontalIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

export function DashboardPage() {
  const { user } = useAuth()
  const [likedContent, setLikedContent] = useState(new Set())

  // Fetch content feed
  const { data: feedData, isLoading } = useQuery({
    queryKey: ['content-feed'],
    queryFn: async () => {
      try {
        const response = await contentAPI.getFeed()
        return response.data || []
      } catch (err) {
        return []
      }
    }
  })

  const handleLike = (contentId, e) => {
    e.preventDefault()
    const newLiked = new Set(likedContent)
    if (newLiked.has(contentId)) {
      newLiked.delete(contentId)
    } else {
      newLiked.add(contentId)
    }
    setLikedContent(newLiked)
  }

  const content = feedData || []

  return (
    <div className="bg-charcoal-900 min-h-screen pb-20">
      {/* Stories Strip at Top */}
      <div className="sticky top-0 bg-charcoal-800 border-b border-charcoal-700 px-4 py-3 z-30">
        <div className="flex items-center space-x-3 overflow-x-auto hide-scrollbar max-w-7xl mx-auto">
          {/* Stories - placeholder */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 p-0.5">
                <div className="h-full w-full rounded-full bg-charcoal-800 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Feed */}
      <div className="max-w-2xl mx-auto">
        {isLoading && content.length === 0 ? (
          // Loading skeleton
          <div className="space-y-6 px-4 pt-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-charcoal-800 rounded-xl p-4 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-charcoal-700 rounded-full"></div>
                  <div className="flex-1 h-4 bg-charcoal-700 rounded w-1/3"></div>
                </div>
                <div className="aspect-video bg-charcoal-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-charcoal-700 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-charcoal-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : content.length > 0 ? (
          <div className="space-y-6 px-4 pt-6">
            {content.map((item) => (
              <Link key={item.id} to={`/content/${item.id}`} className="group block">
                <div className="bg-charcoal-800 rounded-xl overflow-hidden hover:bg-charcoal-750 transition-colors">
                  {/* Creator Header */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-charcoal-700">
                    <div className="flex items-center space-x-3 flex-1">
                      <Avatar
                        src={item.creator?.profileImage}
                        alt={item.creator?.firstName}
                        className="h-10 w-10"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-100">
                          {item.creator?.firstName} {item.creator?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">
                          @{item.creator?.username}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-charcoal-700 rounded-lg transition-colors">
                      <EllipsisHorizontalIcon className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Content Thumbnail */}
                  <div className="relative aspect-video bg-charcoal-700 overflow-hidden group">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-charcoal-700 to-charcoal-600">
                        <PlayCircleIcon className="h-16 w-16 text-primary-500 opacity-50" />
                      </div>
                    )}
                  </div>

                  {/* Content Info & Actions */}
                  <div className="px-4 py-3 border-t border-charcoal-700">
                    {/* Title & Description */}
                    <h3 className="font-semibold text-gray-100 mb-1 line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div
                      className="flex items-center justify-between"
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={(e) => handleLike(item.id, e)}
                          className="flex items-center space-x-2 text-gray-400 hover:text-primary-400 transition-colors group"
                        >
                          {likedContent.has(item.id) ? (
                            <HeartSolidIcon className="h-5 w-5 text-primary-500" />
                          ) : (
                            <HeartIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          )}
                          <span className="text-sm">{item.likes || 0}</span>
                        </button>

                        <button className="flex items-center space-x-2 text-gray-400 hover:text-primary-400 transition-colors">
                          <ChatBubbleLeftIcon className="h-5 w-5" />
                          <span className="text-sm">{item.comments || 0}</span>
                        </button>

                        <button className="flex items-center space-x-2 text-gray-400 hover:text-primary-400 transition-colors">
                          <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        className="h-8 px-3 text-xs rounded-lg"
                      >
                        Subscribe
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <SparklesIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-100 mb-2">
              No content yet
            </h3>
            <p className="text-gray-400 mb-6">
              Subscribe to creators to see their exclusive content
            </p>
            <Link to="/explore">
              <Button variant="primary">
                Explore Creators
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
