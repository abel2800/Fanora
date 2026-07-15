import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  PlusIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  SparklesIcon,
  ChatBubbleLeftIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Dropdown, DropdownItem, DropdownDivider } from '../ui/Dropdown'

export function Header() {
  const [activeTab, setActiveTab] = useState('for-you')
  const [searchQuery, setSearchQuery] = useState('')
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const isCreatorPage = location.pathname.startsWith('/creator')

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block bg-charcoal-800 border-b border-charcoal-700 sticky top-0 z-40">
        <div className="px-6 py-4">
          {/* Logo and Search Row */}
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="h-10 w-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-gray-100 hidden lg:inline">Fanora</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-6">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search creators, content..."
                  className="input-base w-full bg-charcoal-700 border-charcoal-600"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Creator Create Button */}
                  {user?.isCreator && (
                    <Dropdown
                      trigger={
                        <button className="btn-primary btn-sm">
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Create
                        </button>
                      }
                    >
                      <DropdownItem onClick={() => navigate('/creator/content/create')}>
                        Upload Content
                      </DropdownItem>
                      <DropdownItem onClick={() => navigate('/creator/plans')}>
                        Manage Plans
                      </DropdownItem>
                      <DropdownDivider />
                      <DropdownItem onClick={() => navigate('/creator')}>
                        Creator Dashboard
                      </DropdownItem>
                    </Dropdown>
                  )}

                  {/* Notifications */}
                  <button className="p-2 rounded-lg hover:bg-charcoal-700 transition-colors relative text-gray-300 hover:text-gray-100">
                    <BellIcon className="h-6 w-6" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-primary-500 rounded-full"></span>
                  </button>

                  {/* User Menu */}
                  <Dropdown
                    trigger={
                      <button className="flex items-center space-x-2 p-1 rounded-lg hover:bg-charcoal-700 transition-colors">
                        <Avatar
                          src={user?.profileImage}
                          alt={user?.username}
                          fallback={`${user?.firstName} ${user?.lastName}`}
                        />
                      </button>
                    }
                  >
                    <div className="px-4 py-2 border-b border-charcoal-700">
                      <p className="text-sm font-medium text-gray-100">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-400">@{user?.username}</p>
                      {user?.wallet && (
                        <p className="text-xs text-primary-400 font-medium mt-1">
                          {user.wallet.balance?.toLocaleString()} ETB
                        </p>
                      )}
                    </div>

                    <DropdownItem onClick={() => navigate('/dashboard')}>
                      <UserCircleIcon className="h-4 w-4 mr-2" />
                      Dashboard
                    </DropdownItem>

                    <DropdownItem onClick={() => navigate('/dashboard/wallet')}>
                      <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                      Wallet
                    </DropdownItem>

                    {user?.isCreator && (
                      <DropdownItem onClick={() => navigate('/creator')}>
                        <div className="h-4 w-4 mr-2 bg-primary-500 rounded-sm flex items-center justify-center">
                          <span className="text-white text-xs font-bold">C</span>
                        </div>
                        Creator Hub
                      </DropdownItem>
                    )}

                    <DropdownDivider />

                    <DropdownItem onClick={() => navigate('/dashboard/settings')}>
                      <Cog6ToothIcon className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownItem>

                    <DropdownItem onClick={handleLogout}>
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownItem>
                  </Dropdown>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/auth/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth/register">
                    <Button variant="primary" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Feed Tabs - Only show on feed page */}
          {!isCreatorPage && isAuthenticated && (
            <div className="border-t border-charcoal-700 pt-4">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('for-you')}
                  className={`pb-2 px-1 font-medium text-sm transition-colors border-b-2 ${
                    activeTab === 'for-you'
                      ? 'text-primary-400 border-primary-500'
                      : 'text-gray-400 border-transparent hover:text-gray-300'
                  }`}
                >
                  <SparklesIcon className="h-4 w-4 inline mr-2" />
                  For You
                </button>
                <button
                  onClick={() => setActiveTab('following')}
                  className={`pb-2 px-1 font-medium text-sm transition-colors border-b-2 ${
                    activeTab === 'following'
                      ? 'text-primary-400 border-primary-500'
                      : 'text-gray-400 border-transparent hover:text-gray-300'
                  }`}
                >
                  <FireIcon className="h-4 w-4 inline mr-2" />
                  Following
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-charcoal-800 border-t border-charcoal-700 z-40">
        <div className="flex items-center justify-around px-3">
          <Link
            to="/dashboard"
            className={`flex-1 py-4 px-3 flex flex-col items-center justify-center rounded-lg transition-colors ${
              location.pathname === '/dashboard'
                ? 'text-primary-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link
            to="/explore"
            className={`flex-1 py-4 px-3 flex flex-col items-center justify-center rounded-lg transition-colors ${
              location.pathname === '/explore'
                ? 'text-primary-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <SparklesIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Explore</span>
          </Link>

          {isAuthenticated && user?.isCreator && (
            <Link
              to="/creator/content/create"
              className="flex-1 py-4 px-3 flex flex-col items-center justify-center rounded-lg text-primary-400 hover:text-primary-300 transition-colors"
            >
              <div className="h-6 w-6 bg-primary-500 rounded flex items-center justify-center">
                <PlusIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs mt-1">Create</span>
            </Link>
          )}

          <Link
            to="/dashboard/messages"
            className={`flex-1 py-4 px-3 flex flex-col items-center justify-center rounded-lg transition-colors ${
              location.pathname === '/dashboard/messages'
                ? 'text-primary-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <ChatBubbleLeftIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Messages</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`flex-1 py-4 px-3 flex flex-col items-center justify-center rounded-lg transition-colors ${
                location.pathname === '/dashboard/profile'
                  ? 'text-primary-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <UserCircleIcon className="h-6 w-6" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Padding */}
      <div className="md:hidden h-20"></div>
    </>
  )
}
