import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Auth Pages
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'

// Main App Layout
import { MainLayout } from './components/layout/MainLayout'

// Main Pages (ALL require authentication)
import { FeedPage } from './pages/FeedPage'
import { NotificationPage } from './pages/dashboard/NotificationPage'
import { MessagesPage } from './pages/MessagesPage'
import { FollowingPage } from './pages/FollowingPage'
import { ProfilePage } from './pages/dashboard/ProfilePage'
import { SettingsPage } from './pages/dashboard/SettingsPage'
import { CreatorProfilePage } from './pages/CreatorProfilePage'
import { TipDashboardPage } from './pages/TipDashboardPage'

// Creator Pages
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

// Error
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-900">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300">Loading Fanora...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* UNAUTHENTICATED ROUTES */}
      {!isAuthenticated ? (
        <>
          {/* Landing Page (/) */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<RegisterPage />} />
          <Route path="/auth/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Redirect all other routes to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          {/* AUTHENTICATED ROUTES with Sidebar */}
          <Route element={<MainLayout />}>
            {/* Main Pages */}
            <Route path="/home" element={<FeedPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:userId" element={<MessagesPage />} />
            <Route path="/following" element={<FollowingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/tips" element={<TipDashboardPage />} />

            {/* Creator Profiles */}
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/content/:id" element={<ContentViewPage />} />
            <Route path="/creator/:username" element={<CreatorProfilePage />} />

            {/* Creator Dashboard */}
            <Route path="/creator/dashboard" element={<CreatorDashboardPage />} />
            <Route path="/creator/post/new" element={<CreateContentPage />} />
            <Route path="/creator/earnings" element={<EarningsPage />} />
            <Route path="/creator/subscribers" element={<SubscribersPage />} />
            <Route path="/creator/content" element={<ManageContentPage />} />
            <Route path="/creator/plans" element={<SubscriptionPlansPage />} />

            {/* Default to home */}
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </>
      )}
    </Routes>
  )
}

export default App
