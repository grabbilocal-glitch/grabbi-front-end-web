import { useDispatch, useSelector } from 'react-redux'
import Navbar from './Navbar'
import MobileNav from './MobileNav'
import CartDrawer from '../Cart/CartDrawer'
import { closeCart, selectIsCartOpen } from '../../store/slices/cartSlice'

export default function Layout({ children }) {
  const isCartOpen = useSelector(selectIsCartOpen)
  const dispatch = useDispatch()

  return (
    <div className="min-h-screen bg-[#fffff0] dark:bg-brand-graphite text-gray-900 dark:text-white transition-colors">
      <div className="fixed inset-0 opacity-70 bg-mesh -z-10" />
      <Navbar />
      <main className="pb-28 md:pb-10 pt-4 md:pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <MobileNav />
      <CartDrawer />
    </div>
  )
}
