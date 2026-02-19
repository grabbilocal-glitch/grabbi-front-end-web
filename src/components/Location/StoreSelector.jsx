import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MapPinIcon, XMarkIcon, CheckIcon, ExclamationTriangleIcon, ClockIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import {
  setSelectedFranchise,
  setNearbyFranchises,
  setCustomerLocation,
  setLocationLoading,
  setLocationError,
  selectSelectedFranchise,
  selectNearbyFranchises,
  selectLocationLoading,
  selectLocationError,
} from '../../store/slices/franchiseSlice'
import { 
  clearBackendCart, 
  clearCartOnFranchiseChange, 
  selectCartItems,
  selectCartFranchiseId,
  setCartFranchise,
} from '../../store/slices/cartSlice'
import { franchiseService } from '../../services/franchiseService'
import MapLocationPicker from '../Map/MapLocationPicker'
import { getStoreStatusInfo } from '../../utils/storeHours'

export default function StoreSelector({ onClose }) {
  const dispatch = useDispatch()
  const selectedFranchise = useSelector(selectSelectedFranchise)
  const nearbyFranchises = useSelector(selectNearbyFranchises)
  const locationLoading = useSelector(selectLocationLoading)
  const locationError = useSelector(selectLocationError)
  const cartItems = useSelector(selectCartItems)
  const cartFranchiseId = useSelector(selectCartFranchiseId)
  const [mapLocation, setMapLocation] = useState({})
  const [showFranchiseList, setShowFranchiseList] = useState(false)
  const [showCartClearConfirm, setShowCartClearConfirm] = useState(false)
  const [pendingFranchise, setPendingFranchise] = useState(null)

  useEffect(() => {
    if (!selectedFranchise) {
      detectLocation()
    }
  }, [])

  const detectLocation = () => {
    if (!navigator.geolocation) {
      dispatch(setLocationError('Geolocation not supported by your browser'))
      return
    }

    dispatch(setLocationLoading(true))
    dispatch(setLocationError(null))

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        await fetchNearbyFranchises(latitude, longitude)
      },
      () => {
        dispatch(setLocationLoading(false))
        dispatch(setLocationError('Location access denied. Please pick your location on the map below.'))
      },
      { timeout: 10000 }
    )
  }

  const fetchNearbyFranchises = async (lat, lng) => {
    dispatch(setCustomerLocation({ lat, lng }))
    dispatch(setLocationLoading(true))
    dispatch(setLocationError(null))

    try {
      const data = await franchiseService.getNearbyFranchises(lat, lng)
      const franchises = data.franchises || []
      
      dispatch(setNearbyFranchises(franchises))

      if (franchises.length === 0) {
        dispatch(setLocationError('No store delivers to your area yet'))
        dispatch(setSelectedFranchise(null))
      } else if (franchises.length === 1) {
        // Only one franchise total - check if open
        const status = getStoreStatusInfo(franchises[0])
        if (status.isOpen) {
          dispatch(setSelectedFranchise(franchises[0]))
          setShowFranchiseList(false)
        } else {
          // Single store is closed - show it but can't select
          dispatch(setSelectedFranchise(null))
          setShowFranchiseList(false)
          dispatch(setLocationError(`${franchises[0].name} is currently closed. ${status.message}`))
        }
      } else {
        // Multiple franchises - always show the list so users can see all options
        setShowFranchiseList(true)
        
        // Find open franchises
        const openFranchises = franchises.filter(f => {
          const status = getStoreStatusInfo(f)
          return status.isOpen
        })
        
        if (openFranchises.length === 0) {
          // All stores are closed - don't auto-select
          dispatch(setLocationError('All nearby stores are currently closed. You can browse but cannot place orders until a store opens.'))
          dispatch(setSelectedFranchise(null))
        } else if (!selectedFranchise) {
          // Pre-select the nearest open one
          dispatch(setSelectedFranchise(openFranchises[0]))
        }
      }
    } catch {
      // Fallback to old behavior if new endpoint doesn't exist
      try {
        const nearestData = await franchiseService.getNearestFranchise(lat, lng)
        const status = getStoreStatusInfo(nearestData.franchise)
        dispatch(setSelectedFranchise(status.isOpen ? nearestData.franchise : null))
        dispatch(setNearbyFranchises([nearestData.franchise]))
        setShowFranchiseList(false)
        if (!status.isOpen) {
          dispatch(setLocationError('The nearest store is currently closed.'))
        }
      } catch {
        dispatch(setLocationError('No store delivers to your area yet'))
        dispatch(setSelectedFranchise(null))
      }
    } finally {
      dispatch(setLocationLoading(false))
    }
  }

  const handleMapPick = async ({ lat, lng, address }) => {
    setMapLocation({ lat, lng, address })
    await fetchNearbyFranchises(lat, lng)
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
    
    // If user has items in cart and is changing to a different store
    // Check against cartFranchiseId (the store items were added from) or selectedFranchise as fallback
    const currentStoreId = cartFranchiseId || selectedFranchise?.id
    
    if (hasCartItems && currentStoreId && currentStoreId !== newFranchiseId) {
      // Show confirmation dialog
      setPendingFranchise(franchise)
      setShowCartClearConfirm(true)
      return
    }
    
    // No cart conflict, just set the franchise
    dispatch(setSelectedFranchise(franchise))
    dispatch(setCartFranchise(newFranchiseId))
    setShowFranchiseList(false)
  }

  const handleConfirmCartClear = async () => {
    // Clear the cart and switch to new franchise
    dispatch(clearBackendCart())
    dispatch(setSelectedFranchise(pendingFranchise))
    dispatch(setCartFranchise(pendingFranchise?.id))
    setShowCartClearConfirm(false)
    setPendingFranchise(null)
    setShowFranchiseList(false)
  }

  const handleCancelCartClear = () => {
    // Cancel the franchise change
    setShowCartClearConfirm(false)
    setPendingFranchise(null)
  }

  const handleConfirmSelection = () => {
    if (selectedFranchise) {
      // Verify the selected franchise is still open
      const storeStatus = getStoreStatusInfo(selectedFranchise)
      if (!storeStatus.isOpen) {
        // Store is closed, don't allow confirmation
        return
      }
      // Finalize franchise selection and update cart franchise
      dispatch(setCartFranchise(selectedFranchise?.id))
      setShowFranchiseList(false)
    }
  }

  if (selectedFranchise && !onClose && !showFranchiseList) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 dark:bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-glow max-h-[90vh] overflow-y-auto">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors z-10"
          >
            <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-white/60" />
          </button>
        )}

        {/* Cart Clear Confirmation Modal */}
        {showCartClearConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/70" onClick={handleCancelCartClear} />
            <div className="relative w-full max-w-sm rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-glow">
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

        {/* Franchise Selection View */}
        {showFranchiseList && nearbyFranchises.length >= 1 ? (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-brand-mint/20 flex items-center justify-center">
                <MapPinIcon className="h-7 w-7 text-brand-mint" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose your store</h3>
              <p className="text-sm text-gray-600 dark:text-white/70">
                {nearbyFranchises.length} stores deliver to your area. Select one to continue.
              </p>
            </div>

            <div className="space-y-2">
              {nearbyFranchises.map((franchise) => {
                const storeStatus = getStoreStatusInfo(franchise)
                const isClosed = !storeStatus.isOpen
                
                return (
                  <div
                    key={franchise.id}
                    className={`relative w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isClosed
                        ? 'border-red-300 dark:border-red-500/40 bg-red-50/50 dark:bg-red-500/10 cursor-not-allowed'
                        : selectedFranchise?.id === franchise.id
                          ? 'border-brand-mint bg-brand-mint/10 dark:bg-brand-mint/20 cursor-pointer'
                          : 'border-gray-200 dark:border-white/15 hover:border-brand-mint/50 bg-white dark:bg-white/5 cursor-pointer'
                    }`}
                    onClick={() => !isClosed && handleSelectFranchise(franchise)}
                    role={isClosed ? 'div' : 'button'}
                    aria-disabled={isClosed}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-semibold ${isClosed ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                            {franchise.name}
                          </p>
                          {/* Store Status Badge */}
                          {storeStatus.isOpen ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                              Open
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
                              <LockClosedIcon className="w-3 h-3" />
                              Closed
                            </span>
                          )}
                          {selectedFranchise?.id === franchise.id && !isClosed && (
                            <CheckIcon className="h-5 w-5 text-brand-mint" />
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${isClosed ? 'text-red-600/80 dark:text-red-400/70' : 'text-gray-600 dark:text-white/70'}`}>
                          {franchise.address}
                        </p>
                        
                        {/* Store hours status message */}
                        <div className={`flex items-center gap-1.5 mt-2 ${isClosed ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          <ClockIcon className="h-3.5 w-3.5" />
                          <p className="text-xs font-medium">
                            {storeStatus.isOpen ? storeStatus.message : (
                              <>
                                Currently closed · <span className="text-blue-600 dark:text-blue-400 font-semibold">{storeStatus.message}</span>
                              </>
                            )}
                          </p>
                        </div>
                        
                        {/* Distance and delivery time row */}
                        <div className="flex items-center gap-3 mt-2">
                          {franchise.distance && (
                            <p className={`text-xs font-medium ${isClosed ? 'text-red-500/70 dark:text-red-400/60' : 'text-brand-mint'}`}>
                              {franchise.distance < 1 
                                ? `${Math.round(franchise.distance * 1000)}m away`
                                : `${franchise.distance.toFixed(1)}km away`
                              }
                            </p>
                          )}
                          {franchise.delivery_time && !isClosed && (
                            <p className="text-xs text-gray-500 dark:text-white/50">
                              Est. delivery: {franchise.delivery_time}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Closed badge at bottom */}
                    {isClosed && (
                      <div className="mt-3 pt-2 border-t border-red-200 dark:border-red-500/20">
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          Store unavailable for ordering
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              onClick={handleConfirmSelection}
              disabled={!selectedFranchise}
              className="w-full py-3 rounded-xl button-primary font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckIcon className="h-5 w-5" />
              Continue with {selectedFranchise?.name || 'selected store'}
            </button>

            <button
              onClick={() => setShowFranchiseList(false)}
              className="w-full py-2 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Choose different location
            </button>
          </div>
        ) : (
          /* Location Detection View */
          <>
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-full bg-brand-mint/20 flex items-center justify-center">
                <MapPinIcon className="h-7 w-7 text-brand-mint" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Find your store</h3>
              <p className="text-sm text-gray-600 dark:text-white/70">
                We'll find the nearest Grabbi store to deliver your order
              </p>
            </div>

            {locationLoading && (
              <div className="text-center py-4">
                <div className="animate-spin h-8 w-8 border-2 border-brand-mint border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-white/70">Finding stores near you...</p>
              </div>
            )}

            {locationError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-300 text-sm">
                {locationError}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={detectLocation}
                disabled={locationLoading}
                className="w-full py-3 rounded-xl button-primary font-semibold flex items-center justify-center gap-2"
              >
                <MapPinIcon className="h-5 w-5" />
                Use my location
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-white/15" />
                <span className="text-xs text-gray-500 dark:text-white/50 uppercase">or pick on map</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-white/15" />
              </div>

              <MapLocationPicker
                value={mapLocation}
                onChange={handleMapPick}
                showMyLocation={false}
                height="220px"
              />
            </div>

            {selectedFranchise && !showFranchiseList && (() => {
              const selectedStoreStatus = getStoreStatusInfo(selectedFranchise)
              return (
                <div className={`p-3 rounded-xl border ${
                  selectedStoreStatus.isOpen
                    ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20'
                    : 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20'
                }`}>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${
                      selectedStoreStatus.isOpen
                        ? 'text-green-800 dark:text-green-300'
                        : 'text-orange-800 dark:text-orange-300'
                    }`}>
                      Delivering from: {selectedFranchise.name}
                    </p>
                    {selectedStoreStatus.isOpen ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400">
                        <ClockIcon className="w-3 h-3" />
                        Closed
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${
                    selectedStoreStatus.isOpen
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {selectedFranchise.address}
                  </p>
                  <div className={`flex items-center gap-1.5 mt-1 ${
                    selectedStoreStatus.isOpen
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    <ClockIcon className="h-3 w-3" />
                    <p className="text-xs font-medium">
                      {selectedStoreStatus.message}
                    </p>
                  </div>
                </div>
              )
            })()}
          </>
        )}
      </div>
    </div>
  )
}