import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircleIcon, ClockIcon, TruckIcon, HomeIcon } from '@heroicons/react/24/outline'
import { orderService } from '../services/orderService'
import MapLocationPicker from '../components/Map/MapLocationPicker'

const ORDER_STATUSES = [
  { id: 1, name: 'Order placed', icon: CheckCircleIcon, key: 'pending' },
  { id: 2, name: 'Preparing', icon: ClockIcon, key: 'processing' },
  { id: 3, name: 'Dispatched', icon: TruckIcon, key: 'dispatched' },
  { id: 4, name: 'Delivered', icon: HomeIcon, key: 'delivered' },
]

function getStatusStep(status) {
  const statusMap = {
    pending: 1,
    processing: 2,
    preparing: 2,
    dispatched: 3,
    shipped: 3,
    delivered: 4,
    completed: 4,
  }
  return statusMap[(status || '').toLowerCase()] || 1
}

export default function OrderTracking() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentStatus, setCurrentStatus] = useState(1)

  const fetchOrder = async (cancelled) => {
    try {
      const data = await orderService.getOrder(orderId)
      if (cancelled) return
      setOrder(data)
      setCurrentStatus(getStatusStep(data.status))
      setError(null)
    } catch (err) {
      if (cancelled) return
      setError(err.response?.data?.error || 'Failed to load order details')
    } finally {
      if (!cancelled) setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    fetchOrder(cancelled)

    // Poll every 30 seconds for status updates
    const interval = setInterval(() => {
      fetchOrder(cancelled)
    }, 30000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-brand-mint border-t-transparent rounded-full mx-auto mb-2" />
        <div className="text-lg text-gray-600 dark:text-white/80">Loading order details...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 text-gray-600 dark:text-white/70">
        <p className="text-xl mb-4">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-xl button-primary">Back to dashboard</button>
      </div>
    )
  }

  const orderTotal = order?.total?.toFixed(2) || '0.00'
  const deliveryFee = order?.delivery_fee
  const deliveryAddress = order?.delivery_address || 'Not provided'
  const paymentMethod = order?.payment_method || 'Card'

  // Map location values
  const franchiseLat = order?.franchise?.latitude || order?.franchise_lat
  const franchiseLng = order?.franchise?.longitude || order?.franchise_lng
  const customerLat = order?.customer_lat
  const customerLng = order?.customer_lng
  const hasMapCoords = (franchiseLat && franchiseLng) || (customerLat && customerLng)
  const mapCenter = {
    lat: customerLat || franchiseLat || null,
    lng: customerLng || franchiseLng || null,
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-white/60">Order ID: {order?.order_number || orderId}</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live order tracking</h1>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-sm text-brand-mint hover:text-brand-emerald dark:hover:text-white">Back to dashboard</button>
      </div>

      <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 shadow-card">
        <div className="relative flex items-center justify-between">
          <div className="absolute inset-x-6 top-6 h-1 bg-gray-200 dark:bg-white/8 z-0">
            <div
              className="h-full bg-gradient-to-r from-brand-mint to-brand-emerald transition-all"
              style={{ width: `${((currentStatus - 1) / (ORDER_STATUSES.length - 1)) * 100}%` }}
            />
          </div>

          {ORDER_STATUSES.map((status) => {
            const Icon = status.icon
            const active = status.id <= currentStatus
            return (
              <div key={status.id} className="relative flex flex-col items-center flex-1 z-10">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center border-2 ${
                    active
                      ? 'bg-brand-mint text-brand-graphite border-brand-mint shadow-glow'
                      : 'border-gray-300 dark:border-white/40 text-gray-500 dark:text-white bg-gray-50 dark:bg-gray-600'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span className={`mt-2 text-sm text-center ${active ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500 dark:text-white/80'}`}>
                  {status.name}
                </span>
                {status.id === currentStatus && <span className="text-[11px] text-brand-mint mt-1">In progress</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 shadow-card space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order details</h3>
          <div className="flex justify-between text-sm text-gray-700 dark:text-white/70"><span>Total</span><span className="text-gray-900 dark:text-white">{'\u00A3'}{orderTotal}</span></div>
          <div className="flex justify-between text-sm text-gray-700 dark:text-white/70"><span>Delivery fee</span><span className={deliveryFee === 0 ? 'text-brand-mint' : 'text-gray-900 dark:text-white'}>{deliveryFee === 0 ? 'FREE' : `\u00A3${deliveryFee?.toFixed(2) || '0.00'}`}</span></div>
          <div className="flex justify-between text-sm text-gray-700 dark:text-white/70"><span>Payment</span><span className="text-gray-900 dark:text-white">{paymentMethod}</span></div>
          <div className="flex justify-between text-sm text-gray-700 dark:text-white/70"><span>ETA</span><span className="text-gray-900 dark:text-white">{order?.estimated_delivery || '~2 hours'}</span></div>
        </div>
        <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 shadow-card">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delivery address</h3>
          <p className="text-gray-700 dark:text-white/70 text-sm">
            {deliveryAddress}
          </p>
        </div>
      </div>

      <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/20 p-6 shadow-card">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Map preview</h3>
        {hasMapCoords ? (
          <MapLocationPicker
            value={mapCenter}
            onChange={() => {}}
            showMyLocation={false}
            height="300px"
          />
        ) : (
          <div className="w-full h-64 rounded-2xl bg-gray-50 dark:bg-white/15 border border-gray-200 dark:border-white/20 flex items-center justify-center text-gray-600 dark:text-white/80">
            Map location not available for this order.
          </div>
        )}
      </div>
    </div>
  )
}
