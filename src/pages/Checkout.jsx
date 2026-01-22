import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectCartItems, selectCartTotal, clearCart } from '../store/slices/cartSlice'
import { selectIsAuthenticated } from '../store/slices/authSlice'
import { addPoints } from '../store/slices/loyaltySlice'
import { FREE_DELIVERY_THRESHOLD, DELIVERY_FEE, STORE_COORDINATES, DELIVERY_RADIUS_MILES } from '../data/mockData'

const steps = ['Address', 'Payment', 'Done']

export default function Checkout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const subtotal = useSelector(selectCartTotal)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [step, setStep] = useState(1)
  const [address, setAddress] = useState('')
  const [distanceValid, setDistanceValid] = useState(null)
  const [paymentData, setPaymentData] = useState({ cardNumber: '', expiryDate: '', cvv: '', cardName: '' })
  const [promoCode, setPromoCode] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderId] = useState(`ORD${Date.now()}`)

  const deliveryFee = subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0
  const finalTotal = subtotal + deliveryFee

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const handleAddressSelect = () => {
    const mockLat = STORE_COORDINATES.lat + (Math.random() - 0.5) * 0.1
    const mockLng = STORE_COORDINATES.lng + (Math.random() - 0.5) * 0.1
    const distance = calculateDistance(STORE_COORDINATES.lat, STORE_COORDINATES.lng, mockLat, mockLng)
    setDistanceValid(distance <= DELIVERY_RADIUS_MILES)
  }

  const handleStep1Next = () => {
    if (!address.trim()) {
      alert('Please enter an address')
      return
    }
    handleAddressSelect()
    setTimeout(() => {
      if (distanceValid === false) return
      setStep(2)
    }, 150)
  }

  const handlePayment = () => {
    const pointsEarned = Math.floor(subtotal)
    if (!isAuthenticated) {
      setShowSuccessModal(true)
    } else {
      dispatch(addPoints({ amount: pointsEarned, description: 'Order points' }))
      dispatch(clearCart())
      navigate(`/order/${orderId}`)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-gray-600 dark:text-white/70">
        <p className="text-xl mb-4">Your cart is empty</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl button-primary">Start shopping</button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-white/60 uppercase tracking-wide">Checkout</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Complete your order</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {steps.map((label, idx) => {
          const active = step >= idx + 1
          return (
            <div key={label} className="flex items-center space-x-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                  active ? 'bg-brand-mint text-brand-graphite border-brand-mint shadow-glow' : 'border-gray-300 dark:border-white/30 text-gray-500 dark:text-white/60'
                }`}
              >
                {idx + 1}
              </div>
              <span className={`text-sm ${active ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500 dark:text-white/60'}`}>{label}</span>
              {idx < steps.length - 1 && <div className="w-10 h-px bg-gray-200 dark:bg-white/18" />}
            </div>
          )
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {step === 1 && (
            <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delivery address</h3>
                <span className="text-xs text-gray-600 dark:text-white/60">Within 5 miles</span>
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Search your address (Google Places)"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/50"
              />
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/8 border border-gray-200 dark:border-white/15">
                <p className="text-sm text-gray-600 dark:text-white/70">Delivery slot</p>
                <p className="text-gray-900 dark:text-white font-semibold">Standard delivery • ~2 hours</p>
              </div>
              {distanceValid === false && (
                <div className="p-4 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-100 text-sm">
                  Sorry, we only deliver within 5 miles of our store.
                </div>
              )}
              {distanceValid === true && (
                <div className="p-4 rounded-xl bg-green-100 dark:bg-green-500/10 border border-green-300 dark:border-green-500/30 text-green-800 dark:text-green-100 text-sm">
                  Address validated! You are within delivery range.
                </div>
              )}
              <button onClick={handleStep1Next} className="w-full py-3 rounded-xl button-primary text-brand-graphite font-semibold">
                Continue to payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-card">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600 dark:text-white/60">Card number</label>
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData((p) => ({ ...p, cardNumber: e.target.value }))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-white/60">Expiry</label>
                  <input
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData((p) => ({ ...p, expiryDate: e.target.value }))}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-white/60">CVV</label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData((p) => ({ ...p, cvv: e.target.value }))}
                    placeholder="123"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600 dark:text-white/60">Cardholder name</label>
                  <input
                    type="text"
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData((p) => ({ ...p, cardName: e.target.value }))}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-600 dark:text-white/60">Promo code</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                  />
                  <button className="px-4 rounded-xl bg-gray-100 dark:bg-white/12 border border-gray-200 dark:border-white/15 text-gray-700 dark:text-white/80">Apply</button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl button-ghost">Back</button>
                <button onClick={handlePayment} className="flex-1 py-3 rounded-xl button-primary text-brand-graphite font-semibold">
                  Complete order
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-1">
          <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-3 shadow-card sticky top-28">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order summary</h3>
              <span className="text-xs text-gray-600 dark:text-white/60">{items.length} items</span>
            </div>
            <div className="space-y-2 text-sm text-gray-700 dark:text-white/80 max-h-60 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="line-clamp-1">{item.name} x{item.quantity}</span>
                  <span>£{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-white/15 space-y-2 text-gray-700 dark:text-white/80 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{deliveryFee === 0 ? <span className="text-brand-mint">FREE</span> : `£${deliveryFee.toFixed(2)}`}</span></div>
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-white/15"><span>Total</span><span>£{finalTotal.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 dark:bg-black/70" />
          <div className="relative w-full max-w-md rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-glow">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">You earned 50 points! 🎉</h3>
            <p className="text-gray-700 dark:text-white/70">Set a password now to save them.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  dispatch(clearCart())
                  navigate(`/order/${orderId}`)
                }}
                className="flex-1 py-3 rounded-xl button-ghost"
              >
                Continue as guest
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  navigate('/dashboard')
                }}
                className="flex-1 py-3 rounded-xl button-primary text-brand-graphite font-semibold"
              >
                Create account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
