import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { storiesAPI, uploadAPI } from '../services/api'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Modal } from '../components/ui/Modal'
import { PageSkeleton } from '../components/ui/Skeleton'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../contexts/I18nContext'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { getDataSaverEnabled } from '../lib/dataSaver'

export function StoriesPage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [storyIndex, setStoryIndex] = useState(0)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loadedVideoId, setLoadedVideoId] = useState(null)
  const dataSaver = getDataSaverEnabled()

  const { data: storyGroups = [], isLoading } = useQuery(['stories'], async () => {
    const { data } = await storiesAPI.getFeed()
    return data.data || data || []
  })

  const createMutation = useMutation(
    async () => {
      if (!file) throw new Error(t('selectImageOrVideo'))
      setUploading(true)
      const uploadRes = await uploadAPI.uploadFile(file, 'stories')
      const mediaUrl = uploadRes.data?.data?.url || uploadRes.data?.url
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image'
      return storiesAPI.createStory({ mediaUrl, mediaType })
    },
    {
      onSuccess: () => {
        toast.success(t('storyPosted'))
        setShowCreateModal(false)
        setFile(null)
        queryClient.invalidateQueries(['stories'])
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || error.message || t('failedToCreateStory'))
      },
      onSettled: () => setUploading(false),
    }
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <PageSkeleton />
      </div>
    )
  }

  const currentStory = selectedGroup?.stories?.[storyIndex]

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-100">{t('stories')}</h1>
          {user?.isCreator && (
            <Button onClick={() => setShowCreateModal(true)} variant="primary">
              <PlusIcon className="w-5 h-5 mr-2" />
              {t('createStory')}
            </Button>
          )}
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {user?.isCreator && (
            <div
              onClick={() => setShowCreateModal(true)}
              className="flex-shrink-0 w-24 h-32 bg-charcoal-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-charcoal-700 transition border-2 border-dashed border-charcoal-700"
            >
              <PlusIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}

          {storyGroups.map((group) => {
            const preview = group.stories?.[0]
            const mediaUrl = preview?.mediaUrl || preview?.imageUrl
            return (
              <div
                key={group.creator?.id || preview?.id}
                onClick={() => {
                  setSelectedGroup(group)
                  setStoryIndex(0)
                }}
                className="flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition relative ring-2 ring-primary-500"
              >
                {mediaUrl ? (
                  <img src={mediaUrl} alt={group.creator?.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-charcoal-700" />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70">
                  <p className="text-xs text-white font-medium truncate">
                    @{group.creator?.username}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {storyGroups.length === 0 && (
          <p className="text-gray-400 mt-8">{t('noActiveStories')}</p>
        )}
      </div>

      <Modal isOpen={!!selectedGroup} onClose={() => setSelectedGroup(null)} title={`@${selectedGroup?.creator?.username || ''}`}>
        {currentStory && (
          <div className="relative">
            {currentStory.mediaType === 'video' && (!dataSaver || loadedVideoId === currentStory.id) ? (
              <video
                src={currentStory.mediaUrl}
                controls
                preload={dataSaver ? 'none' : 'metadata'}
                className="w-full max-h-[70vh] rounded-lg"
              />
            ) : currentStory.mediaType === 'video' ? (
              <button
                type="button"
                onClick={() => setLoadedVideoId(currentStory.id)}
                className="flex min-h-72 w-full items-center justify-center rounded-card bg-charcoal-800 text-primary-500"
              >
                {t('tapToLoadVideo')}
              </button>
            ) : (
              <img
                src={currentStory.mediaUrl || currentStory.imageUrl}
                alt="Story"
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
            <div className="flex justify-between mt-4">
              <Button
                variant="secondary"
                disabled={storyIndex <= 0}
                onClick={() => setStoryIndex((i) => Math.max(0, i - 1))}
              >
                {t('previous')}
              </Button>
              <Button
                variant="secondary"
                disabled={storyIndex >= (selectedGroup?.stories?.length || 1) - 1}
                onClick={() => setStoryIndex((i) => i + 1)}
              >
                {t('next')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('createStory')}>
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-300"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              <XMarkIcon className="w-4 h-4 mr-1" />
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              disabled={!file || uploading}
              onClick={() => createMutation.mutate()}
            >
              {uploading ? t('uploading') : t('postStory')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
