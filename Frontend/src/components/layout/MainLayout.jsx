import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { MobileBottomNav } from './MobileBottomNav'
import {
  HomeIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  WalletIcon,
} from '@heroicons/react/24/outline'

export function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navItems = [
    { icon: HomeIcon, label: 'Home', path: '/home' },
    { icon: MagnifyingGlassIcon, label: 'Explore', path: '/explore' },
    { icon: BellIcon, label: 'Notifications', path: '/notifications' },
    { icon: ChatBubbleLeftIcon, label: 'Messages', path: '/messages' },
    { icon: WalletIcon, label: 'Wallet', path: '/wallet' },
    { icon: UserGroupIcon, label: 'Following', path: '/following' },
    { icon: SparklesIcon, label: 'Tips', path: '/tips' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-charcoal-900 flex">
      {/* LEFT SIDEBAR */}
      <div className="w-64 bg-charcoal-800 border-r border-charcoal-700 fixed left-0 top-0 h-screen overflow-y-auto flex-col hidden md:flex">
        {/* Logo */}
        <div className="p-6 border-b border-charcoal-700">
          <Link to="/home" className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg">
              <span className="text-xl font-bold text-white">F</span>
            </div>
            <span className="text-2xl font-bold text-gray-100">Fanora</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-300 hover:bg-charcoal-700'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-lg font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Menu */}
        <div className="border-t border-charcoal-700 px-4 py-6 space-y-2">
          {/* Creator Dashboard (if creator) */}
          {user?.isCreator && (
            <Link
              to="/creator/dashboard"
              className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors ${
                location.pathname.startsWith('/creator')
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-300 hover:bg-charcoal-700'
              }`}
            >
              <div className="h-6 w-6 bg-primary-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              <span className="text-lg font-medium">Creator</span>
            </Link>
          )}

          <Link
            to="/profile"
            className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors ${
              isActive('/profile')
                ? 'bg-primary-500 text-white'
                : 'text-gray-300 hover:bg-charcoal-700'
            }`}
          >
            <UserCircleIcon className="h-6 w-6" />
            <span className="text-lg font-medium">Profile</span>
          </Link>

          <Link
            to="/settings"
            className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors ${
              isActive('/settings')
                ? 'bg-primary-500 text-white'
                : 'text-gray-300 hover:bg-charcoal-700'
            }`}
          >
            <Cog6ToothIcon className="h-6 w-6" />
            <span className="text-lg font-medium">Settings</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-4 px-4 py-3 rounded-lg text-gray-300 hover:bg-charcoal-700 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
            <span className="text-lg font-medium">Sign Out</span>
          </button>
        </div>

        {/* User Info at bottom */}
        <div className="border-t border-charcoal-700 p-4">
          <div className="bg-charcoal-700 rounded-lg p-3">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-semibold text-gray-100 truncate">
              @{user?.username}
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-0 md:ml-64 pb-20 md:pb-0">
        <Outlet />
      </main>

      <MobileBottomNav />
    </div>
  )
}
