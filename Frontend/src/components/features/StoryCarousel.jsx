import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { storiesAPI } from '../../services/api'
import { Avatar } from '../ui/Avatar'
import { Skeleton } from '../ui/Skeleton'

export function StoryCarousel() {
  const { data, isLoading } = useQuery(
    ['stories-feed'],
    () => storiesAPI.getFeed(),
    { select: (res) => res.data.data || [] }
  )

  if (isLoading) {
    return (
      <div className="flex gap-4 py-4 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-14 w-14 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    )
  }

  if (!data?.length) return null

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex gap-4 pb-2">
        {data.map((group) => (
          <Link
            key={group.creator.id}
            to={`/stories?creator=${group.creator.username}`}
            className="flex flex-col items-center flex-shrink-0"
          >
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary-500 to-primary-300">
              <Avatar
                src={group.creator.profileImage}
                alt={group.creator.username}
                size="lg"
                className="border-2 border-charcoal-900"
              />
            </div>
            <span className="text-xs text-gray-300 mt-2 max-w-[72px] truncate">
              {group.creator.username}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
