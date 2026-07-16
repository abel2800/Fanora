import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useI18n } from './contexts/I18nContext'

import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'

import { MainLayout } from './components/layout/MainLayout'

import { FeedPage } from './pages/FeedPage'
import { NotificationPage } from './pages/dashboard/NotificationPage'
import { MessagesPage } from './pages/MessagesPage'
import { FollowingPage } from './pages/FollowingPage'
import { ProfilePage } from './pages/dashboard/ProfilePage'
import { SettingsPage } from './pages/dashboard/SettingsPage'
import { CreatorProfilePage } from './pages/CreatorProfilePage'
import { TipDashboardPage } from './pages/TipDashboardPage'

import { CreatorDashboardPage } from './pages/dashboard/CreatorDashboardPage'
import { CreateContentPage } from './pages/creator/CreateContentPage'
import { EarningsPage } from './pages/creator/EarningsPage'
import { ExplorePage } from './pages/ExplorePage'
import { SearchPage } from './pages/SearchPage'
import { WalletPage } from './pages/dashboard/WalletPage'
import { StoriesPage } from './pages/StoriesPage'
import { ContentViewPage } from './pages/ContentViewPage'
import { ManageContentPage } from './pages/creator/ManageContentPage'
import { SubscriptionPlansPage } from './pages/creator/SubscriptionPlansPage'
import { SubscribersPage } from './pages/creator/SubscribersPage'
import { LivePage } from './pages/LivePage'
import { MassMessagePage } from './pages/creator/MassMessagePage'
import { ContentBundlesPage } from './pages/creator/ContentBundlesPage'
import { AudienceInsightsPage } from './pages/creator/AudienceInsightsPage'
import { ReferralProgramPage } from './pages/creator/ReferralProgramPage'
import { TrustCenterPage } from './pages/TrustCenterPage'
import { SubscriptionsPage } from './pages/dashboard/SubscriptionsPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { RequestsPage } from './pages/RequestsPage'
import { GiftsPage } from './pages/GiftsPage'
import { RequestInboxPage } from './pages/creator/RequestInboxPage'
import { ContentCalendarPage } from './pages/creator/ContentCalendarPage'
import { CreatorOnboardingPage } from './pages/creator/CreatorOnboardingPage'
import { WishlistPage } from './pages/WishlistPage'

import { NotFoundPage } from './pages/NotFoundPage'
import { CreatorRoute } from './components/auth/CreatorRoute'

function App() {
  const { isLoading, isAuthenticated } = useAuth()
  const { t } = useI18n()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-900">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300">{t('loadingFanora')}</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<RegisterPage />} />
          <Route path="/auth/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<FeedPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:userId" element={<MessagesPage />} />
            <Route path="/following" element={<FollowingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/trust" element={<TrustCenterPage />} />
            <Route path="/tips" element={<TipDashboardPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/gifts" element={<GiftsPage />} />
            <Route path="/creator/onboarding" element={<CreatorOnboardingPage />} />

            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/live" element={<LivePage />} />
            <Route path="/content/:id" element={<ContentViewPage />} />
            <Route path="/creator/:username" element={<CreatorProfilePage />} />

            <Route path="/creator/dashboard" element={<CreatorRoute><CreatorDashboardPage /></CreatorRoute>} />
            <Route path="/creator/post/new" element={<CreatorRoute><CreateContentPage /></CreatorRoute>} />
            <Route path="/creator/content/create" element={<CreatorRoute><CreateContentPage /></CreatorRoute>} />
            <Route path="/creator/earnings" element={<CreatorRoute><EarningsPage /></CreatorRoute>} />
            <Route path="/creator/subscribers" element={<CreatorRoute><SubscribersPage /></CreatorRoute>} />
            <Route path="/creator/content" element={<CreatorRoute><ManageContentPage /></CreatorRoute>} />
            <Route path="/creator/plans" element={<CreatorRoute><SubscriptionPlansPage /></CreatorRoute>} />
            <Route path="/creator/mass-message" element={<CreatorRoute><MassMessagePage /></CreatorRoute>} />
            <Route path="/creator/bundles" element={<CreatorRoute><ContentBundlesPage /></CreatorRoute>} />
            <Route path="/creator/insights" element={<CreatorRoute><AudienceInsightsPage /></CreatorRoute>} />
            <Route path="/creator/referral" element={<CreatorRoute><ReferralProgramPage /></CreatorRoute>} />
            <Route path="/creator/requests" element={<CreatorRoute><RequestInboxPage /></CreatorRoute>} />
            <Route path="/creator/requests/:id" element={<CreatorRoute><RequestInboxPage /></CreatorRoute>} />
            <Route path="/creator/calendar" element={<CreatorRoute><ContentCalendarPage /></CreatorRoute>} />
            <Route path="/admin" element={<AdminDashboardPage />} />

            <Route path="/" element={<Navigate to="/home" replace />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </>
      )}
    </Routes>
  )
}

export default App
