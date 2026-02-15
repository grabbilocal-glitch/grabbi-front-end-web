import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import Toast from '../components/UI/Toast'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [toast, setToast] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setToast({ type: 'error', message: 'Passwords do not match' })
      return
    }
    if (password.length < 8) {
      setToast({ type: 'error', message: 'Password must be at least 8 characters' })
      return
    }
    setSubmitting(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setSubmitted(true)
      setToast({ type: 'success', message: 'Password reset successfully!' })
      setTimeout(() => navigate('/'), 2000)
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to reset password' })
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center py-20 text-gray-600 dark:text-white/70">
        <p className="text-xl mb-4">Invalid reset link</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl button-primary">Go home</button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Password Reset!</h2>
        <p className="text-gray-600 dark:text-white/70 mb-4">Your password has been reset successfully. Redirecting to home...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 space-y-4 shadow-card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset your password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-white/60">New password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-white/60">Confirm password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white" />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl button-primary text-brand-graphite font-semibold disabled:opacity-50">
            {submitting ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      </div>
      {toast && <Toast type={toast.type} message={toast.message} duration={3000} onClose={() => setToast(null)} />}
    </div>
  )
}
