import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { selectIsAuthenticated } from '../../store/slices/authSlice'

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const token = localStorage.getItem('token')

  if (!isAuthenticated && !token) {
    return <Navigate to="/" replace />
  }

  return children
}
