import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { liveAPI } from '../services/api'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { PageSkeleton } from '../components/ui/Skeleton'
import { PlayIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../contexts/I18nContext'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export function LivePage() {
  const { t } = useI18n()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showStartModal, setShowStartModal] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [activeStream, setActiveStream] = useState(null)

  const { data: streams = [], isLoading } = useQuery(['live-streams'], async () => {
    const { data } = await liveAPI.list()
    return data.data || []
  }, { refetchInterval: 15000 })

  const startMutation = useMutation(() => liveAPI.start({ title, description }), {
    onSuccess: (res) => {
      setActiveStream(res.data.data)
      setShowStartModal(false)
      toast.success(t('liveStreamStarted'))
      queryClient.invalidateQueries(['live-streams'])
    },
    onError: (e) => toast.error(e.response?.data?.message || t('failedToStartStream')),
  })

  const endMutation = useMutation((id) => liveAPI.end(id), {
    onSuccess: () => {
      setActiveStream(null)
      toast.success(t('streamEnded'))
      queryClient.invalidateQueries(['live-streams'])
    },
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
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-100">{t('live')}</h1>
          {user?.isCreator && (
            <Button variant="primary" onClick={() => setShowStartModal(true)}>
              {t('goLive')}
            </Button>
          )}
        </div>

        {activeStream && (
          <Card className="mb-6 p-4">
            <p className="text-gray-100 font-semibold">{t('yourStreamIsLive')} {activeStream.title}</p>
            <p className="text-sm text-gray-400 mt-1 break-all">{t('ingest')}: {activeStream.ingestUrl}</p>
            <p className="text-sm text-gray-400 break-all">{t('playback')}: {activeStream.playbackUrl}</p>
            <Button className="mt-3" variant="secondary" onClick={() => endMutation.mutate(activeStream.id)}>
              {t('endStream')}
            </Button>
          </Card>
        )}

        {streams.length === 0 ? (
          <p className="text-gray-400">{t('noLiveStreams')}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {streams.map((stream) => (
              <Card key={stream.id} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={stream.creator?.profileImage} alt={stream.creator?.username} />
                  <div>
                    <p className="text-gray-100 font-medium">{stream.title}</p>
                    <p className="text-sm text-gray-400">@{stream.creator?.username}</p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (stream.playbackUrl) {
                      window.open(stream.playbackUrl, '_blank')
                    } else {
                      toast(t('playbackNotAvailable'))
                    }
                  }}
                >
                  <PlayIcon className="w-4 h-4 mr-2" />
                  {t('watch')}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showStartModal} onClose={() => setShowStartModal(false)} title={t('startLiveStream')}>
        <div className="space-y-4">
          <Input placeholder={t('streamTitle')} value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input
            placeholder={t('descriptionOptional')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            variant="primary"
            disabled={!title || startMutation.isLoading}
            onClick={() => startMutation.mutate()}
          >
            {startMutation.isLoading ? t('starting') : t('start')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
