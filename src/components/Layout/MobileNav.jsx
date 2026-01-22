import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  HomeIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../../store/slices/authSlice'
import AuthModal from '../Auth/AuthModal'

export default function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home', onClick: null },
    { path: '/category/all', icon: Squares2X2Icon, label: 'Shop', onClick: null },
    { path: '/search', icon: MagnifyingGlassIcon, label: 'Search', onClick: null },
    {
      path: '/dashboard',
      icon: UserIcon,
      label: 'Profile',
      onClick: () => {
        if (isAuthenticated) navigate('/dashboard')
        else setShowAuthModal(true)
      },
    },
  ]

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 pb-safe">
        <div className="mx-3 mb-3 rounded-2xl glass-card shadow-glass border border-gray-200 dark:border-white/15 px-2 py-3">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                location.pathname === item.path ||
                (item.path === '/category/all' && location.pathname.startsWith('/category'))
              return item.onClick ? (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`flex flex-col items-center justify-center flex-1 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-brand-mint bg-brand-mint/10 dark:bg-white/12 scale-105'
                      : 'text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-[11px] mt-1 font-medium">{item.label}</span>
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex flex-col items-center justify-center flex-1 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-brand-mint bg-brand-mint/10 dark:bg-white/12 scale-105'
                      : 'text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-[11px] mt-1 font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  )
}
