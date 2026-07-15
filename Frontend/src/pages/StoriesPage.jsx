import { useState } from 'react'
import { useQuery } from 'react-query'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Modal } from '../components/ui/Modal'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export function StoriesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedStory, setSelectedStory] = useState(null)
  const [storyIndex, setStoryIndex] = useState(0)

  const { data: stories = [], isLoading } = useQuery(
    ['stories'],
    () => Promise.resolve([
      {
        id: 1,
        creator: { username: 'creator1', profileImage: 'https://via.placeholder.com/100' },
        imageUrl: 'https://via.placeholder.com/400x800',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
        views: 145,
        isViewed: false
      },
      {
        id: 2,
        creator: { username: 'creator2', profileImage: 'https://via.placeholder.com/100' },
        imageUrl: 'https://via.placeholder.com/400x800',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5h ago
        views: 89,
        isViewed: false
      }
    ])
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Stories</h1>
          <Button onClick={() => setShowCreateModal(true)} variant="primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Story
          </Button>
        </div>

        {/* Stories Carousel */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* My Story (Create New) */}
          <div
            onClick={() => setShowCreateModal(true)}
            className="flex-shrink-0 w-24 h-32 bg-charcoal-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-charcoal-700 transition border-2 border-dashed border-charcoal-700"
          >
            <PlusIcon className="w-8 h-8 text-gray-400" />
          </div>

          {/* Creators' Stories */}
          {stories.map(story => (
            <div
              key={story.id}
              onClick={() => { setSelectedStory(story); setStoryIndex(0) }}
              className={`flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition relative ${
                !story.isViewed ? 'ring-2 ring-primary-500' : 'ring-2 ring-gray-500'
              }`}
            >
              <img src={story.imageUrl} alt={story.creator.username} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-xs text-white font-medium truncate">{story.creator.username}</p>
                <p className="text-xs text-gray-300">{story.views} views</p>
              </div>
            </div>
          ))}
        </div>

        {/* Story Viewer Modal */}
        {selectedStory && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <div className="relative w-full h-full max-w-sm">
              {/* Progress bars */}
              <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
                {[0].map((_, i) => (
                  <div key={i} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full bg-white" style={{ width: '100%' }}></div>
                  </div>
                ))}
              </div>

              {/* Story Image */}
              <img src={selectedStory.imageUrl} alt="Story" className="w-full h-full object-cover" />

              {/* Creator Info */}
              <div className="absolute top-6 left-4 right-4 flex items-center gap-3 z-20">
                <Avatar src={selectedStory.creator.profileImage} size="sm" />
                <div>
                  <p className="text-white font-semibold text-sm">{selectedStory.creator.username}</p>
                  <p className="text-gray-300 text-xs">
                    {Math.round((Date.now() - new Date(selectedStory.createdAt)) / (60 * 1000))}m ago
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 z-20"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              {/* Next/Previous Controls */}
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute inset-y-0 left-0 w-1/3 hover:bg-white hover:bg-opacity-5 z-20"
              />
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute inset-y-0 right-0 w-1/3 hover:bg-white hover:bg-opacity-5 z-20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Create Story Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Story">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-charcoal-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition">
            <PlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-300">Upload photo or video (max 15s)</p>
            <p className="text-xs text-gray-500 mt-2">Stories expire in 24 hours</p>
          </div>
          <Button onClick={() => { setShowCreateModal(false); toast.success('Story posted!') }} variant="primary" className="w-full">
            Post Story
          </Button>
        </div>
      </Modal>
    </div>
  )
}
