import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  UserIcon,
  StarIcon,
  MapPinIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { logout, selectUser, selectIsAuthenticated } from '../store/slices/authSlice'
import { selectPoints, selectCustomerId, selectLoyaltyHistory } from '../store/slices/loyaltySlice'
import { api } from '../utils/api'
import QRCode from 'react-qr-code'

export default function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const points = useSelector(selectPoints)
  const customerId = useSelector(selectCustomerId)
  const history = useSelector(selectLoyaltyHistory)
  const [activeTab, setActiveTab] = useState('club-card')
  const [notifications, setNotifications] = useState({ email: true, sms: true })
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const savedAddresses = [
    { id: 1, label: 'Home', address: '123 Main Street, London, SW1A 1AA', isDefault: true },
    { id: 2, label: 'Work', address: '456 Business Ave, London, EC1A 1BB', isDefault: false },
  ]

  useEffect(() => {
    if (isAuthenticated && activeTab === 'orders') {
      fetchOrders()
    }
  }, [isAuthenticated, activeTab])

  const fetchOrders = async () => {
    setLoadingOrders(true)
    try {
      const response = await api.get('/orders')
      setOrders(response.data || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      setOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 text-gray-600 dark:text-white/70">
        <p className="text-xl mb-4">Please log in to view your dashboard</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl button-primary">Go home</button>
      </div>
    )
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-white/60">Welcome back</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hi, {user?.firstName}</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-5 flex items-center space-x-4 shadow-card">
          <div className="h-12 w-12 rounded-2xl bg-brand-emerald/20 border border-brand-emerald/30 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-brand-mint" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-white/60">Member</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
          </div>
        </div>
        <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-5 flex items-center space-x-4 shadow-card">
          <div className="h-12 w-12 rounded-2xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
            <StarIcon className="h-6 w-6 text-brand-gold" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-white/60">Loyalty points</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{points}</p>
          </div>
        </div>
        <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-5 flex items-center justify-between shadow-card">
          <div>
            <p className="text-sm text-gray-600 dark:text-white/60">Club card ID</p>
            <p className="text-lg font-mono text-gray-900 dark:text-white">{customerId || 'Not assigned'}</p>
          </div>
          <button onClick={() => navigate('/order/ORD123456')} className="px-4 py-2 rounded-xl button-ghost text-sm">Track order</button>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-gray-200 dark:border-white/15">
        {[
          { key: 'club-card', label: 'Club card' },
          { key: 'orders', label: 'My orders' },
          { key: 'settings', label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-3 text-sm font-semibold ${
              activeTab === tab.key ? 'text-brand-mint border-b-2 border-brand-mint' : 'text-gray-600 dark:text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'club-card' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Club card</h3>
            <p className="text-gray-700 dark:text-white/70 text-sm">Show this QR in-store to earn points.</p>
            <div className="flex items-center space-x-6">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/8 border border-gray-200 dark:border-white/15">
                {customerId ? <QRCode value={customerId} size={160} /> : <div className="w-[160px] h-[160px] bg-gray-100 dark:bg-white/8" />}
              </div>
              <div className="space-y-3 text-sm text-gray-700 dark:text-white/70">
                <div>
                  <p className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide">Customer ID</p>
                  <p className="text-gray-900 dark:text-white font-mono">{customerId || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-white/50 text-xs uppercase tracking-wide">Points</p>
                  <p className="text-xl font-bold text-brand-mint">{points}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-3 shadow-card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Points history</h3>
            {history.length === 0 ? (
              <p className="text-gray-600 dark:text-white/60 text-sm">No history yet.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {history.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/8 border border-gray-200 dark:border-white/15">
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold text-sm">{txn.description}</p>
                      <p className="text-gray-500 dark:text-white/50 text-xs">{new Date(txn.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-bold ${txn.type === 'earned' ? 'text-brand-mint' : 'text-red-600 dark:text-red-200'}`}>
                      {txn.type === 'earned' ? '+' : '-'}{txn.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-card">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">My orders</h3>
          {loadingOrders ? (
            <div className="text-center py-8 text-gray-600 dark:text-white/60">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-white/60">
              <p className="mb-2">No orders yet</p>
              <button onClick={() => navigate('/')} className="px-4 py-2 rounded-xl button-primary text-sm">Start Shopping</button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-white/8 border border-gray-200 dark:border-white/15 flex items-center justify-between hover:-translate-y-1 transition cursor-pointer"
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  <div>
                    <p className="text-gray-900 dark:text-white font-semibold">Order #{order.order_number || order.id.substring(0, 8)}</p>
                    <p className="text-gray-600 dark:text-white/60 text-sm">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 dark:text-white font-bold">£{order.total?.toFixed(2) || '0.00'}</p>
                    <p className={`text-sm ${
                      order.status === 'delivered' ? 'text-green-600 dark:text-green-300' :
                      order.status === 'pending' ? 'text-yellow-600 dark:text-yellow-300' :
                      order.status === 'processing' ? 'text-blue-600 dark:text-blue-300' :
                      'text-gray-600 dark:text-white/60'
                    }`}>
                      {order.status || 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Saved addresses</h3>
            <div className="space-y-3">
              {savedAddresses.map((address) => (
                <div key={address.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/8 border border-gray-200 dark:border-white/15 flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-gray-600 dark:text-white/60 mt-1" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold">{address.label}</p>
                      <p className="text-gray-600 dark:text-white/60 text-sm">{address.address}</p>
                      {address.isDefault && <span className="text-xs text-brand-mint font-semibold">Default</span>}
                    </div>
                  </div>
                  <div className="space-x-2 text-sm text-gray-600 dark:text-white/70">
                    <button className="hover:text-gray-900 dark:hover:text-white">Edit</button>
                    <button className="hover:text-red-600 dark:hover:text-red-200">Delete</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-2 px-4 py-3 rounded-xl button-ghost text-sm">+ Add new address</button>
          </div>

          <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h3>
            <div className="space-y-3">
              {[
                { key: 'email', label: 'Email notifications', description: 'Order updates via email' },
                { key: 'sms', label: 'SMS notifications', description: 'Order updates via SMS' },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/8 border border-gray-200 dark:border-white/15">
                  <div className="flex items-center space-x-3">
                    <BellIcon className="h-5 w-5 text-gray-600 dark:text-white/60" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold text-sm">{n.label}</p>
                      <p className="text-gray-500 dark:text-white/50 text-xs">{n.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[n.key]}
                      onChange={(e) => setNotifications((prev) => ({ ...prev, [n.key]: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-white/12 rounded-full peer peer-checked:bg-brand-mint after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
