import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Layout from './components/Layout/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import { setUser } from './store/slices/authSlice'
import { setPoints } from './store/slices/loyaltySlice'
import { setSelectedFranchise } from './store/slices/franchiseSlice'
import { setup401Handler } from './utils/api'
import { logout } from './store/slices/authSlice'
import { store } from './store/store'

const Home = lazy(() => import('./pages/Home'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderTracking = lazy(() => import('./pages/OrderTracking'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const About = lazy(() => import('./pages/About'))
const Help = lazy(() => import('./pages/Help'))
const NotFound = lazy(() => import('./pages/NotFound'))

const PageLoader = () => (
  <div className="text-center py-20">
    <div className="animate-spin h-8 w-8 border-2 border-brand-mint border-t-transparent rounded-full mx-auto mb-2" />
    <div className="text-lg text-gray-600 dark:text-white/80">Loading...</div>
  </div>
)

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Setup 401 handler to logout on unauthorized responses
    setup401Handler(() => {
      store.dispatch(logout())
    })
  }, [])

  useEffect(() => {
    // Initialize auth from localStorage
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.name && !user.firstName) {
          const nameParts = user.name.split(' ')
          user.firstName = nameParts[0] || 'User'
          user.lastName = nameParts.slice(1).join(' ') || ''
        }
        dispatch(setUser(user))
        if (user.loyalty_points !== undefined) {
          dispatch(setPoints(user.loyalty_points))
        }
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }

    // Initialize franchise from localStorage
    const savedFranchise = localStorage.getItem('selectedFranchise')
    if (savedFranchise) {
      try {
        dispatch(setSelectedFranchise(JSON.parse(savedFranchise)))
      } catch {
        localStorage.removeItem('selectedFranchise')
      }
    }
  }, [dispatch])

  return (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/order/:orderId" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/about" element={<About />} />
            <Route path="/help" element={<Help />} />
            <Route path="/search" element={<CategoryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  )
}

export default App
