import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useDispatch } from 'react-redux'
import { setUser } from '../../store/slices/authSlice'
import { setCustomerId, setPoints } from '../../store/slices/loyaltySlice'
import Toast from '../UI/Toast'
import { api, setAuthToken } from '../../utils/api'

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login')
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '' })
  const [toast, setToast] = useState(null)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSubmitting, setForgotSubmitting] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const dispatch = useDispatch()

  const handleInputChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    try {
      if (mode === 'login') {
        const response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        })
        setAuthToken(response.data.token)
        localStorage.setItem('refresh_token', response.data.refresh_token || '')
        // Parse user name into firstName and lastName
        const userName = response.data.user.name || ''
        const nameParts = userName.split(' ')
        const userData = {
          ...response.data.user,
          firstName: nameParts[0] || 'User',
          lastName: nameParts.slice(1).join(' ') || '',
        }
        dispatch(setUser(userData))
        if (response.data.user.loyalty_points) {
          dispatch(setPoints(response.data.user.loyalty_points))
        }
        setToast({ type: 'success', message: 'Login successful!' })
        setTimeout(() => onClose(), 1000)
      } else {
        const response = await api.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`,
        })
        setAuthToken(response.data.token)
        localStorage.setItem('refresh_token', response.data.refresh_token || '')
        // Parse user name into firstName and lastName
        const userName = response.data.user.name || ''
        const nameParts = userName.split(' ')
        const userData = {
          ...response.data.user,
          firstName: nameParts[0] || formData.firstName || 'User',
          lastName: nameParts.slice(1).join(' ') || formData.lastName || '',
        }
        dispatch(setUser(userData))
        if (response.data.user.loyalty_points) {
          dispatch(setPoints(response.data.user.loyalty_points))
        }
        setToast({ type: 'success', message: 'Account created successfully!' })
        setTimeout(() => onClose(), 1000)
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Authentication failed',
      })
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!forgotEmail.trim()) {
      setToast({ type: 'error', message: 'Please enter your email address' })
      return
    }
    setForgotSubmitting(true)
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail })
      setForgotSuccess(true)
      setToast({ type: 'success', message: 'Password reset email sent!' })
    } catch (error) {
      setToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to send reset email',
      })
    } finally {
      setForgotSubmitting(false)
    }
  }

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/70 dark:bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-xl rounded-3xl glass-card border border-gray-200 dark:border-white/15 p-6 md:p-8 shadow-glow animate-fade-in">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-gray-100 dark:bg-white/12 border border-gray-200 dark:border-white/15 flex items-center justify-center text-brand-gold font-extrabold">G</div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-600 dark:text-white/80">Join Grabbi</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Unlock rewards, faster checkout</h3>
            </div>
          </div>

          <div className="flex space-x-4 border-b border-gray-200 dark:border-white/15 mb-6">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`pb-3 text-sm font-semibold transition-colors ${
                  mode === m ? 'text-brand-mint border-b-2 border-brand-mint' : 'text-gray-500 dark:text-white/70 hover:text-gray-700 dark:hover:text-white/90'
                }`}
              >
                {m === 'login' ? 'Login' : 'Sign up'}
              </button>
            ))}
          </div>

        {mode === 'forgotPassword' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reset your password</h3>
            {forgotSuccess ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-white/70">
                  If an account exists with that email, you will receive a password reset link shortly.
                </p>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setForgotSuccess(false); setForgotEmail('') }}
                  className="w-full py-3 rounded-xl button-primary text-brand-graphite font-semibold"
                >
                  Back to login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-white/70">
                  Enter your email address and we will send you a link to reset your password.
                </p>
                <div>
                  <label htmlFor="forgot-email" className="text-xs text-gray-600 dark:text-white/80 font-medium">Email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-3 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-mint/50 transition-all"
                  />
                </div>
                <button type="submit" disabled={forgotSubmitting} className="w-full py-3 rounded-xl button-primary text-brand-graphite font-semibold disabled:opacity-50">
                  {forgotSubmitting ? 'Sending...' : 'Send reset link'}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setForgotEmail('') }}
                  className="w-full text-sm text-gray-500 dark:text-white/60 hover:underline"
                >
                  Back to login
                </button>
              </form>
            )}
          </div>
        ) : (
          <>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {mode === 'signup' && (
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="auth-firstName" className="text-xs text-gray-600 dark:text-white/60">First name *</label>
                    <input
                      id="auth-firstName"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="auth-lastName" className="text-xs text-gray-600 dark:text-white/60">Last name *</label>
                    <input
                      id="auth-lastName"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="email" className="text-xs text-gray-600 dark:text-white/80 font-medium">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-mint/50 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="text-xs text-gray-600 dark:text-white/80 font-medium">Password</label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-mint/50 transition-all"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-xl button-primary text-brand-graphite font-semibold">
                {mode === 'login' ? 'Login' : 'Create account'}
              </button>
              {mode === 'login' && (
                <button type="button" onClick={() => setMode('forgotPassword')} className="text-sm text-brand-mint hover:underline mt-2">Forgot password?</button>
              )}
            </form>

            <div className="flex items-center my-6 space-x-3 text-gray-400 dark:text-white/60 text-xs uppercase tracking-wide">
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/12" />
              <span>or</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/12" />
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center">
                <p className="text-sm text-gray-500 dark:text-white/50 font-medium">Phone / OTP login</p>
                <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Coming soon</p>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-3">
              <button
                disabled
                className="w-full py-3 rounded-xl bg-gray-100 dark:bg-white/20 border border-gray-200 dark:border-white/25 text-gray-400 dark:text-white/40 cursor-not-allowed opacity-60"
                title="Coming soon"
              >
                Google (Coming soon)
              </button>
              <button
                disabled
                className="w-full py-3 rounded-xl bg-gray-100 dark:bg-white/20 border border-gray-200 dark:border-white/25 text-gray-400 dark:text-white/40 cursor-not-allowed opacity-60"
                title="Coming soon"
              >
                Apple (Coming soon)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  )
}
