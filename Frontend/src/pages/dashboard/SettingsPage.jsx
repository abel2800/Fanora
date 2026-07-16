import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from 'react-query'
import { authAPI, usersAPI } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { syncDataSaverFromSettings, setDataSaverEnabled } from '../../lib/dataSaver'
import { useI18n } from '../../contexts/I18nContext'
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
  const { t, setLanguage } = useI18n()
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

  const { data: settingsData } = useQuery({
    queryKey: ['user-settings'],
    queryFn: () => usersAPI.getSettings().then((r) => r.data?.data || {}),
  })

  const [privacy, setPrivacy] = useState({
    incognitoMode: false,
    hideFromSubscriberSearch: false,
    dataSaver: false,
    language: 'en',
  })

  useEffect(() => {
    if (settingsData?.privacy) {
      setPrivacy((p) => ({
        ...p,
        incognitoMode: settingsData.privacy.incognitoMode ?? false,
        hideFromSubscriberSearch: settingsData.privacy.hideFromSubscriberSearch ?? false,
      }))
    }
    if (settingsData?.preferences) {
      setPrivacy((p) => ({
        ...p,
        dataSaver: settingsData.preferences.dataSaver ?? false,
        language: settingsData.preferences.language ?? 'en',
      }))
      syncDataSaverFromSettings(settingsData)
    }
  }, [settingsData])

  const saveSettingsMutation = useMutation({
    mutationFn: (data) => usersAPI.updateSettings(data),
    onSuccess: (_res, variables) => {
      if (variables?.preferences?.dataSaver != null) {
        setDataSaverEnabled(Boolean(variables.preferences.dataSaver))
      }
      if (variables?.preferences?.language) {
        setLanguage(variables.preferences.language)
      }
      toast.success(t('settingsSaved'))
    },
    onError: () => toast.error(t('failedToSave')),
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
      toast.success(t('passwordChanged'))
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('failedToChangePassword'))
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
      toast.error(t('passwordsDoNotMatch'))
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error(t('passwordMinLength'))
      return
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
  }

  return (
    <div className="min-h-screen bg-charcoal-900">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">{t('settings')}</h1>
        <p className="text-gray-400 mt-2">
          {t('manageAccountSecurity')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 border-b border-charcoal-700">
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'password'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-400 border-transparent hover:text-gray-100'
          }`}
        >
          <LockClosedIcon className="h-5 w-5 inline-block mr-2" />
          {t('security')}
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'notifications'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-400 border-transparent hover:text-gray-100'
          }`}
        >
          <BellIcon className="h-5 w-5 inline-block mr-2" />
          {t('notifications')}
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'privacy'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-400 border-transparent hover:text-gray-100'
          }`}
        >
          <LockOpenIcon className="h-5 w-5 inline-block mr-2" />
          {t('privacy')}
        </button>
      </div>

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
            <LockClosedIcon className="h-6 w-6 text-primary-600 mr-2" />
            {t('changePassword')}
          </h2>

          <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
            <div>
              <Input
                label={t('currentPassword')}
                type={showPassword ? 'text' : 'password'}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder={t('enterCurrentPassword')}
                required
              />
            </div>

            <div>
              <Input
                label={t('newPassword')}
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder={t('enterNewPasswordHint')}
                required
              />
            </div>

            <div>
              <Input
                label={t('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder={t('confirmNewPassword')}
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
                  {t('hidePasswords')}
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4 mr-1" />
                  {t('showPasswords')}
                </>
              )}
            </button>

            <div className="pt-4">
              <Button
                variant="primary"
                type="submit"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? t('updating') : t('updatePassword')}
              </Button>
            </div>

            <div className="p-4 bg-charcoal-800 rounded-lg text-sm text-gray-300 border border-charcoal-700">
              <p>
                <strong>{t('passwordTips')}</strong> {t('passwordTipsDesc')}
              </p>
            </div>
          </form>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
            <BellIcon className="h-6 w-6 text-primary-600 mr-2" />
            {t('notificationPreferences')}
          </h2>

          <div className="space-y-4 max-w-md">
            <div className="flex items-center justify-between p-4 border border-charcoal-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-100">{t('emailNotifications')}</p>
                <p className="text-sm text-gray-400">
                  {t('emailNotificationsDesc')}
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

            <div className="flex items-center justify-between p-4 border border-charcoal-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-100">{t('pushNotifications')}</p>
                <p className="text-sm text-gray-400">
                  {t('pushNotificationsDesc')}
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

            <div className="flex items-center justify-between p-4 border border-charcoal-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-100">{t('contentUpdates')}</p>
                <p className="text-sm text-gray-400">
                  {t('contentUpdatesDesc')}
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

            <div className="flex items-center justify-between p-4 border border-charcoal-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-100">{t('promotions')}</p>
                <p className="text-sm text-gray-400">
                  {t('promotionsDesc')}
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
              {t('savePreferences')}
            </Button>
          </div>
        </Card>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">{t('incognitoPrivacy')}</h2>
            <div className="space-y-4 max-w-md">
              {[
                { key: 'incognitoMode', label: t('incognito'), desc: t('incognitoDesc') },
                { key: 'hideFromSubscriberSearch', label: t('hideFromSubscriberSearch'), desc: t('hideFromSubscriberSearchDesc') },
                { key: 'dataSaver', label: t('lowData'), desc: t('dataSaverDesc') },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-4 border border-charcoal-700 rounded-card">
                  <div>
                    <p className="font-medium text-gray-100">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <input type="checkbox" checked={!!privacy[item.key]} onChange={(e) => setPrivacy((p) => ({ ...p, [item.key]: e.target.checked }))} className="w-5 h-5 accent-primary-500" />
                </label>
              ))}
              <select className="input-base" value={privacy.language} onChange={(e) => setPrivacy((p) => ({ ...p, language: e.target.value }))}>
                <option value="en">{t('english')}</option>
                <option value="am">{t('amharic')}</option>
              </select>
              <Button variant="primary" onClick={() => saveSettingsMutation.mutate({
                privacy: { incognitoMode: privacy.incognitoMode, hideFromSubscriberSearch: privacy.hideFromSubscriberSearch },
                preferences: { dataSaver: privacy.dataSaver, language: privacy.language },
              })}>{t('save')}</Button>
              <Link to="/trust" className="text-sm text-primary-500">{t('trust')} →</Link>
            </div>
          </Card>
        </div>
      )}
    </div>
    </div>
  )
}
