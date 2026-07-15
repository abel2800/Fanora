import { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { useAuth } from '../../contexts/AuthContext'
import { usersAPI } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Avatar } from '../../components/ui/Avatar'
import toast from 'react-hot-toast'
import {
  CameraIcon,
  CheckBadgeIcon,
  PencilIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || ''
  })

  // Fetch full profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      try {
        const response = await usersAPI.getProfile()
        return response.data
      } catch (err) {
        toast.error('Failed to load profile')
        return user
      }
    }
  })

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await usersAPI.updateProfile(data)
      return response.data
    },
    onSuccess: (data) => {
      updateUser(data)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  const currentProfile = profile || user
  const displayData = isEditing ? formData : currentProfile

  if (isLoading) {
    return (
      <div className="bg-charcoal-900 min-h-screen">
        <div className="animate-pulse">
          <div className="h-32 bg-charcoal-800"></div>
          <div className="px-4 py-8">
            <div className="h-20 w-20 bg-charcoal-700 rounded-full mb-4"></div>
            <div className="h-8 w-40 bg-charcoal-700 rounded mb-4"></div>
            <div className="h-64 bg-charcoal-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-charcoal-900 min-h-screen">
      {/* Cover Photo */}
      <div className="relative h-32 md:h-48 bg-gradient-to-r from-primary-600 to-primary-800">
        {/* Optional: Add cover photo */}
        <button className="absolute top-4 right-4 p-2 bg-charcoal-800 hover:bg-charcoal-700 rounded-full text-gray-300 transition-colors">
          <CameraIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Profile Info Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Profile Header Overlap */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16 mb-8 relative z-10">
          {/* Avatar */}
          <div className="mb-6 sm:mb-0">
            <div className="relative">
              <Avatar
                src={displayData?.profileImage}
                alt={displayData?.firstName}
                className="h-32 w-32 border-4 border-charcoal-900"
              />
              {!isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors">
                  <CameraIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Name & Verification */}
          <div className="flex-1 mb-6 sm:mb-0">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-100">
                {displayData?.firstName} {displayData?.lastName}
              </h1>
              {displayData?.isVerified && (
                <CheckBadgeIcon className="h-7 w-7 text-primary-500" />
              )}
            </div>
            <p className="text-gray-400 text-lg mb-4">
              @{displayData?.username}
            </p>
            {!isEditing && (
              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => setIsEditing(true)}
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                  <span>Settings</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bio & Stats Section */}
        {!isEditing && displayData?.bio && (
          <div className="bg-charcoal-800 rounded-xl p-6 mb-8 border border-charcoal-700">
            <p className="text-gray-200 text-lg">
              {displayData.bio}
            </p>
          </div>
        )}

        {/* Stats Grid */}
        {!isEditing && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-charcoal-800 rounded-xl p-6 border border-charcoal-700 text-center">
              <div className="text-3xl font-bold text-primary-400 mb-2">
                {displayData?.followers || 0}
              </div>
              <p className="text-gray-400 text-sm">Followers</p>
            </div>
            <div className="bg-charcoal-800 rounded-xl p-6 border border-charcoal-700 text-center">
              <div className="text-3xl font-bold text-primary-400 mb-2">
                {displayData?.following || 0}
              </div>
              <p className="text-gray-400 text-sm">Following</p>
            </div>
            <div className="bg-charcoal-800 rounded-xl p-6 border border-charcoal-700 text-center">
              <div className="text-3xl font-bold text-primary-400 mb-2">
                {displayData?.totalEarnings || 0}
              </div>
              <p className="text-gray-400 text-sm">Earnings</p>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <div className="bg-charcoal-800 rounded-xl p-6 border border-charcoal-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </div>

              {/* Username & Email (Read-only) */}
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                disabled
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                disabled
              />

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                  rows="4"
                  className="input-base resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4 border-t border-charcoal-700">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      firstName: currentProfile?.firstName || '',
                      lastName: currentProfile?.lastName || '',
                      username: currentProfile?.username || '',
                      email: currentProfile?.email || '',
                      bio: currentProfile?.bio || '',
                      profileImage: currentProfile?.profileImage || ''
                    })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Email Verification Status */}
        {!isEditing && (
          <div className="bg-charcoal-800 rounded-xl p-6 border border-charcoal-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-100 font-semibold mb-1">Email Verification</h3>
                <p className="text-gray-400 text-sm">
                  {displayData?.isEmailVerified
                    ? 'Your email is verified'
                    : 'Verify your email to unlock all features'}
                </p>
              </div>
              {displayData?.isEmailVerified && (
                <CheckBadgeIcon className="h-6 w-6 text-success-500" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
