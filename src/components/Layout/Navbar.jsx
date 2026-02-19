import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
  StarIcon,
  SunIcon,
  MoonIcon,
  MapPinIcon,
  ChevronDownIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'
import { selectCartItemCount, openCart, selectCartItems, selectCartFranchiseId, clearBackendCart, setCartFranchise } from '../../store/slices/cartSlice'
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice'
import { selectPoints } from '../../store/slices/loyaltySlice'
import { selectSelectedFranchise, selectNearbyFranchises, setSelectedFranchise } from '../../store/slices/franchiseSlice'
import { useTheme } from '../../contexts/ThemeContext'
import AuthModal from '../Auth/AuthModal'
import StoreSelector from '../Location/StoreSelector'
import { getStoreStatusInfo } from '../../utils/storeHours'

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showStoreSelector, setShowStoreSelector] = useState(false)
  const [showFranchiseDropdown, setShowFranchiseDropdown] = useState(false)
  const [showCartClearConfirm, setShowCartClearConfirm] = useState(false)
  const [pendingFranchise, setPendingFranchise] = useState(null)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { theme, toggleTheme } = useTheme()
  const cartItemCount = useSelector(selectCartItemCount)
  const cartItems = useSelector(selectCartItems)
  const cartFranchiseId = useSelector(selectCartFranchiseId)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const points = useSelector(selectPoints)
  const selectedFranchise = useSelector(selectSelectedFranchise)
  const nearbyFranchises = useSelector(selectNearbyFranchises)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSelectFranchise = (franchise) => {
    // Don't allow selecting closed franchises
    const storeStatus = getStoreStatusInfo(franchise)
    if (!storeStatus.isOpen) {
      return
    }
    
    // Check if changing franchise with items in cart
    const newFranchiseId = franchise?.id
    const hasCartItems = cartItems && cartItems.length > 0
    const currentStoreId = cartFranchiseId || selectedFranchise?.id
    
    if (hasCartItems && currentStoreId && currentStoreId !== newFranchiseId) {
      // Show confirmation dialog
      setPendingFranchise(franchise)
      setShowFranchiseDropdown(false)
      setShowCartClearConfirm(true)
      return
    }
    
    // No cart conflict, just set the franchise
    dispatch(setSelectedFranchise(franchise))
    dispatch(setCartFranchise(newFranchiseId))
    setShowFranchiseDropdown(false)
  }

  const handleConfirmCartClear = () => {
    // Clear the cart
    dispatch(clearBackendCart())
    setShowCartClearConfirm(false)
    setPendingFranchise(null)
    
    // If we have a pending franchise, switch to it
    if (pendingFranchise) {
      dispatch(setSelectedFranchise(pendingFranchise))
      dispatch(setCartFranchise(pendingFranchise?.id))
    } else {
      // No pending franchise - user clicked "Change" button, open store selector
      setShowStoreSelector(true)
    }
  }

  const handleCancelCartClear = () => {
    // Cancel the franchise change
    setShowCartClearConfirm(false)
    setPendingFranchise(null)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFranchiseDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

        {/* Store indicator bar */}
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  // Check if user has items in cart before allowing location change
                  const hasCartItems = cartItems && cartItems.length > 0
                  if (hasCartItems) {
                    // Show confirmation dialog - user must clear cart to change location
                    setShowCartClearConfirm(true)
                    return
                  }
                  
                  if (nearbyFranchises.length > 1) {
                    setShowFranchiseDropdown(!showFranchiseDropdown)
                  } else {
                    setShowStoreSelector(true)
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-1.5 text-sm hover:opacity-80 transition-opacity"
              >
                <MapPinIcon className="h-4 w-4 text-brand-mint" />
                {selectedFranchise ? (
                  <span className="text-gray-700 dark:text-white/80">
                    Delivering from <span className="font-semibold text-gray-900 dark:text-white">{selectedFranchise.name}</span>
                    {nearbyFranchises.length > 1 && (
                      <>
                        <ChevronDownIcon className={`h-4 w-4 inline ml-1 transition-transform ${showFranchiseDropdown ? 'rotate-180' : ''}`} />
                        <span className="text-brand-mint ml-2 text-xs font-medium">
                          {nearbyFranchises.length} stores nearby
                        </span>
                      </>
                    )}
                    {nearbyFranchises.length <= 1 && (
                      <span className="text-brand-mint ml-2 text-xs font-medium">Change</span>
                    )}
                  </span>
                ) : (
                  <span className="text-gray-700 dark:text-white/80">
                    Set your location for delivery
                    <span className="text-brand-mint ml-2 text-xs font-medium">Set location</span>
                  </span>
                )}
              </button>

              {/* Franchise Dropdown */}
              {showFranchiseDropdown && nearbyFranchises.length > 1 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-80 rounded-xl bg-white dark:bg-brand-graphite border border-gray-200 dark:border-white/20 shadow-xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                    <p className="text-xs font-medium text-gray-500 dark:text-white/60 px-2">Switch store</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {nearbyFranchises.map((franchise) => {
                      const storeStatus = getStoreStatusInfo(franchise)
                      const isClosed = !storeStatus.isOpen
                      
                      return (
                        <div
                          key={franchise.id}
                          onClick={() => !isClosed && handleSelectFranchise(franchise)}
                          className={`w-full text-left px-4 py-3 transition-colors ${
                            isClosed 
                              ? 'bg-red-50 dark:bg-red-500/10 cursor-not-allowed opacity-90' 
                              : selectedFranchise?.id === franchise.id 
                                ? 'bg-brand-mint/10 dark:bg-brand-mint/20 hover:bg-brand-mint/15 cursor-pointer' 
                                : 'hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer'
                          }`}
                          role={isClosed ? 'div' : 'button'}
                          aria-disabled={isClosed}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {isClosed ? (
                                <LockClosedIcon className="h-5 w-5 text-red-500" />
                              ) : selectedFranchise?.id === franchise.id ? (
                                <CheckIcon className="h-5 w-5 text-brand-mint" />
                              ) : (
                                <MapPinIcon className="h-5 w-5 text-gray-400 dark:text-white/40" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`font-medium truncate ${
                                  isClosed
                                    ? 'text-red-700 dark:text-red-400'
                                    : selectedFranchise?.id === franchise.id 
                                      ? 'text-brand-mint' 
                                      : 'text-gray-900 dark:text-white'
                                }`}>
                                  {franchise.name}
                                </p>
                                {/* Status badge */}
                                {storeStatus.isOpen ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                                    <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                    Open
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
                                    Closed
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs truncate ${isClosed ? 'text-red-500/70 dark:text-red-400/60' : 'text-gray-500 dark:text-white/60'}`}>
                                {franchise.address}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {franchise.distance && (
                                  <p className={`text-xs ${isClosed ? 'text-red-500/60 dark:text-red-400/50' : 'text-brand-mint'}`}>
                                    {franchise.distance < 1 
                                      ? `${Math.round(franchise.distance * 1000)}m away`
                                      : `${franchise.distance.toFixed(1)}km away`
                                    }
                                  </p>
                                )}
                              </div>
                              {/* Opening time message for closed stores */}
                              {isClosed && (
                                <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400">
                                  <ClockIcon className="h-3 w-3" />
                                  <span className="text-[10px] font-medium">
                                    {storeStatus.message}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                    <button
                      onClick={() => {
                        // Check if user has items in cart
                        const hasCartItems = cartItems && cartItems.length > 0
                        if (hasCartItems) {
                          setShowFranchiseDropdown(false)
                          setShowCartClearConfirm(true)
                          return
                        }
                        setShowFranchiseDropdown(false)
                        setShowStoreSelector(true)
                      }}
                      className="w-full text-center py-2 text-sm text-brand-mint hover:text-brand-emerald font-medium transition-colors"
                    >
                      Choose different location
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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
      {showStoreSelector && <StoreSelector onClose={() => setShowStoreSelector(false)} />}
      
      {/* Cart Clear Confirmation Modal */}
      {showCartClearConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={handleCancelCartClear} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-brand-graphite border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-xl">
            <div className="text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
                <ExclamationTriangleIcon className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Change store?</h3>
              <p className="text-sm text-gray-600 dark:text-white/70">
                Switching stores will clear your cart. You have {cartItems?.length || 0} item{cartItems?.length !== 1 ? 's' : ''} from <strong>{selectedFranchise?.name}</strong>.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelCartClear}
                className="flex-1 py-3 rounded-xl button-ghost font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCartClear}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all hover:scale-105"
              >
                Clear & Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
