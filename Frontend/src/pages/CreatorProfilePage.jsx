import { useState } from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import {
  StarIcon,
  HeartIcon,
  UsersIcon,
  SparklesIcon,
  CheckIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

export function CreatorProfilePage() {
  const { username } = useParams()
  const [followingState, setFollowingState] = useState(false)
  const [selectedTierId, setSelectedTierId] = useState(null)

  // TODO: Fetch from API using username
  const creator = {
    id: 1,
    name: 'Yohannes Getnet',
    username: '@yohank',
    bio: 'Music producer & digital creator | Fanora artist | Curated exclusive beats, tutorials & behind-the-scenes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator1',
    coverImage: 'linear-gradient(135deg, #ff1493 0%, #ff6b7b 100%)',
    isVerified: true,
    followers: 15420,
    following: 342,
    contentCount: 156,
    likeCount: 2340,
    subscriptionPrice: 299, // ETB per month
    totalRevenue: 850000
  }

  const subscriptionTiers = [
    {
      id: 1,
      name: 'Follower',
      price: 0,
      description: 'Free access',
      features: [
        'Access to public posts',
        'Follow creator',
        'Like and comment',
        'Weekly digest'
      ],
      isPopular: false,
      icon: SparklesIcon
    },
    {
      id: 2,
      name: 'VIP Supporter',
      price: 99,
      description: 'ETB/month',
      features: [
        'All Follower benefits',
        'Exclusive photos & videos',
        'Priority comments',
        'Monthly shoutout',
        'Discord access'
      ],
      isPopular: true,
      icon: StarIcon
    },
    {
      id: 3,
      name: 'Gold Member',
      price: 199,
      description: 'ETB/month',
      features: [
        'All VIP benefits',
        'Custom content requests',
        'Private DMs',
        'Early access to new content',
        'Personal birthday message'
      ],
      isPopular: false,
      icon: StarIcon
    },
    {
      id: 4,
      name: 'Platinum Elite',
      price: 499,
      description: 'ETB/month',
      features: [
        'All Gold benefits',
        'One-on-one video calls (1x/month)',
        'Exclusive Platinum events',
        'Lifetime supporter badge',
        'Premium support access'
      ],
      isPopular: false,
      icon: StarIcon
    }
  ]

  const handleFollow = () => {
    setFollowingState(!followingState)
  }

  const handleSubscribe = (tierId) => {
    setSelectedTierId(tierId)
    // Open payment modal in real implementation
  }

  return (
    <div className="min-h-screen bg-charcoal-900">
      {/* Cover Image */}
      <div
        className="h-48 md:h-64 w-full"
        style={{ background: creator.coverImage }}
      />

      {/* Profile Info Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative -mt-24 mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0 mb-4 md:mb-0">
              <img
                src={creator.avatar}
                alt={creator.name}
                className="h-32 w-32 rounded-full border-4 border-charcoal-900 bg-charcoal-800"
              />
            </div>

            {/* Creator Info */}
            <div className="flex-1 mb-4 md:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-100">
                  {creator.name}
                </h1>
                {creator.isVerified && (
                  <Badge variant="primary" className="flex items-center space-x-1">
                    <CheckIcon className="h-3 w-3" />
                    <span>Verified</span>
                  </Badge>
                )}
              </div>
              <p className="text-gray-400 text-lg mb-3">@{creator.username}</p>
              <p className="text-gray-300 text-base max-w-2xl mb-4">
                {creator.bio}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2 mb-4 md:mb-0">
              <Button
                variant={followingState ? "secondary" : "primary"}
                onClick={handleFollow}
                className="w-full md:w-40"
              >
                {followingState ? 'Following' : 'Follow'}
              </Button>
              <Button
                variant="outline"
                className="w-full md:w-40"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-8">
            <StatCard
              icon={HeartIcon}
              label="Likes"
              value={creator.likeCount.toLocaleString()}
            />
            <StatCard
              icon={UsersIcon}
              label="Followers"
              value={creator.followers.toLocaleString()}
            />
            <StatCard
              icon={SparklesIcon}
              label="Posts"
              value={creator.contentCount}
            />
            <StatCard
              icon={StarIcon}
              label="Gold Tier"
              value="199 ETB"
              className="hidden md:block"
            />
          </div>
        </div>

        {/* Subscription Tiers Section */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-100 mb-2">
              Support {creator.name.split(' ')[0]}
            </h2>
            <p className="text-gray-400">
              Join thousands of supporters who get exclusive content and direct access
            </p>
          </div>

          {/* Tier Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionTiers.map((tier) => (
              <SubscriptionTierCard
                key={tier.id}
                tier={tier}
                isSelected={selectedTierId === tier.id}
                onSelect={() => handleSubscribe(tier.id)}
              />
            ))}
          </div>
        </div>

        {/* Recent Content Preview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Recent Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-charcoal-700 to-charcoal-800 flex items-center justify-center">
                  <div className="text-center">
                    <SparklesIcon className="h-12 w-12 text-primary-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Coming Soon</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-100">Exclusive Beat Pack #{i}</h3>
                  <p className="text-sm text-gray-400 mt-1">Available for VIP members</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, className = '' }) {
  return (
    <div className={`text-center ${className}`}>
      {/* <Icon className="h-6 w-6 text-primary-500 mx-auto mb-2" /> */}
      <p className="text-2xl font-bold text-gray-100">{value}</p>
      <p className="text-xs md:text-sm text-gray-400 mt-1">{label}</p>
    </div>
  )
}

// Subscription Tier Card Component
function SubscriptionTierCard({ tier, isSelected, onSelect }) {
  const TierIcon = tier.icon

  return (
    <div
      className={`relative rounded-xl border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-primary-500 bg-charcoal-800 shadow-lg shadow-primary-500/20'
          : 'border-charcoal-700 bg-charcoal-800 hover:border-charcoal-600'
      } ${tier.isPopular ? 'ring-2 ring-primary-500/50' : ''}`}
      onClick={onSelect}
    >
      {/* Popular Badge */}
      {tier.isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="primary" className="px-3">
            Most Popular
          </Badge>
        </div>
      )}

      <div className="p-6">
        {/* Tier Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-100">{tier.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{tier.description}</p>
          </div>
          <TierIcon className="h-6 w-6 text-primary-500 flex-shrink-0" />
        </div>

        {/* Price */}
        <div className="mb-6 pb-6 border-b border-charcoal-700">
          {tier.price > 0 ? (
            <>
              <p className="text-3xl font-bold text-primary-500">{tier.price}</p>
              <p className="text-xs text-gray-400">ETB / month</p>
            </>
          ) : (
            <p className="text-2xl font-bold text-gray-300">Free</p>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          {tier.features.map((feature, idx) => (
            <div key={idx} className="flex items-start space-x-3">
              <CheckIcon className="h-4 w-4 text-primary-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* Subscribe Button */}
        <Button
          variant={isSelected ? "primary" : "outline"}
          className="w-full"
          onClick={(e) => {
            e.stopPropagation()
            onSelect()
          }}
        >
          {tier.price === 0 ? 'Follow' : 'Subscribe'}
        </Button>
      </div>
    </div>
  )
}

