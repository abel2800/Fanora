import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { subscriptionsAPI } from '../../services/api'
import { useI18n } from '../../contexts/I18nContext'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export function SubscriptionPlansPage() {
  const { t } = useI18n()
  const queryClient = useQueryClient()

  const { data: plans = [], isLoading } = useQuery(
    ['my-subscription-plans'],
    () => subscriptionsAPI.getMyPlans().then(res => res.data?.data || []),
    { onError: () => toast.error(t('failedToLoadPlans')) }
  )

  const createMutation = useMutation(
    (data) => subscriptionsAPI.createPlan(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-subscription-plans')
        toast.success(t('planCreated'))
        setIsEditing(false)
      },
      onError: (error) => toast.error(error.response?.data?.message || t('failedToCreatePlan'))
    }
  )

  const updateMutation = useMutation(
    ({ planId, data }) => subscriptionsAPI.updatePlan(planId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-subscription-plans')
        toast.success(t('planUpdated'))
        setIsEditing(false)
      },
      onError: (error) => toast.error(error.response?.data?.message || t('failedToUpdatePlan'))
    }
  )

  const deleteMutation = useMutation(
    (planId) => subscriptionsAPI.deletePlan(planId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-subscription-plans')
        toast.success(t('planDeleted'))
      },
      onError: (error) => toast.error(error.response?.data?.message || t('failedToDeletePlan'))
    }
  )

  const [isEditing, setIsEditing] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    features: [],
    trialDays: 7
  })

  const totalSubscribers = plans.reduce((sum, p) => sum + (p.activeSubscribers || 0), 0)
  const totalRevenue = plans.reduce((sum, p) => sum + (parseFloat(p.price) || 0) * (p.activeSubscribers || 0), 0)
  const creatorEarnings = Math.round(totalRevenue * 0.7)

  const handleAddPlan = () => {
    setEditingPlan(null)
    setFormData({
      name: '',
      price: '',
      description: '',
      features: [],
      trialDays: 7
    })
    setIsEditing(true)
  }

  const handleEditPlan = (plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      description: plan.description,
      features: [...(plan.features || [])],
      trialDays: plan.trialDays
    })
    setIsEditing(true)
  }

  const handleSavePlan = () => {
    if (!formData.name || !formData.price || !formData.description) {
      toast.error(t('fillRequiredFields'))
      return
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      durationInDays: 30,
      features: formData.features.filter(Boolean),
    }

    if (editingPlan) {
      updateMutation.mutate({ planId: editingPlan.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleDeletePlan = (id) => {
    if (confirm(t('confirmDeletePlan'))) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-charcoal-800 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-charcoal-800 rounded" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">{t('subscriptionPlans')}</h1>
        <p className="text-gray-400 mt-2">
          {t('subscriptionPlansSubtitle')}
        </p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{t('totalSubscribers')}</p>
              <p className="text-3xl font-bold text-gray-100 mt-2">
                {totalSubscribers.toLocaleString()}
              </p>
            </div>
            <UsersIcon className="h-12 w-12 text-primary-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{t('monthlyRevenue')}</p>
              <p className="text-3xl font-bold text-primary-500 mt-2">
                {totalRevenue.toLocaleString()} {t('etb')}
              </p>
            </div>
            <CurrencyDollarIcon className="h-12 w-12 text-primary-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{t('yourEarnings70')}</p>
              <p className="text-3xl font-bold text-green-400 mt-2">
                {creatorEarnings.toLocaleString()} {t('etb')}
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Add Plan Button */}
      {!isEditing && (
        <div className="mb-8">
          <Button variant="primary" onClick={handleAddPlan}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('createNewPlan')}
          </Button>
        </div>
      )}

      {/* Plan Form */}
      {isEditing && (
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-6">
            {editingPlan ? t('editPlan') : t('createNewPlan')}
          </h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('planName')} *
              </label>
              <Input
                placeholder={t('planNamePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('monthlyPriceEtb')} *
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g., 299"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('trialPeriodDays')}
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="7"
                  value={formData.trialDays}
                  onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('description')} *
              </label>
              <Input
                placeholder={t('planDescriptionPlaceholder')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('features')}
              </label>
              <div className="space-y-2 mb-3">
                {formData.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Input
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...formData.features]
                        newFeatures[idx] = e.target.value
                        setFormData({ ...formData, features: newFeatures })
                      }}
                      placeholder={t('addFeaturePlaceholder')}
                    />
                    <button
                      onClick={() => {
                        const newFeatures = formData.features.filter((_, i) => i !== idx)
                        setFormData({ ...formData, features: newFeatures })
                      }}
                      className="text-red-500 hover:text-red-400"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                {t('addFeature')}
              </Button>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleSavePlan}
                className="flex-1"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {editingPlan ? t('updatePlan') : t('createPlan')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-6 hover:shadow-lg transition-shadow">
            {/* Plan Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-100">{plan.name}</h3>
                  {plan.isActive !== false && (
                    <Badge variant="success" className="text-xs">
                      {t('active')}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-400">{plan.description}</p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-4 pb-4 border-b border-charcoal-700">
              <p className="text-3xl font-bold text-primary-500">
                {plan.price}
                <span className="text-lg text-gray-400 ml-1">{t('perMonth')}</span>
              </p>
              {plan.trialDays > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {t('dayFreeTrial').replace('{days}', plan.trialDays)}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-charcoal-700">
              <div>
                <p className="text-gray-400 text-xs font-medium">{t('subscribers')}</p>
                <p className="text-xl font-bold text-gray-100 mt-1">
                  {(plan.activeSubscribers || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium">{t('monthlyRevenue')}</p>
                <p className="text-xl font-bold text-green-400 mt-1">
                  {((parseFloat(plan.price) || 0) * (plan.activeSubscribers || 0)).toLocaleString()} {t('etb')}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-300 mb-3">{t('features').toUpperCase()}</p>
              <div className="space-y-2">
                {(plan.features || []).slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <CheckIcon className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
                {(plan.features || []).length > 3 && (
                  <p className="text-xs text-gray-400 mt-2">
                    {t('moreFeatures').replace('{count}', (plan.features || []).length - 3)}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditPlan(plan)}
                className="flex-1"
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeletePlan(plan.id)}
                className="flex-1"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {plans.length === 0 && !isEditing && (
        <Card className="p-12 text-center">
          <StarIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-100 mb-2">{t('noPlansYet')}</h3>
          <p className="text-gray-400 mb-6">{t('createFirstPlanDesc')}</p>
          <Button variant="primary" onClick={handleAddPlan}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('createFirstPlan')}
          </Button>
        </Card>
      )}
    </div>
  )
}

