import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import {
  selectCartItems,
  selectCartTotal,
  selectIsCartOpen,
  updateQuantity,
  removeItem,
  closeCart,
} from '../../store/slices/cartSlice'
import { FREE_DELIVERY_THRESHOLD, DELIVERY_FEE } from '../../data/mockData'

export default function CartDrawer() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items = useSelector(selectCartItems)
  const total = useSelector(selectCartTotal)
  const isOpen = useSelector(selectIsCartOpen)

  const deliveryFee = total < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0
  const finalTotal = total + deliveryFee
  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - total)

  const handleCheckout = () => {
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
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/15 bg-white/80 dark:bg-white/8">
            <div>
              <p className="text-sm text-gray-600 dark:text-white/80">Your basket</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">GRABBI Cart</h2>
            </div>
            <button
              onClick={() => dispatch(closeCart())}
              className="p-2 rounded-xl bg-gray-100 dark:bg-white/12 hover:bg-gray-200 dark:hover:bg-white/15 transition-all hover:scale-105"
              aria-label="Close cart"
            >
              <XMarkIcon className="h-6 w-6 text-gray-900 dark:text-white" />
            </button>
          </div>

        {total < FREE_DELIVERY_THRESHOLD && (
          <div className="px-5 py-4 border-b border-gray-200 dark:border-white/5 bg-gradient-to-r from-brand-emerald/20 to-brand-mint/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-800 dark:text-white/90 font-medium">Add £{remainingForFreeDelivery.toFixed(2)} for free delivery</span>
              <span className="text-xs text-gray-600 dark:text-white/80 font-semibold">{((total / FREE_DELIVERY_THRESHOLD) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-white/12 rounded-full h-2.5 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-brand-mint to-brand-emerald transition-all duration-500"
                style={{ width: `${Math.min((total / FREE_DELIVERY_THRESHOLD) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/8 flex items-center justify-center mb-4">
                <ShoppingBagIcon className="h-10 w-10 text-gray-400 dark:text-white/60" />
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
            items.map((item) => (
              <div key={item.id} className="flex items-start space-x-4 rounded-2xl bg-gray-50 dark:bg-white/8 border border-gray-200 dark:border-white/15 p-4 shadow-card hover:shadow-lg transition-shadow">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200 dark:border-white/15"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{item.name}</h3>
                    <button
                      onClick={() => dispatch(removeItem(item.id))}
                      className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-white/60 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-white/80">{item.packSize}</p>
                  <p className="text-brand-gold font-semibold">£{item.price.toFixed(2)}</p>
                  <div className="flex items-center space-x-3 mt-3">
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                      className="p-2 rounded-lg bg-gray-200 dark:bg-white/12 hover:bg-gray-300 dark:hover:bg-white/15 transition-all hover:scale-105 active:scale-95"
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon className="h-4 w-4 text-gray-900 dark:text-white" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                      className="p-2 rounded-lg bg-gray-200 dark:bg-white/12 hover:bg-gray-300 dark:hover:bg-white/15 transition-all hover:scale-105 active:scale-95"
                      aria-label="Increase quantity"
                    >
                      <PlusIcon className="h-4 w-4 text-gray-900 dark:text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))
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
                className="px-8 py-3 rounded-xl button-primary font-semibold"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  )
}
