import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { contentAPI } from '../../services/api'
import { useI18n } from '../../contexts/I18nContext'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export function ManageContentPage() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const creatorId = user?.id
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [editingContent, setEditingContent] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({ title: '', description: '' })

  const filters = [
    { key: 'all', labelKey: 'all' },
    { key: 'published', labelKey: 'published' },
    { key: 'draft', labelKey: 'draft' },
  ]

  const { data: content = [], isLoading } = useQuery(
    ['my-content', creatorId, page, filter],
    () => contentAPI.getCreatorContent(creatorId, { page, limit: 20, status: filter }).then(res => res.data?.data || []),
    { enabled: !!creatorId, onError: () => toast.error(t('failedToLoadContent')) }
  )

  const deleteMutation = useMutation(
    (contentId) => contentAPI.deleteContent(contentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-content')
        toast.success(t('contentDeleted'))
      },
      onError: () => toast.error(t('failedToDeleteContent'))
    }
  )

  const updateMutation = useMutation(
    (data) => contentAPI.updateContent(editingContent.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-content')
        setShowEditModal(false)
        toast.success(t('contentUpdated'))
      },
      onError: () => toast.error(t('failedToUpdateContent'))
    }
  )

  const handleDelete = (contentId) => {
    if (confirm(t('confirmDeleteContent'))) {
      deleteMutation.mutate(contentId)
    }
  }

  const handleEdit = (item) => {
    setEditingContent(item)
    setEditFormData({ title: item.title, description: item.description })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    updateMutation.mutate(editFormData)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <PageSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-8">{t('manageContent')}</h1>

        <div className="mb-6 flex gap-2">
          {filters.map(({ key, labelKey }) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setPage(1) }}
              className={`px-4 py-2 rounded-lg transition capitalize ${
                filter === key
                  ? 'bg-primary-500 text-white'
                  : 'bg-charcoal-800 text-gray-300 hover:bg-charcoal-700'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.length > 0 ? (
            content.map(item => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition">
                <div className="relative">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition flex items-center justify-center">
                    <EyeIcon className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-100 mb-2 line-clamp-1">{item.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={item.status === 'published' ? 'success' : 'secondary'}>
                      {t(item.status) || item.status}
                    </Badge>
                    <Badge variant="outline">{item.viewsCount} {t('views')}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-4">{new Date(item.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(item)} variant="outline" size="sm" className="flex-1">
                      <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(item.id)} variant="danger" size="sm" className="flex-1">
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">{t('noContentFound')}</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={t('editContent')}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">{t('titleLabel')}</label>
            <Input
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">{t('description')}</label>
            <Input
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-charcoal-700">
            <Button onClick={() => setShowEditModal(false)} variant="secondary" className="flex-1">
              {t('cancel')}
            </Button>
            <Button onClick={handleSaveEdit} variant="primary" className="flex-1" disabled={updateMutation.isLoading}>
              {t('save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
