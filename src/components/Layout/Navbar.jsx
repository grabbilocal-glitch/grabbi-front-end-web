import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
  StarIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline'
import { selectCartItemCount, openCart } from '../../store/slices/cartSlice'
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice'
import { selectPoints } from '../../store/slices/loyaltySlice'
import { useTheme } from '../../contexts/ThemeContext'
import AuthModal from '../Auth/AuthModal'

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { theme, toggleTheme } = useTheme()
  const cartItemCount = useSelector(selectCartItemCount)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const points = useSelector(selectPoints)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  // Clear search query when navigating away from category page
  useEffect(() => {
    if (!location.pathname.startsWith('/category')) {
      setSearchQuery('')
    }
  }, [location])

  return (
    <>
      <div className="sticky top-0 z-30">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 dark:from-black/60 from-white/60 to-transparent" />
        <nav className="backdrop-blur-md bg-white/95 dark:bg-brand-graphite/95 border-b border-gray-200 dark:border-white/20 shadow-glass">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20 md:h-24">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="h-16 w-24 md:h-20 md:w-28 overflow-hidden rounded-lg transition-transform group-hover:scale-105">
                  <img
                    src="/Grabbi Logo2.webp"
                    alt="GRABBI Logo"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">GRABBI</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gray-600 dark:text-white/80">Quick Commerce</p>
                </div>
              </Link>

              {/* Search Bar - Desktop */}
              <form
                onSubmit={handleSearch}
                className="hidden md:flex flex-1 max-w-2xl mx-6"
              >
                <div className="relative w-full">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-white/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search fresh, premium, ready in minutes..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-brand-mint/70 transition-all"
                  />
                </div>
              </form>

              <div className="flex items-center space-x-3 md:space-x-5">
                {isAuthenticated && (
                  <div className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20">
                    <StarIcon className="h-5 w-5 text-brand-gold" />
                    <div className="leading-tight">
                      <p className="text-xs text-gray-600 dark:text-white/80">Loyalty</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{points} pts</p>
                    </div>
                  </div>
                )}

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20 transition-all hover:scale-105"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <SunIcon className="h-6 w-6 text-gray-900 dark:text-white" />
                  ) : (
                    <MoonIcon className="h-6 w-6 text-gray-900 dark:text-white" />
                  )}
                </button>

                {/* Account */}
                <button
                  onClick={() => (isAuthenticated ? navigate('/dashboard') : setShowAuthModal(true))}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20 transition-all hover:scale-105"
                  title={isAuthenticated ? `${user?.firstName || 'Account'}` : 'Sign in'}
                  aria-label={isAuthenticated ? `${user?.firstName || 'Account'}` : 'Sign in'}
                >
                  <UserIcon className="h-6 w-6 text-gray-900 dark:text-white" />
                </button>

                {/* Cart */}
                <button
                  onClick={() => dispatch(openCart())}
                  className="relative p-2 rounded-xl bg-gradient-to-br from-brand-mint to-brand-emerald text-brand-graphite shadow-glow transition-all hover:scale-105 active:scale-95"
                  aria-label={`Shopping cart ${cartItemCount > 0 ? `(${cartItemCount} items)` : ''}`}
                >
                  <ShoppingBagIcon className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gray-900 dark:bg-brand-graphite text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border border-white/50 animate-pulse">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3 pt-2 bg-white/95 dark:bg-brand-graphite/95 backdrop-blur-lg border-b border-gray-200 dark:border-white/20">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-white/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-brand-mint/70 transition-all"
              />
            </div>
          </form>
        </div>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  )
}
