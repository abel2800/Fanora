import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import {
  CheckIcon,
  CalendarIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export function FollowingPage() {
  const [subscriptions, setSubscriptions] = useState([
    {
      id: 1,
      creatorId: 1,
      name: 'Yohannes Getnet',
      username: 'yohank',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator1',
      bio: 'Music producer & digital creator',
      tierName: 'Gold Member',
      tierPrice: 199,
      subscriptionDate: '2024-01-15',
      renewalDate: '2025-04-15',
      isActive: true,
      daysLeft: 15
    },
    {
      id: 2,
      creatorId: 2,
      name: 'Nina Kebede',
      username: 'nina_style',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator2',
      bio: 'Fashion & lifestyle content creator',
      tierName: 'VIP Supporter',
      tierPrice: 99,
      subscriptionDate: '2024-02-01',
      renewalDate: '2025-05-01',
      isActive: true,
      daysLeft: 31
    },
    {
      id: 3,
      creatorId: 3,
      name: 'Abebe Tekle',
      username: 'tech_addis',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator3',
      bio: 'Tech tutorials & coding tips',
      tierName: 'Follower',
      tierPrice: 0,
      subscriptionDate: '2024-03-10',
      renewalDate: null,
      isActive: true,
      daysLeft: null
    },
    {
      id: 4,
      creatorId: 4,
      name: 'Marta Assefa',
      username: 'marta_beauty',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator4',
      bio: 'Beauty & makeup tutorials',
      tierName: 'Gold Member',
      tierPrice: 199,
      subscriptionDate: '2023-11-20',
      renewalDate: '2025-02-20',
      isActive: false,
      daysLeft: -39
    }
  ])

  const [filterType, setFilterType] = useState('all')

  const handleUnsubscribe = (subscriptionId) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== subscriptionId))
    toast.success('Unsubscribed!')
  }

  const handleRenewSoon = (subscriptionId) => {
    toast.success('Subscription renewed!')
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filterType === 'active') return sub.isActive
    if (filterType === 'expiring') return sub.isActive && sub.daysLeft && sub.daysLeft <= 7
    return true
  })

  const activeCount = subscriptions.filter(s => s.isActive).length
  const totalSpent = subscriptions.reduce((sum, sub) => {
    const months = sub.daysLeft ? Math.ceil(sub.daysLeft / 30) : 0
    return sum + (sub.tierPrice * months)
  }, 0)

  return (
    <div className="min-h-screen bg-charcoal-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-charcoal-800 border-b border-charcoal-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-100">Following</h1>
        <p className="text-gray-400 text-sm">Creators you're subscribed to</p>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary-500 mb-1">
              {activeCount}
            </p>
            <p className="text-sm text-gray-400">Active subscriptions</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-100 mb-1">
              {subscriptions.length}
            </p>
            <p className="text-sm text-gray-400">Total creators</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-100 mb-1">
              {totalSpent.toLocaleString()} ETB
            </p>
            <p className="text-sm text-gray-400">Total spent</p>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filterType === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-charcoal-800 text-gray-300 hover:bg-charcoal-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={`px-4 py-2 rounded-lg transition ${
              filterType === 'active'
                ? 'bg-primary-500 text-white'
                : 'bg-charcoal-800 text-gray-300 hover:bg-charcoal-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterType('expiring')}
            className={`px-4 py-2 rounded-lg transition ${
              filterType === 'expiring'
                ? 'bg-primary-500 text-white'
                : 'bg-charcoal-800 text-gray-300 hover:bg-charcoal-700'
            }`}
          >
            Expiring Soon
          </button>
        </div>

        {/* Subscriptions List */}
        {filteredSubscriptions.length === 0 ? (
          <Card className="p-12 text-center">
            <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-100 mb-2">
              No subscriptions found
            </h3>
            <p className="text-gray-400">
              Subscribe to creators to see them here
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSubscriptions.map(sub => (
              <Card key={sub.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar src={sub.avatar} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-100">
                          {sub.name}
                        </h3>
                        {sub.isActive && (
                          <span className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-semibold">
                            <CheckIcon className="h-3 w-3" />
                            Active
                          </span>
                        )}
                        {!sub.isActive && (
                          <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs font-semibold">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">@{sub.username}</p>
                      <p className="text-gray-500 text-sm mt-1">{sub.bio}</p>

                      {/* Subscription Details */}
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="bg-charcoal-700 rounded px-3 py-2">
                          <p className="text-xs text-gray-400">Tier</p>
                          <p className="text-sm font-semibold text-gray-100">
                            {sub.tierName}
                          </p>
                          {sub.tierPrice > 0 && (
                            <p className="text-xs text-primary-400">
                              {sub.tierPrice} ETB/month
                            </p>
                          )}
                        </div>
                        {sub.renewalDate && (
                          <div className="bg-charcoal-700 rounded px-3 py-2">
                            <p className="text-xs text-gray-400">Renews in</p>
                            <p className="text-sm font-semibold text-gray-100">
                              {sub.daysLeft} days
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(sub.renewalDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {sub.isActive && sub.daysLeft && sub.daysLeft <= 7 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRenewSoon(sub.id)}
                      >
                        Renew Now
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnsubscribe(sub.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Unsubscribe
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
