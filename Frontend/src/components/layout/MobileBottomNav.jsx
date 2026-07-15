import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ChatBubbleLeftIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

export function MobileBottomNav() {
  const location = useLocation()

  const navItems = [
    { path: '/home', icon: HomeIcon, label: 'Home' },
    { path: '/explore', icon: MagnifyingGlassIcon, label: 'Explore' },
    { path: '/creator/post/new', icon: PlusCircleIcon, label: 'Create', special: true },
    { path: '/messages', icon: ChatBubbleLeftIcon, label: 'Messages' },
    { path: '/profile', icon: UserCircleIcon, label: 'Profile' },
  ]

  const isActive = (path) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-charcoal-800 border-t border-charcoal-700">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          if (item.special) {
            return (
              <Link key={item.path} to={item.path} className="relative -mt-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                active ? 'text-primary-500' : 'text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
