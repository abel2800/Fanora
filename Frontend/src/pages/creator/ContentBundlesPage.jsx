import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { bundlesAPI, contentAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useI18n } from '../../contexts/I18nContext'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import toast from 'react-hot-toast'

export function ContentBundlesPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', price: '', contentIds: [] })

  const { data: bundles = [] } = useQuery(['my-bundles'], () =>
    bundlesAPI.getMyBundles().then((r) => r.data?.data || [])
  )

  const { data: content = [] } = useQuery(
    ['bundle-content', user?.id],
    () => contentAPI.getCreatorContent(user.id, { limit: 50 }).then((r) => r.data?.data || []),
    { enabled: !!user?.id }
  )

  const createMutation = useMutation(
    () => bundlesAPI.createBundle({
      ...form,
      price: parseFloat(form.price),
      contentIds: form.contentIds,
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-bundles')
        toast.success(t('bundleCreated'))
        setShowForm(false)
        setForm({ title: '', description: '', price: '', contentIds: [] })
      },
      onError: (e) => toast.error(e.response?.data?.message || t('failed')),
    }
  )

  const deleteMutation = useMutation(
    (id) => bundlesAPI.deleteBundle(id),
    { onSuccess: () => { queryClient.invalidateQueries('my-bundles'); toast.success(t('delete')) } }
  )

  const toggleContent = (id) => {
    setForm((f) => ({
      ...f,
      contentIds: f.contentIds.includes(id)
        ? f.contentIds.filter((c) => c !== id)
        : [...f.contentIds, id],
    }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-100">{t('contentBundles')}</h1>
          <p className="text-gray-400 mt-1">{t('bundlesSubtitle')}</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>{t('newBundle')}</Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-8 space-y-4">
          <Input placeholder={t('bundleTitle')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder={t('description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input type="number" placeholder={t('priceEtb')} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <p className="text-sm text-gray-400">{t('selectPosts').replace('{count}', form.contentIds.length)}</p>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {content.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-gray-300 text-sm">
                <input type="checkbox" checked={form.contentIds.includes(c.id)} onChange={() => toggleContent(c.id)} />
                {c.title}
              </label>
            ))}
          </div>
          <Button variant="primary" onClick={() => createMutation.mutate()} disabled={createMutation.isLoading}>
            {t('createBundle')}
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        {bundles.map((b) => (
          <Card key={b.id} className="p-6 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-100">{b.title}</h3>
              <p className="text-primary-500 font-display">{parseFloat(b.price).toFixed(0)} {t('etb')} · {t('postsCount').replace('{count}', (b.contentIds || []).length)}</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => deleteMutation.mutate(b.id)}>{t('delete')}</Button>
          </Card>
        ))}
        {!bundles.length && <p className="text-gray-500 text-center py-12">{t('noBundlesYet')}</p>}
      </div>
    </div>
  )
}
