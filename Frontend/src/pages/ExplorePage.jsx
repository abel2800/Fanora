import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Avatar } from '../components/ui/Avatar'
import { GridSkeleton, Skeleton } from '../components/ui/Skeleton'
import { creatorsAPI, contentAPI } from '../services/api'
import { useI18n } from '../contexts/I18nContext'
import { getDataSaverEnabled } from '../lib/dataSaver'

const FILTERS = [
  { key: 'all', labelKey: 'all' },
  { key: 'photo', labelKey: 'photos' },
  { key: 'video', labelKey: 'videos' },
  { key: 'live', labelKey: 'live' },
]

export function ExplorePage() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const dataSaver = getDataSaverEnabled()

  const { data: creators = [], isLoading: creatorsLoading } = useQuery(
    ['creators', searchQuery],
    () => creatorsAPI.getCreators({ search: searchQuery || undefined, limit: 24 }),
    { select: (res) => res.data?.creators || res.data?.data || [] }
  )

  const { data: trending = [], isLoading: trendingLoading } = useQuery(
    ['explore-trending', filter],
    () => contentAPI.getTrending({ limit: 30, type: filter === 'all' || filter === 'live' ? undefined : filter }),
    { select: (res) => res.data?.data || [] }
  )

  const rising = useMemo(() => creators.slice(0, 8), [creators])

  const masonryItems = useMemo(() => {
    if (filter === 'live') return []
    return trending
  }, [trending, filter])

  const isLoading = creatorsLoading || trendingLoading

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-100 mb-2">{t('explore')}</h1>
          <p className="text-gray-400">{t('discoverCreatorsContent')}</p>
        </div>

        <div className="bg-charcoal-800 rounded-card border border-charcoal-700 p-4 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder={`${t('search')}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition ${
                filter === f.key
                  ? 'bg-primary-500 text-charcoal-900'
                  : 'bg-charcoal-800 text-gray-300 border border-charcoal-600 hover:border-primary-500/40'
              }`}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>

        {/* Rising Creators rail */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">{t('risingCreators')}</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {creatorsLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-28 space-y-2">
                    <Skeleton className="h-20 w-20 mx-auto rounded-full" />
                    <Skeleton className="h-3 w-20 mx-auto" />
                  </div>
                ))
              : rising.map((creator) => (
                  <Link
                    key={creator.id}
                    to={`/creator/${creator.username}`}
                    className="flex-shrink-0 w-28 text-center group"
                  >
                    <Avatar
                      src={creator.profileImage}
                      alt={creator.username}
                      size="xl"
                      className="mx-auto ring-2 ring-transparent group-hover:ring-primary-500 transition"
                    />
                    <p className="mt-2 text-sm font-medium text-gray-100 truncate">@{creator.username}</p>
                  </Link>
                ))}
          </div>
        </section>

        {filter === 'live' ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">{t('catchCreatorsLive')}</p>
            <Link to="/live">
              <Button variant="primary">{t('live')}</Button>
            </Link>
          </div>
        ) : isLoading ? (
          <GridSkeleton />
        ) : masonryItems.length === 0 && creators.length === 0 ? (
          <EmptyState title={t('noResults')} description={t('tryDifferentSearch')} />
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {masonryItems.map((item, idx) => (
              <Link
                key={item.id}
                to={`/content/${item.id}`}
                className="break-inside-avoid mb-4 block rounded-card overflow-hidden border border-charcoal-700 bg-charcoal-800 hover:border-primary-500/40 transition group"
              >
                <div
                  className="relative bg-charcoal-700"
                  style={{ minHeight: `${140 + (idx % 4) * 36}px` }}
                >
                  {(item.thumbnailUrl || item.mediaUrl) && (
                    <img
                      src={item.thumbnailUrl || item.mediaUrl}
                      alt={item.title || ''}
                      loading={dataSaver ? 'lazy' : undefined}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-300"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal-900/90 to-transparent p-3">
                    <p className="text-sm text-gray-100 font-medium line-clamp-2">{item.title}</p>
                    {item.creator?.username && (
                      <p className="text-xs text-gray-400 mt-0.5">@{item.creator.username}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {masonryItems.length === 0 &&
              creators.map((creator) => (
                <Link
                  key={creator.id}
                  to={`/creator/${creator.username}`}
                  className="break-inside-avoid mb-4 block rounded-card border border-charcoal-700 bg-charcoal-800 p-5 hover:border-primary-500/40 transition"
                >
                  <div className="flex flex-col items-center text-center">
                    <Avatar src={creator.profileImage} alt={creator.username} size="xl" className="mb-3" />
                    <h3 className="font-semibold text-gray-100">
                      {creator.firstName} {creator.lastName}
                    </h3>
                    <p className="text-sm text-gray-400">@{creator.username}</p>
                    {creator.bio && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{creator.bio}</p>
                    )}
                    <span className="mt-3 text-sm text-primary-400">{t('viewProfile')}</span>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
