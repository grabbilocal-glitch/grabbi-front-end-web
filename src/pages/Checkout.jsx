import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectCartItems, selectCartTotal, clearCart } from '../store/slices/cartSlice'
import { selectIsAuthenticated } from '../store/slices/authSlice'
import { selectSelectedFranchise, selectCustomerLocation, setCustomerLocation } from '../store/slices/franchiseSlice'
import { addPoints } from '../store/slices/loyaltySlice'
import { FREE_DELIVERY_THRESHOLD, DELIVERY_FEE } from '../data/constants'
import { orderService } from '../services/orderService'
import { api } from '../utils/api'
import Toast from '../components/UI/Toast'
import MapLocationPicker from '../components/Map/MapLocationPicker'

function getDistanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8 // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const steps = ['Address', 'Payment', 'Done']

export default function Checkout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const subtotal = useSelector(selectCartTotal)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const selectedFranchise = useSelector(selectSelectedFranchise)
  const customerLocation = useSelector(selectCustomerLocation)

  const [step, setStep] = useState(1)
  const [address, setAddress] = useState('')
  const [mapValue, setMapValue] = useState({
    lat: customerLocation?.lat || null,
    lng: customerLocation?.lng || null,
  })
  const [distanceValid, setDistanceValid] = useState(null)
  const [paymentData, setPaymentData] = useState({ cardNumber: '', expiryDate: '', cvv: '', cardName: '' })
  const [paymentErrors, setPaymentErrors] = useState({})
  const [promoCode, setPromoCode] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderId, setOrderId] = useState(`ORD${Date.now()}`)
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Issue 10: Redirect to home if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/', { replace: true })
    }
  }, [items.length, navigate])

  // Use franchise delivery settings when available, otherwise use defaults
  const freeDeliveryMin = selectedFranchise?.free_delivery_min ?? FREE_DELIVERY_THRESHOLD
  const deliveryFeeAmount = selectedFranchise?.delivery_fee ?? DELIVERY_FEE
  const deliveryRadius = selectedFranchise?.delivery_radius ?? 5

  const deliveryFee = subtotal < freeDeliveryMin ? deliveryFeeAmount : 0
  const finalTotal = subtotal + deliveryFee

  const validateDistance = () => {
    if (
      selectedFranchise?.latitude &&
      selectedFranchise?.longitude &&
      customerLocation?.lat &&
      customerLocation?.lng
    ) {
      const distMiles = getDistanceMiles(
        customerLocation.lat,
        customerLocation.lng,
        selectedFranchise.latitude,
        selectedFranchise.longitude
      )
      return distMiles <= deliveryRadius
    }
    // Franchise was already validated during store selection, or no coords available
    return true
  }

  // Issue 9: Fix race condition by making this synchronous
  const handleStep1Next = () => {
    if (!address.trim()) {
      setToast({ type: 'error', message: 'Please enter an address' })
      return
    }
    const isValid = validateDistance()
    setDistanceValid(isValid)
    if (!isValid) return
    setStep(2)
  }

  // Issue 23: Validate payment form
  const validatePayment = () => {
    const errors = {}
    const cardDigits = paymentData.cardNumber.replace(/\s/g, '')
    if (!/^\d{16}$/.test(cardDigits)) {
      errors.cardNumber = 'Card number must be 16 digits'
    }
    if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      errors.expiryDate = 'Expiry must be MM/YY format'
    }
    if (!/^\d{3}$/.test(paymentData.cvv)) {
      errors.cvv = 'CVV must be 3 digits'
    }
    if (!paymentData.cardName.trim()) {
      errors.cardName = 'Cardholder name is required'
    }
    setPaymentErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePayment = async () => {
    if (!validatePayment()) return

    setSubmitting(true)
    try {
      const orderPayload = {
        franchise_id: selectedFranchise?.id,
        customer_lat: customerLocation?.lat,
        customer_lng: customerLocation?.lng,
        delivery_address: address,
        items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      }

      const result = await orderService.createOrder(orderPayload)
      const newOrderId = result?.order?.id || result?.id || orderId
      setOrderId(newOrderId)

      const pointsEarned = Math.floor(subtotal)
      if (!isAuthenticated) {
        setShowSuccessModal(true)
      } else {
        dispatch(addPoints({ amount: pointsEarned, description: 'Order points' }))
        dispatch(clearCart())
        navigate(`/order/${newOrderId}`)
      }
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to place order. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  // Issue 11: Promo code handler
  const handlePromoApply = async () => {
    if (!promoCode.trim()) {
      setToast({ type: 'error', message: 'Please enter a promo code' })
      return
    }
    try {
      const response = await api.post('/promo-codes/validate', { code: promoCode })
      setToast({ type: 'success', message: response.data.message || `Promo code "${promoCode}" applied!` })
    } catch (error) {
      if (error.response?.status === 404) {
        setToast({ type: 'info', message: 'Promo codes not available yet' })
      } else {
        setToast({ type: 'error', message: error.response?.data?.error || 'Invalid promo code' })
      }
    }
  }

  // If cart becomes empty (e.g. cleared externally), don't render
  if (items.length === 0) {
    return null
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
                <span className="text-xs text-gray-600 dark:text-white/60">Within {deliveryRadius} miles</span>
              </div>
              <MapLocationPicker
                value={mapValue}
                onChange={({ lat, lng, address: addr }) => {
                  setMapValue({ lat, lng, address: addr })
                  setAddress(addr || '')
                  dispatch(setCustomerLocation({ lat, lng }))
                }}
                showMyLocation
                height="200px"
              />
              <div>
                <label htmlFor="checkout-address" className="text-sm text-gray-600 dark:text-white/60">Delivery address</label>
                <input
                  id="checkout-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your delivery address"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/50"
                />
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/15 border border-gray-200 dark:border-white/20">
                <p className="text-sm text-gray-600 dark:text-white/80">Delivery slot</p>
                <p className="text-gray-900 dark:text-white font-semibold">Standard delivery - ~2 hours</p>
              </div>
              {distanceValid === false && (
                <div className="p-4 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-100 text-sm">
                  Sorry, we only deliver within {deliveryRadius} miles of our store.
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

              {/* Issue 23: Demo mode banner */}
              <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-300 dark:border-yellow-500/30 text-yellow-800 dark:text-yellow-100 text-sm font-medium">
                Demo mode -- no real payment will be processed
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="checkout-cardNumber" className="text-sm text-gray-600 dark:text-white/60">Card number</label>
                  <input
                    id="checkout-cardNumber"
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData((p) => ({ ...p, cardNumber: e.target.value }))}
                    placeholder="1234 5678 9012 3456"
                    required
                    maxLength={19}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                  />
                  {paymentErrors.cardNumber && <p className="text-xs text-red-600 dark:text-red-300 mt-1">{paymentErrors.cardNumber}</p>}
                </div>
                <div>
                  <label htmlFor="checkout-expiry" className="text-sm text-gray-600 dark:text-white/60">Expiry</label>
                  <input
                    id="checkout-expiry"
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData((p) => ({ ...p, expiryDate: e.target.value }))}
                    placeholder="MM/YY"
                    required
                    maxLength={5}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                  />
                  {paymentErrors.expiryDate && <p className="text-xs text-red-600 dark:text-red-300 mt-1">{paymentErrors.expiryDate}</p>}
                </div>
                <div>
                  <label htmlFor="checkout-cvv" className="text-sm text-gray-600 dark:text-white/60">CVV</label>
                  <input
                    id="checkout-cvv"
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData((p) => ({ ...p, cvv: e.target.value }))}
                    placeholder="123"
                    required
                    maxLength={3}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                  />
                  {paymentErrors.cvv && <p className="text-xs text-red-600 dark:text-red-300 mt-1">{paymentErrors.cvv}</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="checkout-cardName" className="text-sm text-gray-600 dark:text-white/60">Cardholder name</label>
                  <input
                    id="checkout-cardName"
                    type="text"
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData((p) => ({ ...p, cardName: e.target.value }))}
                    placeholder="Jane Doe"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                  />
                  {paymentErrors.cardName && <p className="text-xs text-red-600 dark:text-red-300 mt-1">{paymentErrors.cardName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="checkout-promo" className="text-sm text-gray-600 dark:text-white/60">Promo code</label>
                <div className="flex space-x-2">
                  <input
                    id="checkout-promo"
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handlePromoApply}
                    className="px-4 rounded-xl bg-gray-100 dark:bg-white/20 border border-gray-200 dark:border-white/25 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/30 transition-all hover:scale-105 active:scale-95"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl button-ghost">Back</button>
                <button onClick={handlePayment} disabled={submitting} className="flex-1 py-3 rounded-xl button-primary text-brand-graphite font-semibold disabled:opacity-50">
                  {submitting ? 'Processing...' : 'Complete order'}
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
            <div className="space-y-3 text-sm text-gray-700 dark:text-white/80 max-h-60 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className="line-clamp-1">{item.name} x{item.quantity}</span>
                    <div className="flex items-center flex-wrap gap-1 mt-1">
                      {(item.is_vegan || item.isVegan) && (
                        <span className="px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium border border-green-200 dark:border-green-700/30 text-[10px]">Vegan</span>
                      )}
                      {(item.is_vegetarian || item.isVegetarian) && (
                        <span className="px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium border border-teal-200 dark:border-teal-700/30 text-[10px]">Vegetarian</span>
                      )}
                      {(item.is_gluten_free || item.isGlutenFree) && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-700/30 text-[10px]">Gluten Free</span>
                      )}
                    </div>
                  </div>
                  <span>{'\u00A3'}{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-white/15 space-y-2 text-gray-700 dark:text-white/80 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{'\u00A3'}{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{deliveryFee === 0 ? <span className="text-brand-mint">FREE</span> : `\u00A3${deliveryFee.toFixed(2)}`}</span></div>
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-white/15"><span>Total</span><span>{'\u00A3'}{finalTotal.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 dark:bg-black/70" />
          <div className="relative w-full max-w-md rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-glow">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">You earned 50 points!</h3>
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

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
