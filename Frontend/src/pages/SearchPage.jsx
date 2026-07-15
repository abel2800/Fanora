import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { contentAPI } from '../services/api'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { MagnifyingGlassIcon, FireIcon, PlayCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeTab, setActiveTab] = useState('all')
  const [results, setResults] = useState({ content: [], creators: [] })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (query.length >= 2) {
      setIsLoading(true)
      // Mock search - Would be replaced with API call
      setTimeout(() => {
        setResults({
          content: [
            { id: 1, title: 'Summer Vibes', creator: { firstName: 'John', lastName: 'Doe', username: 'johndoe' }, thumbnailUrl: 'https://via.placeholder.com/300x200', views: 1200, likes: 345 },
            { id: 2, title: 'Dancing Tutorial', creator: { firstName: 'Jane', lastName: 'Smith', username: 'janesmith' }, thumbnailUrl: 'https://via.placeholder.com/300x200', views: 2500, likes: 890 },
            { id: 3, title: 'Fitness Tips', creator: { firstName: 'Mike', lastName: 'Johnson', username: 'mikej' }, thumbnailUrl: 'https://via.placeholder.com/300x200', views: 3100, likes: 1200 }
          ],
          creators: [
            { id: 1, username: 'johndoe', firstName: 'John', lastName: 'Doe', profileImage: 'https://via.placeholder.com/100', followers: 15000, isVerified: true },
            { id: 2, username: 'janesmith', firstName: 'Jane', lastName: 'Smith', profileImage: 'https://via.placeholder.com/100', followers: 8500, isVerified: false }
          ]
        })
        setIsLoading(false)
      }, 500)
    }
  }, [query])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ q: query })
  }

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Input
                placeholder="Search content and creators..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

          {query && (
            <div className="flex space-x-2 border-b border-charcoal-700 pb-4">
              {['all', 'content', 'creators'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {!query && (
          <div className="text-center py-16">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-300 text-lg font-medium">Search for content or creators</p>
            <p className="text-gray-500 text-sm mt-2">Type at least 2 characters to search</p>
          </div>
        )}

        {query && isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {query && !isLoading && (
          <>
            {/* Content Results */}
            {(activeTab === 'all' || activeTab === 'content') && (
              <div className="mb-12">
                <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
                  <PlayCircleIcon className="w-5 h-5 mr-2 text-primary-500" />
                  Content ({results.content.length})
                </h2>
                {results.content.length > 0 ? (
                  <div className="space-y-4">
                    {results.content.map(item => (
                      <Link key={item.id} to={`/content/${item.id}`} className="group block">
                        <div className="bg-charcoal-800 rounded-xl overflow-hidden hover:bg-charcoal-750 transition-colors border border-charcoal-700 hover:border-primary-500 flex">
                          {/* Thumbnail */}
                          <div className="w-40 h-24 bg-charcoal-700 flex-shrink-0 overflow-hidden">
                            {item.thumbnailUrl ? (
                              <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <PlayCircleIcon className="w-8 h-8 text-primary-500 opacity-50" />
                              </div>
                            )}
                          </div>

                          {/* Content Info */}
                          <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-100 line-clamp-1">{item.title}</h3>
                              <p className="text-sm text-gray-400 mt-1">
                                {item.creator?.firstName} {item.creator?.lastName}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{item.views?.toLocaleString() || 0} views</span>
                              <span>{item.likes?.toLocaleString() || 0} likes</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">No content found</div>
                )}
              </div>
            )}

            {/* Creators Results */}
            {(activeTab === 'all' || activeTab === 'creators') && (
              <div>
                <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
                  <FireIcon className="w-5 h-5 mr-2 text-primary-500" />
                  Creators ({results.creators.length})
                </h2>
                {results.creators.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.creators.map(creator => (
                      <Link key={creator.id} to={`/@${creator.username}`} className="group block">
                        <div className="bg-charcoal-800 rounded-xl p-6 border border-charcoal-700 hover:border-primary-500 transition-colors text-center">
                          <Avatar
                            src={creator.profileImage}
                            alt={creator.firstName}
                            className="h-16 w-16 mx-auto mb-4"
                          />
                          <h3 className="font-semibold text-gray-100">
                            {creator.firstName} {creator.lastName}
                          </h3>
                          <p className="text-sm text-gray-400 mb-3">@{creator.username}</p>
                          {creator.isVerified && (
                            <div className="inline-block px-2 py-1 bg-primary-500 bg-opacity-20 text-primary-400 text-xs rounded-full mb-3">
                              Verified
                            </div>
                          )}
                          <p className="text-sm text-gray-500 mb-4">{creator.followers?.toLocaleString() || 0} Followers</p>
                          <Button variant="primary" size="sm" className="w-full">
                            Follow
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">No creators found</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
