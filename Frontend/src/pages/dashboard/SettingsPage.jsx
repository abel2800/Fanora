import { useState } from 'react'
import { useMutation } from 'react-query'
import { authAPI } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import toast from 'react-hot-toast'
import {
  Cog6ToothIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  BellIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline'

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    contentUpdates: true,
    promotions: false
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await authAPI.changePassword(data)
      return response.data
    },
    onSuccess: () => {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      toast.success('Password changed successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password')
    }
  })

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account security and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'password'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          <LockClosedIcon className="h-5 w-5 inline-block mr-2" />
          Security
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'notifications'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          <BellIcon className="h-5 w-5 inline-block mr-2" />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'privacy'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          <LockOpenIcon className="h-5 w-5 inline-block mr-2" />
          Privacy
        </button>
      </div>

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <LockClosedIcon className="h-6 w-6 text-primary-600 mr-2" />
            Change Password
          </h2>

          <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
            <div>
              <Input
                label="Current Password"
                type={showPassword ? 'text' : 'password'}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                required
              />
            </div>

            <div>
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password (min 8 characters)"
                required
              />
            </div>

            <div>
              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                required
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center text-sm text-primary-600 hover:text-primary-700"
            >
              {showPassword ? (
                <>
                  <EyeSlashIcon className="h-4 w-4 mr-1" />
                  Hide passwords
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Show passwords
                </>
              )}
            </button>

            <div className="pt-4">
              <Button
                variant="primary"
                type="submit"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
              <p>
                <strong>Password Tips:</strong> Use a mix of uppercase, lowercase, numbers, and special characters for better security.
              </p>
            </div>
          </form>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <BellIcon className="h-6 w-6 text-primary-600 mr-2" />
            Notification Preferences
          </h2>

          <div className="space-y-4 max-w-md">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">
                  Receive important account updates via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) =>
                    setNotificationSettings(prev => ({
                      ...prev,
                      emailNotifications: e.target.checked
                    }))
                  }
                  className="w-5 h-5 accent-primary-600 cursor-pointer"
                />
              </label>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">
                  Get notified on new content from creators
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.pushNotifications}
                  onChange={(e) =>
                    setNotificationSettings(prev => ({
                      ...prev,
                      pushNotifications: e.target.checked
                    }))
                  }
                  className="w-5 h-5 accent-primary-600 cursor-pointer"
                />
              </label>
            </div>

            {/* Content Updates */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Content Updates</p>
                <p className="text-sm text-gray-600">
                  Notifications when creators you follow upload new content
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.contentUpdates}
                  onChange={(e) =>
                    setNotificationSettings(prev => ({
                      ...prev,
                      contentUpdates: e.target.checked
                    }))
                  }
                  className="w-5 h-5 accent-primary-600 cursor-pointer"
                />
              </label>
            </div>

            {/* Promotions */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Promotions</p>
                <p className="text-sm text-gray-600">
                  Special offers and promotional campaigns
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.promotions}
                  onChange={(e) =>
                    setNotificationSettings(prev => ({
                      ...prev,
                      promotions: e.target.checked
                    }))
                  }
                  className="w-5 h-5 accent-primary-600 cursor-pointer"
                />
              </label>
            </div>

            <Button variant="primary" className="mt-6">
              Save Preferences
            </Button>
          </div>
        </Card>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-4">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <LockOpenIcon className="h-6 w-6 text-primary-600 mr-2" />
              Privacy Settings
            </h2>

            <div className="space-y-4 max-w-md">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Profile Visibility</p>
                  <p className="text-sm text-gray-600">
                    Allow others to see your profile
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 accent-primary-600 cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Show Activity</p>
                  <p className="text-sm text-gray-600">
                    Let others see your activity status
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 accent-primary-600 cursor-pointer"
                  />
                </label>
              </div>

              <Button variant="primary" className="mt-6">
                Save Privacy Settings
              </Button>
            </div>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <h3 className="text-lg font-semibold text-red-900 mb-4">
              Danger Zone
            </h3>
            <p className="text-red-800 mb-4">
              Irreversible actions that cannot be undone. Proceed with caution.
            </p>
            <Button variant="danger">
              Delete Account
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
