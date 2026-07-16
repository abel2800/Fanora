import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { usersAPI } from '../services/api'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { PageSkeleton } from '../components/ui/Skeleton'
import { useI18n } from '../contexts/I18nContext'
import toast from 'react-hot-toast'

export function FollowingPage() {
  const { t } = useI18n()
  const queryClient = useQueryClient()

  const { data: following = [], isLoading } = useQuery(['my-following'], async () => {
    const { data } = await usersAPI.getMyFollowing()
    return data.data || data || []
  })

  const unfollowMutation = useMutation((userId) => usersAPI.unfollowUser(userId), {
    onSuccess: () => {
      toast.success(t('unfollowed'))
      queryClient.invalidateQueries(['my-following'])
    },
    onError: (error) => toast.error(error.response?.data?.message || t('failedToUnfollow')),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <PageSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">{t('following')}</h1>
        {following.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">{t('notFollowingAnyone')}</p>
            <Link to="/explore">
              <Button variant="primary">{t('exploreCreators')}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {following.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between p-4 rounded-xl bg-charcoal-800"
              >
                <Link to={`/creator/${person.username}`} className="flex items-center gap-3">
                  <Avatar src={person.profileImage} alt={person.username} />
                  <div>
                    <p className="text-gray-100 font-medium">
                      {person.firstName} {person.lastName}
                    </p>
                    <p className="text-sm text-gray-400">@{person.username}</p>
                  </div>
                </Link>
                <Button
                  variant="secondary"
                  onClick={() => unfollowMutation.mutate(person.id)}
                  disabled={unfollowMutation.isLoading}
                >
                  {t('unfollow')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
