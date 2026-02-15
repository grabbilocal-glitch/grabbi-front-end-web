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
import { logout, selectUser, selectIsAuthenticated, setUser } from '../store/slices/authSlice'
import { selectPoints, selectCustomerId, selectLoyaltyHistory, setPoints, setHistory } from '../store/slices/loyaltySlice'
import { api } from '../utils/api'
import Toast from '../components/UI/Toast'
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
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('grabbi_notifications')
      return saved ? JSON.parse(saved) : { email: true, sms: true }
    } catch {
      return { email: true, sms: true }
    }
  })
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [latestOrderId, setLatestOrderId] = useState(null)
  const [toast, setToast] = useState(null)

  // Profile state
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

  // Loyalty state
  const [redeemAmount, setRedeemAmount] = useState('')
  const [redeemSaving, setRedeemSaving] = useState(false)
  const [loyaltyHistory, setLoyaltyHistory] = useState([])
  const [loadingLoyalty, setLoadingLoyalty] = useState(false)

  // Cancelling order state
  const [cancellingOrderId, setCancellingOrderId] = useState(null)

  useEffect(() => {
    if (user) {
      setProfileName(`${user.firstName || ''} ${user.lastName || ''}`.trim())
      setProfilePhone(user.phone || '')
    }
  }, [user])

  useEffect(() => {
    let cancelled = false
    if (isAuthenticated && activeTab === 'orders') {
      fetchOrders(cancelled)
    }
    return () => { cancelled = true }
  }, [isAuthenticated, activeTab])

  // Fetch loyalty history when tab is active
  useEffect(() => {
    let cancelled = false
    if (isAuthenticated && activeTab === 'loyalty') {
      fetchLoyaltyHistory(cancelled)
    }
    return () => { cancelled = true }
  }, [isAuthenticated, activeTab])

  // Fetch latest order for Track order button
  useEffect(() => {
    let cancelled = false
    if (isAuthenticated) {
      const fetchLatest = async () => {
        try {
          const response = await api.get('/orders')
          if (cancelled) return
          const allOrders = response.data || []
          if (allOrders.length > 0) {
            setLatestOrderId(allOrders[0].id)
          }
        } catch {
          // silently ignore
        }
      }
      fetchLatest()
    }
    return () => { cancelled = true }
  }, [isAuthenticated])

  const fetchOrders = async (cancelled) => {
    setLoadingOrders(true)
    try {
      const response = await api.get('/orders')
      if (cancelled) return
      setOrders(response.data || [])
    } catch {
      if (cancelled) return
      setOrders([])
    } finally {
      if (!cancelled) setLoadingOrders(false)
    }
  }

  const fetchLoyaltyHistory = async (cancelled) => {
    setLoadingLoyalty(true)
    try {
      const response = await api.get('/auth/loyalty-history')
      if (cancelled) return
      setLoyaltyHistory(response.data || [])
    } catch {
      if (cancelled) return
      setLoyaltyHistory([])
    } finally {
      if (!cancelled) setLoadingLoyalty(false)
    }
  }

  const handleCancelOrder = async (orderId, e) => {
    e.stopPropagation()
    setCancellingOrderId(orderId)
    try {
      await api.put(`/orders/${orderId}/status`, { status: 'cancelled' })
      setToast({ type: 'success', message: 'Order cancelled successfully' })
      // Refresh orders
      fetchOrders(false)
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to cancel order' })
    } finally {
      setCancellingOrderId(null)
    }
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    try {
      const response = await api.put('/auth/profile', {
        name: profileName,
        phone: profilePhone,
      })
      const updatedUser = response.data.user || response.data
      const nameParts = (updatedUser.name || profileName).split(' ')
      dispatch(setUser({
        ...user,
        ...updatedUser,
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: updatedUser.phone || profilePhone,
      }))
      setToast({ type: 'success', message: 'Profile updated successfully' })
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to update profile' })
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmNewPassword) {
      setToast({ type: 'error', message: 'New passwords do not match' })
      return
    }
    if (newPassword.length < 8) {
      setToast({ type: 'error', message: 'Password must be at least 8 characters' })
      return
    }
    setPasswordSaving(true)
    try {
      await api.put('/auth/password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      setToast({ type: 'success', message: 'Password changed successfully' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to change password' })
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleRedeemPoints = async (e) => {
    e.preventDefault()
    const amount = parseInt(redeemAmount, 10)
    if (!amount || amount <= 0) {
      setToast({ type: 'error', message: 'Please enter a valid amount' })
      return
    }
    if (amount > points) {
      setToast({ type: 'error', message: 'Not enough points' })
      return
    }
    setRedeemSaving(true)
    try {
      const response = await api.post('/auth/redeem-points', { points: amount })
      setToast({ type: 'success', message: response.data.message || `Redeemed ${amount} points!` })
      if (response.data.remaining_points !== undefined) {
        dispatch(setPoints(response.data.remaining_points))
      }
      setRedeemAmount('')
      // Refresh loyalty history
      fetchLoyaltyHistory(false)
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to redeem points' })
    } finally {
      setRedeemSaving(false)
    }
  }

  // Persist notification preferences
  const handleNotificationChange = (key, checked) => {
    const updated = { ...notifications, [key]: checked }
    setNotifications(updated)
    try {
      localStorage.setItem('grabbi_notifications', JSON.stringify(updated))
    } catch {
      // localStorage may not be available
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
          {latestOrderId ? (
            <button onClick={() => navigate(`/order/${latestOrderId}`)} className="px-4 py-2 rounded-xl button-ghost text-sm">Track order</button>
          ) : (
            <span className="px-4 py-2 text-sm text-gray-400 dark:text-white/40">No active order</span>
          )}
        </div>
      </div>

      <div className="flex space-x-4 border-b border-gray-200 dark:border-white/15 overflow-x-auto">
        {[
          { key: 'club-card', label: 'Club card' },
          { key: 'orders', label: 'My orders' },
          { key: 'profile', label: 'Profile' },
          { key: 'loyalty', label: 'Loyalty' },
          { key: 'settings', label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-3 text-sm font-semibold whitespace-nowrap ${
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
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-gray-900 dark:text-white font-bold">{'\u00A3'}{order.total?.toFixed(2) || '0.00'}</p>
                      <p className={`text-sm ${
                        order.status === 'delivered' ? 'text-green-600 dark:text-green-300' :
                        order.status === 'cancelled' ? 'text-red-600 dark:text-red-300' :
                        order.status === 'pending' ? 'text-yellow-600 dark:text-yellow-300' :
                        order.status === 'confirmed' ? 'text-blue-600 dark:text-blue-300' :
                        order.status === 'processing' ? 'text-blue-600 dark:text-blue-300' :
                        'text-gray-600 dark:text-white/60'
                      }`}>
                        {order.status || 'Pending'}
                      </p>
                    </div>
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button
                        onClick={(e) => handleCancelOrder(order.id, e)}
                        disabled={cancellingOrderId === order.id}
                        className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-500/15 border border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-300 text-xs font-medium hover:bg-red-200 dark:hover:bg-red-500/25 transition-colors disabled:opacity-50"
                      >
                        {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit profile</h3>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label htmlFor="profile-name" className="text-sm text-gray-600 dark:text-white/60">Full name</label>
                <input
                  id="profile-name"
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="profile-phone" className="text-sm text-gray-600 dark:text-white/60">Phone number</label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+44 7123 456789"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-white/60">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/15 text-gray-500 dark:text-white/50 cursor-not-allowed"
                />
              </div>
              <button type="submit" disabled={profileSaving} className="px-6 py-3 rounded-xl button-primary text-brand-graphite font-semibold disabled:opacity-50">
                {profileSaving ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </div>

          <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Change password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="current-password" className="text-sm text-gray-600 dark:text-white/60">Current password</label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="new-password" className="text-sm text-gray-600 dark:text-white/60">New password</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="confirm-new-password" className="text-sm text-gray-600 dark:text-white/60">Confirm new password</label>
                <input
                  id="confirm-new-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                />
              </div>
              <button type="submit" disabled={passwordSaving} className="px-6 py-3 rounded-xl button-primary text-brand-graphite font-semibold disabled:opacity-50">
                {passwordSaving ? 'Changing...' : 'Change password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'loyalty' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Redeem points</h3>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/8 border border-gray-200 dark:border-white/15">
              <p className="text-sm text-gray-600 dark:text-white/60">Available points</p>
              <p className="text-3xl font-bold text-brand-mint">{points}</p>
            </div>
            <form onSubmit={handleRedeemPoints} className="space-y-3">
              <div>
                <label htmlFor="redeem-amount" className="text-sm text-gray-600 dark:text-white/60">Points to redeem</label>
                <input
                  id="redeem-amount"
                  type="number"
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  min={1}
                  max={points}
                  placeholder="Enter amount"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                />
              </div>
              <button type="submit" disabled={redeemSaving || points === 0} className="w-full py-3 rounded-xl button-primary text-brand-graphite font-semibold disabled:opacity-50">
                {redeemSaving ? 'Redeeming...' : 'Redeem points'}
              </button>
            </form>
          </div>

          <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-3 shadow-card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Loyalty history</h3>
            {loadingLoyalty ? (
              <div className="text-center py-8 text-gray-600 dark:text-white/60">Loading history...</div>
            ) : loyaltyHistory.length === 0 && history.length === 0 ? (
              <p className="text-gray-600 dark:text-white/60 text-sm">No loyalty history yet.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {(loyaltyHistory.length > 0 ? loyaltyHistory : history).map((txn, idx) => (
                  <div key={txn.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/8 border border-gray-200 dark:border-white/15">
                    <div>
                      <p className="text-gray-900 dark:text-white font-semibold text-sm">{txn.description || txn.type}</p>
                      <p className="text-gray-500 dark:text-white/50 text-xs">{txn.date ? new Date(txn.date).toLocaleDateString() : txn.created_at ? new Date(txn.created_at).toLocaleDateString() : ''}</p>
                    </div>
                    <span className={`font-bold ${(txn.type === 'earned' || txn.type === 'credit') ? 'text-brand-mint' : 'text-red-600 dark:text-red-200'}`}>
                      {(txn.type === 'earned' || txn.type === 'credit') ? '+' : '-'}{txn.amount || txn.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-card">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delivery address</h3>
            <div className="text-center py-6 text-gray-600 dark:text-white/60">
              <MapPinIcon className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-white/40" />
              <p className="text-sm">Your delivery address is set during checkout</p>
            </div>
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
                      onChange={(e) => handleNotificationChange(n.key, e.target.checked)}
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

      {toast && <Toast type={toast.type} message={toast.message} duration={3000} onClose={() => setToast(null)} />}
    </div>
  )
}
