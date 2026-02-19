import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon, ShoppingBagIcon, ExclamationTriangleIcon, MapPinIcon } from '@heroicons/react/24/outline'
import {
  selectCartItems,
  selectCartTotal,
  selectIsCartOpen,
  selectUpdatingItems,
  selectRemovingItems,
  selectAnyCartOperationLoading,
  updateBackendCartItem,
  removeFromBackendCart,
  closeCart,
} from '../../store/slices/cartSlice'
import { selectSelectedFranchise } from '../../store/slices/franchiseSlice'
import { FREE_DELIVERY_THRESHOLD, DELIVERY_FEE } from '../../data/constants'

// Simple spinner component
const Spinner = ({ size = 'sm', className = '' }) => (
  <svg
    className={`animate-spin ${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

export default function CartDrawer() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items = useSelector(selectCartItems)
  const total = useSelector(selectCartTotal)
  const isOpen = useSelector(selectIsCartOpen)
  const selectedFranchise = useSelector(selectSelectedFranchise)
  const updatingItems = useSelector(selectUpdatingItems)
  const removingItems = useSelector(selectRemovingItems)
  const isCartLoading = useSelector(selectAnyCartOperationLoading)

  const freeDeliveryMin = selectedFranchise?.free_delivery_min ?? FREE_DELIVERY_THRESHOLD
  const deliveryFeeAmount = selectedFranchise?.delivery_fee ?? DELIVERY_FEE

  const deliveryFee = total < freeDeliveryMin ? deliveryFeeAmount : 0
  const finalTotal = total + deliveryFee
  const remainingForFreeDelivery = Math.max(0, freeDeliveryMin - total)
  
  // Check if cart contains age-restricted items
  const hasAgeRestrictedItems = items.some(item => item.is_age_restricted)

  const handleCheckout = () => {
    // Don't navigate if cart operations are in progress
    if (isCartLoading) return
    dispatch(closeCart())
    navigate('/checkout')
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => dispatch(closeCart())}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-[420px] bg-white/95 dark:bg-brand-graphite/95 backdrop-blur-xl border-l border-gray-200 dark:border-white/15 z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/20 bg-white dark:bg-brand-graphite">
            <div>
              <p className="text-sm text-gray-600 dark:text-white/80">Your basket</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-brand-mint to-brand-emerald bg-clip-text text-transparent">GRABBI Cart</h2>
              {selectedFranchise && (
                <p className="text-xs text-gray-500 dark:text-white/60 mt-0.5 flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3" />
                  {selectedFranchise.name}
                </p>
              )}
            </div>
            <button
              onClick={() => dispatch(closeCart())}
              className="p-2 rounded-xl bg-gray-100 dark:bg-white/20 hover:bg-gray-200 dark:hover:bg-white/30 transition-all hover:scale-105"
              aria-label="Close cart"
            >
              <XMarkIcon className="h-6 w-6 text-gray-900 dark:text-white" />
            </button>
          </div>

        {/* Age Restriction Warning */}
        {hasAgeRestrictedItems && (
          <div className="px-5 py-3 border-b border-gray-200 dark:border-white/5 bg-gradient-to-r from-red-500/20 to-red-600/10">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-red-800 dark:text-red-300">Age Verification Required</p>
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  This order contains age-restricted items. You will need to verify your age at checkout.
                </p>
              </div>
            </div>
          </div>
        )}

        {!selectedFranchise && items.length > 0 && (
          <div className="px-5 py-3 border-b border-gray-200 dark:border-white/5 bg-gradient-to-r from-brand-mint/10 to-brand-emerald/5">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-brand-mint flex-shrink-0" />
              <p className="text-xs text-gray-700 dark:text-white/80">
                Set your location for accurate pricing
              </p>
            </div>
          </div>
        )}

        {total < freeDeliveryMin && (
          <div className="px-5 py-4 border-b border-gray-200 dark:border-white/5 bg-gradient-to-r from-brand-emerald/20 to-brand-mint/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-800 dark:text-white/90 font-medium">Add £{remainingForFreeDelivery.toFixed(2)} for free delivery</span>
              <span className="text-xs text-gray-600 dark:text-white/80 font-semibold">{((total / freeDeliveryMin) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-white/12 rounded-full h-2.5 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-brand-mint to-brand-emerald transition-all duration-500"
                style={{ width: `${Math.min((total / freeDeliveryMin) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/15 border border-gray-200 dark:border-white/20 flex items-center justify-center mb-4">
                <ShoppingBagIcon className="h-10 w-10 text-gray-400 dark:text-white" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your cart is empty</p>
              <p className="text-sm text-gray-600 dark:text-white/70 mb-6">Add items to get started</p>
              <button
                onClick={() => {
                  dispatch(closeCart())
                  navigate('/')
                }}
                className="px-6 py-3 rounded-xl button-primary"
              >
                Start shopping
              </button>
            </div>
          ) : (
            items.map((item) => {
              // Get appropriate image URL from images array
              const imageUrl = item.images && item.images.length > 0 
                ? (item.images.find(img => img.is_primary)?.image_url || item.images[0].image_url)
                : item.image || ''
              
              const isUpdating = updatingItems[item.id]
              const isRemoving = removingItems[item.id]
              const isProcessing = isUpdating || isRemoving
              
              return (
                <div 
                  key={item.id} 
                  className={`relative flex items-start space-x-4 rounded-2xl bg-gray-50 dark:bg-white/15 border border-gray-200 dark:border-white/20 p-4 shadow-card hover:shadow-lg transition-all ${
                    isProcessing ? 'opacity-70' : ''
                  }`}
                >
                  {/* Show overlay spinner when removing */}
                  {isRemoving && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-brand-graphite/50 rounded-2xl z-10">
                      <Spinner className="text-brand-mint" />
                    </div>
                  )}
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl border border-gray-200 dark:border-white/15"
                  />
                <div className="flex-1 relative">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{item.name}</h3>
                    <button
                      onClick={() => dispatch(removeFromBackendCart({ 
                        cartItemId: item.cartItemId, 
                        productId: item.id 
                      }))}
                      disabled={isProcessing}
                      className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-600 dark:text-white/80 hover:text-red-600 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      {isRemoving ? (
                        <Spinner className="text-red-500" />
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600 dark:text-white/80">{item.packSize || item.pack_size}</p>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5 text-[10px] mt-1">
                    {(item.is_vegan || item.isVegan) && (
                      <span className="px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium border border-green-200 dark:border-green-700/30">Vegan</span>
                    )}
                    {(item.is_vegetarian || item.isVegetarian) && (
                      <span className="px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium border border-teal-200 dark:border-teal-700/30">Vegetarian</span>
                    )}
                    {(item.is_gluten_free || item.isGlutenFree) && (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-700/30">Gluten Free</span>
                    )}
                  </div>
                  <p className="text-brand-gold font-semibold mt-2">£{item.price.toFixed(2)}</p>
                  <div className="flex items-center space-x-3 mt-3">
                    <button
                      onClick={() => dispatch(updateBackendCartItem({ 
                        cartItemId: item.cartItemId, 
                        productId: item.id,
                        quantity: item.quantity - 1 
                      }))}
                      disabled={isProcessing}
                      className="p-2 rounded-lg bg-gray-200 dark:bg-white/20 hover:bg-gray-300 dark:hover:bg-white/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Decrease quantity"
                    >
                      {isUpdating ? (
                        <Spinner className="text-gray-900 dark:text-white" />
                      ) : (
                        <MinusIcon className="h-4 w-4 text-gray-900 dark:text-white" />
                      )}
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateBackendCartItem({ 
                        cartItemId: item.cartItemId, 
                        productId: item.id,
                        quantity: item.quantity + 1 
                      }))}
                      disabled={isProcessing}
                      className="p-2 rounded-lg bg-gray-200 dark:bg-white/20 hover:bg-gray-300 dark:hover:bg-white/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      {isUpdating ? (
                        <Spinner className="text-gray-900 dark:text-white" />
                      ) : (
                        <PlusIcon className="h-4 w-4 text-gray-900 dark:text-white" />
                      )}
                    </button>
                  </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-gray-200 dark:border-white/15 bg-white dark:bg-brand-graphite/95 space-y-3">
            <div className="flex justify-between text-sm text-gray-600 dark:text-white/80">
              <span>Subtotal</span>
              <span className="text-gray-900 dark:text-white font-medium">£{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-white/80">
              <span>Delivery</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {deliveryFee === 0 ? <span className="text-brand-mint font-semibold">FREE</span> : `£${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-white/15">
              <div>
                <p className="text-sm text-gray-600 dark:text-white/80">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">£{finalTotal.toFixed(2)}</p>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isCartLoading}
                className="px-8 py-3 rounded-xl button-primary font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCartLoading ? (
                  <>
                    <Spinner className="text-brand-graphite" />
                    <span>Updating...</span>
                  </>
                ) : (
                  'Checkout'
                )}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  )
}