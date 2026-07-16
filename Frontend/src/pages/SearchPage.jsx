import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { searchAPI } from '../services/api'
import { Avatar } from '../components/ui/Avatar'
import { Input } from '../components/ui/Input'
import { PageSkeleton } from '../components/ui/Skeleton'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../contexts/I18nContext'
import toast from 'react-hot-toast'

const TAB_KEYS = { all: 'all', content: 'content', creators: 'creators' }

export function SearchPage() {
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeTab, setActiveTab] = useState('all')
  const [results, setResults] = useState({ content: [], creators: [] })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const q = searchParams.get('q') || ''
    setQuery(q)
    if (q.length < 2) {
      setResults({ content: [], creators: [] })
      return
    }

    let cancelled = false
    const run = async () => {
      setIsLoading(true)
      try {
        const type = activeTab === 'all' ? 'all' : activeTab === 'creators' ? 'creators' : 'content'
        const { data } = await searchAPI.search({ q, type })
        if (!cancelled) {
          setResults({
            content: data.content || data.data?.content || [],
            creators: data.creators || data.data?.creators || [],
          })
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error.response?.data?.message || t('searchFailed'))
          setResults({ content: [], creators: [] })
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [searchParams, activeTab, t])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim().length < 2) {
      toast.error(t('enterMinTwoChars'))
      return
    }
    setSearchParams({ q: query.trim() })
  }

  const showContent = activeTab === 'all' || activeTab === 'content'
  const showCreators = activeTab === 'all' || activeTab === 'creators'

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Input
                placeholder={t('searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

          {query && (
            <div className="flex space-x-2 border-b border-charcoal-700 pb-4">
              {Object.keys(TAB_KEYS).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {t(TAB_KEYS[tab])}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <PageSkeleton />
          </div>
        )}

        {!isLoading && query.length >= 2 && (
          <div className="space-y-8">
            {showCreators && (
              <section>
                <h2 className="text-lg font-semibold text-gray-100 mb-4">{t('creators')}</h2>
                {results.creators.length === 0 ? (
                  <p className="text-gray-400">{t('noCreatorsFound')}</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {results.creators.map((creator) => (
                      <Link
                        key={creator.id}
                        to={`/creator/${creator.username}`}
                        className="flex items-center gap-3 p-4 rounded-xl bg-charcoal-800 hover:bg-charcoal-700"
                      >
                        <Avatar src={creator.profileImage} alt={creator.username} />
                        <div>
                          <p className="text-gray-100 font-medium">
                            {creator.firstName} {creator.lastName}
                          </p>
                          <p className="text-sm text-gray-400">@{creator.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {showContent && (
              <section>
                <h2 className="text-lg font-semibold text-gray-100 mb-4">{t('content')}</h2>
                {results.content.length === 0 ? (
                  <p className="text-gray-400">{t('noContentFound')}</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results.content.map((item) => (
                      <Link
                        key={item.id}
                        to={`/content/${item.id}`}
                        className="rounded-xl overflow-hidden bg-charcoal-800 hover:bg-charcoal-700"
                      >
                        {item.thumbnailUrl || item.mediaUrl ? (
                          <img
                            src={item.thumbnailUrl || item.mediaUrl}
                            alt={item.title}
                            className="w-full h-40 object-cover"
                          />
                        ) : (
                          <div className="w-full h-40 bg-charcoal-700" />
                        )}
                        <div className="p-3">
                          <p className="text-gray-100 font-medium truncate">{item.title}</p>
                          <p className="text-sm text-gray-400">
                            @{item.creator?.username || 'creator'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
