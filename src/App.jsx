import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import CategoryPage from './pages/CategoryPage'
import ProductDetails from './pages/ProductDetails'
import Checkout from './pages/Checkout'
import OrderTracking from './pages/OrderTracking'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import { setUser } from './store/slices/authSlice'
import { setPoints } from './store/slices/loyaltySlice'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Initialize auth from localStorage
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        // Parse name into firstName and lastName if needed
        if (user.name && !user.firstName) {
          const nameParts = user.name.split(' ')
          user.firstName = nameParts[0] || 'User'
          user.lastName = nameParts.slice(1).join(' ') || ''
        }
        dispatch(setUser(user))
        if (user.loyalty_points !== undefined) {
          dispatch(setPoints(user.loyalty_points))
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [dispatch])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:orderId" element={<OrderTracking />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<CategoryPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

export default App
