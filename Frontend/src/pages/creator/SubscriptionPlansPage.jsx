import { useState } from 'react'
import { useQuery } from 'react-query'
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
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: 'Supporter',
      price: 99,
      description: 'Get exclusive content',
      subscribers: 245,
      monthlyRevenue: 24255,
      features: ['Exclusive photos', 'Priority comments', 'Discord access'],
      trialDays: 7,
      active: true,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      name: 'Premium',
      price: 299,
      description: 'Full access + perks',
      subscribers: 128,
      monthlyRevenue: 38272,
      features: ['All Supporter benefits', 'Custom requests', 'Private DMs', 'Founder status'],
      trialDays: 7,
      active: true,
      createdAt: new Date('2024-01-20')
    }
  ])

  const [isEditing, setIsEditing] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    features: [],
    trialDays: 7
  })

  const totalSubscribers = plans.reduce((sum, p) => sum + p.subscribers, 0)
  const totalRevenue = plans.reduce((sum, p) => sum + p.monthlyRevenue, 0)
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
      features: [...plan.features],
      trialDays: plan.trialDays
    })
    setIsEditing(true)
  }

  const handleSavePlan = () => {
    if (!formData.name || !formData.price || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    if (editingPlan) {
      // Update plan
      setPlans(plans.map(p =>
        p.id === editingPlan.id
          ? {
              ...p,
              name: formData.name,
              price: parseInt(formData.price),
              description: formData.description,
              features: formData.features,
              trialDays: formData.trialDays
            }
          : p
      ))
      toast.success('Plan updated successfully')
    } else {
      // Create new plan
      const newPlan = {
        id: Math.max(...plans.map(p => p.id), 0) + 1,
        name: formData.name,
        price: parseInt(formData.price),
        description: formData.description,
        subscribers: 0,
        monthlyRevenue: 0,
        features: formData.features,
        trialDays: formData.trialDays,
        active: true,
        createdAt: new Date()
      }
      setPlans([...plans, newPlan])
      toast.success('Plan created successfully')
    }

    setIsEditing(false)
  }

  const handleDeletePlan = (id) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      setPlans(plans.filter(p => p.id !== id))
      toast.success('Plan deleted')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Subscription Plans</h1>
        <p className="text-gray-400 mt-2">
          Manage your subscription tiers and pricing to maximize earnings
        </p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Subscribers</p>
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
              <p className="text-gray-400 text-sm font-medium">Monthly Revenue</p>
              <p className="text-3xl font-bold text-primary-500 mt-2">
                {totalRevenue.toLocaleString()} ETB
              </p>
            </div>
            <CurrencyDollarIcon className="h-12 w-12 text-primary-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Your Earnings (70%)</p>
              <p className="text-3xl font-bold text-green-400 mt-2">
                {creatorEarnings.toLocaleString()} ETB
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
            Create New Plan
          </Button>
        </div>
      )}

      {/* Plan Form */}
      {isEditing && (
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-6">
            {editingPlan ? 'Edit Plan' : 'Create New Plan'}
          </h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Plan Name *
              </label>
              <Input
                placeholder="e.g., Premium Supporter"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monthly Price (ETB) *
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
                  Trial Period (Days)
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
                Description *
              </label>
              <Input
                placeholder="What does this plan include?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Features
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
                      placeholder="Add a feature"
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
                Add Feature
              </Button>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSavePlan}
                className="flex-1"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {editingPlan ? 'Update Plan' : 'Create Plan'}
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
                  {plan.active && (
                    <Badge variant="success" className="text-xs">
                      Active
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
                <span className="text-lg text-gray-400 ml-1">ETB/month</span>
              </p>
              {plan.trialDays > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {plan.trialDays}-day free trial
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-charcoal-700">
              <div>
                <p className="text-gray-400 text-xs font-medium">Subscribers</p>
                <p className="text-xl font-bold text-gray-100 mt-1">
                  {plan.subscribers.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium">Monthly Revenue</p>
                <p className="text-xl font-bold text-green-400 mt-1">
                  {plan.monthlyRevenue.toLocaleString()} ETB
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-300 mb-3">FEATURES</p>
              <div className="space-y-2">
                {plan.features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <CheckIcon className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
                {plan.features.length > 3 && (
                  <p className="text-xs text-gray-400 mt-2">
                    +{plan.features.length - 3} more features
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
          <h3 className="text-xl font-semibold text-gray-100 mb-2">No Plans Yet</h3>
          <p className="text-gray-400 mb-6">Create your first subscription plan to start earning</p>
          <Button variant="primary" onClick={handleAddPlan}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create First Plan
          </Button>
        </Card>
      )}
    </div>
  )
}

