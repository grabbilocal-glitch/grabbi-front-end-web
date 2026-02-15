import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import MobileNav from './MobileNav'
import CartDrawer from '../Cart/CartDrawer'
import { closeCart, selectIsCartOpen } from '../../store/slices/cartSlice'

export default function Layout({ children }) {
  const isCartOpen = useSelector(selectIsCartOpen)
  const dispatch = useDispatch()

  return (
    <div className="min-h-screen bg-[#fffff0] dark:bg-brand-graphite text-gray-900 dark:text-white transition-colors flex flex-col">
      <div className="fixed inset-0 opacity-70 bg-mesh -z-10" />
      <Navbar />
      <main className="pb-28 md:pb-10 pt-4 md:pt-6 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <footer className="hidden md:block border-t border-gray-200 dark:border-white/10 bg-white/80 dark:bg-brand-graphite/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">GRABBI</span>
              <span className="text-xs text-gray-500 dark:text-white/50">Quick Commerce</span>
            </div>
            <nav className="flex items-center space-x-6 text-sm">
              <Link to="/about" className="text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors">About</Link>
              <Link to="/help" className="text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors">Help</Link>
              <Link to="/terms" className="text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</Link>
            </nav>
            <p className="text-xs text-gray-400 dark:text-white/40">&copy; {new Date().getFullYear()} Grabbi. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <MobileNav />
      <CartDrawer />
    </div>
  )
}
