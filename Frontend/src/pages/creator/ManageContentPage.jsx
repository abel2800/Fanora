import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { contentAPI } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export function ManageContentPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [editingContent, setEditingContent] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({ title: '', description: '' })

  const { data: content = [], isLoading } = useQuery(
    ['my-content', page, filter],
    () => contentAPI.getCreatorContent(null, { page, limit: 20, status: filter }).then(res => res.data?.data || []),
    { onError: () => toast.error('Failed to load content') }
  )

  const deleteMutation = useMutation(
    (contentId) => contentAPI.deleteContent(contentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-content')
        toast.success('Content deleted')
      },
      onError: () => toast.error('Failed to delete content')
    }
  )

  const updateMutation = useMutation(
    (data) => contentAPI.updateContent(editingContent.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-content')
        setShowEditModal(false)
        toast.success('Content updated')
      },
      onError: () => toast.error('Failed to update content')
    }
  )

  const handleDelete = (contentId) => {
    if (confirm('Are you sure you want to delete this content?')) {
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
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-900 pb-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-8">Manage Content</h1>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {['all', 'published', 'draft'].map(status => (
            <button
              key={status}
              onClick={() => { setFilter(status); setPage(1) }}
              className={`px-4 py-2 rounded-lg transition capitalize ${
                filter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-charcoal-800 text-gray-300 hover:bg-charcoal-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Content Grid */}
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
                      {item.status}
                    </Badge>
                    <Badge variant="outline">{item.viewsCount} views</Badge>
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
              <p className="text-gray-400">No content found</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Content">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Title</label>
            <Input
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
            <Input
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-charcoal-700">
            <Button onClick={() => setShowEditModal(false)} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} variant="primary" className="flex-1" disabled={updateMutation.isLoading}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
