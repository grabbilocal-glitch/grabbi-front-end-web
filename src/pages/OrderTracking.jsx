import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircleIcon, ClockIcon, TruckIcon, HomeIcon } from '@heroicons/react/24/outline'

const ORDER_STATUSES = [
  { id: 1, name: 'Order placed', icon: CheckCircleIcon },
  { id: 2, name: 'Preparing', icon: ClockIcon },
  { id: 3, name: 'Dispatched', icon: TruckIcon },
  { id: 4, name: 'Delivered', icon: HomeIcon },
]

export default function OrderTracking() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [currentStatus, setCurrentStatus] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatus((prev) => (prev < ORDER_STATUSES.length ? prev + 1 : prev))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-white/60">Order ID: {orderId}</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live order tracking</h1>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-sm text-brand-mint hover:text-brand-emerald dark:hover:text-white">Back to dashboard</button>
      </div>

      <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 shadow-card">
        <div className="relative flex items-center justify-between">
          <div className="absolute inset-x-6 top-6 h-1 bg-gray-200 dark:bg-white/12">
            <div
              className="h-full bg-gradient-to-r from-brand-mint to-brand-emerald transition-all"
              style={{ width: `${((currentStatus - 1) / (ORDER_STATUSES.length - 1)) * 100}%` }}
            />
          </div>
          {ORDER_STATUSES.map((status) => {
            const Icon = status.icon
            const active = status.id <= currentStatus
            return (
              <div key={status.id} className="relative flex flex-col items-center flex-1">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center border-2 ${
                    active ? 'bg-brand-mint text-brand-graphite border-brand-mint shadow-glow' : 'border-gray-300 dark:border-white/30 text-gray-500 dark:text-white/60 bg-gray-50 dark:bg-white/8'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span className={`mt-2 text-sm text-center ${active ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500 dark:text-white/60'}`}>
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
          <div className="flex justify-between text-sm text-gray-700 dark:text-white/70"><span>Total</span><span className="text-gray-900 dark:text-white">£45.99</span></div>
          <div className="flex justify-between text-sm text-gray-700 dark:text-white/70"><span>Delivery fee</span><span className="text-brand-mint">FREE</span></div>
          <div className="flex justify-between text-sm text-gray-700 dark:text-white/70"><span>Payment</span><span className="text-gray-900 dark:text-white">Card • 1234</span></div>
          <div className="flex justify-between text-sm text-gray-700 dark:text-white/70"><span>ETA</span><span className="text-gray-900 dark:text-white">~2 hours</span></div>
        </div>
        <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 shadow-card">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delivery address</h3>
          <p className="text-gray-700 dark:text-white/70 text-sm">
            123 Main Street<br />London SW1A 1AA<br />United Kingdom
          </p>
        </div>
      </div>

      <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 shadow-card">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Map preview</h3>
        <div className="w-full h-64 rounded-2xl bg-gray-50 dark:bg-white/8 border border-gray-200 dark:border-white/15 flex items-center justify-center text-gray-600 dark:text-white/60">
          Map view (Google Maps) will render here.
        </div>
      </div>
    </div>
  )
}
