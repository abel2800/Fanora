import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar } from '../components/ui/Avatar'
import { creatorsAPI } from '../services/api'

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useQuery(
    ['creators', searchQuery],
    () => creatorsAPI.getCreators({ search: searchQuery || undefined, limit: 24 }),
    { select: (res) => res.data.creators || [] }
  )

  const creators = data || []

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Explore Creators</h1>
          <p className="text-gray-400">
            Discover amazing creators and their exclusive content on Fanora
          </p>
        </div>

        <div className="bg-charcoal-800 rounded-xl border border-charcoal-700 p-6 mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : creators.length === 0 ? (
          <EmptyState
            title="No creators found"
            description="Try a different search term"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creators.map((creator) => (
              <Link
                key={creator.id}
                to={`/creator/${creator.username}`}
                className="bg-charcoal-800 border border-charcoal-700 rounded-xl p-6 hover:border-primary-500/50 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <Avatar
                    src={creator.profileImage}
                    alt={creator.username}
                    size="xl"
                    className="mb-4"
                  />
                  <h3 className="font-semibold text-gray-100">
                    {creator.firstName} {creator.lastName}
                  </h3>
                  <p className="text-sm text-gray-400">@{creator.username}</p>
                  {creator.bio && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{creator.bio}</p>
                  )}
                  <Button variant="outline" size="sm" className="mt-4">
                    View Profile
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
