import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { BookmarkSlashIcon } from '@heroicons/react/24/outline'
import { wishlistAPI } from '../services/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageSkeleton } from '../components/ui/Skeleton'
import { useI18n } from '../contexts/I18nContext'

export function WishlistPage() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const { data: items = [], isLoading } = useQuery(
    ['wishlist'],
    () => wishlistAPI.getAll(),
    { select: (response) => response.data?.data || [] },
  )
  const remove = useMutation(
    (contentId) => wishlistAPI.remove(contentId),
    { onSuccess: () => queryClient.invalidateQueries(['wishlist']) },
  )

  if (isLoading) return <PageSkeleton />

  return (
    <main className="min-h-screen bg-charcoal-900 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-semibold text-gray-100">{t('wishlist')}</h1>
        <p className="mt-2 text-gray-400">{t('wishlistHint')}</p>
        {items.length === 0 ? (
          <Card className="mt-8 p-10 text-center text-gray-400">{t('wishlistEmpty')}</Card>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(({ id, content }) => (
              <Card key={id} className="overflow-hidden">
                <Link to={`/content/${content.id}`}>
                  {content.thumbnailUrl ? (
                    <img
                      src={content.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-video w-full bg-gradient-to-br from-primary-500/20 to-charcoal-700" />
                  )}
                  <div className="p-4">
                    <p className="font-semibold text-gray-100">{content.title}</p>
                    <p className="mt-1 text-sm text-gray-500">@{content.creator?.username}</p>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mx-4 mb-4"
                  onClick={() => remove.mutate(content.id)}
                >
                  <BookmarkSlashIcon className="mr-2 h-4 w-4" />
                  {t('remove')}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
