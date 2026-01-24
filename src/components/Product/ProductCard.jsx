import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import { addItem, openCart } from '../../store/slices/cartSlice'

export default function ProductCard({ product, compact = false }) {
  const dispatch = useDispatch()

  // Get the appropriate image URL from images array
  const imageUrl = product.images && product.images.length > 0 
    ? (product.images.find(img => img.is_primary)?.image_url || product.images[0].image_url)
    : product.image || ''

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock > 0) {
      dispatch(addItem({ ...product, quantity: 1 }))
      dispatch(openCart())
    }
  }

  return (
    <Link to={`/product/${product.id}`} className="block group">
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/15 glass-card shadow-card transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold text-white backdrop-blur-md border border-white/30">
            {product.category?.name || product.category || 'Product'}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-white">£{product.price.toFixed(2)}</p>
              <p className="text-xs text-white/90">{product.pack_size || product.packSize}</p>
            </div>
            {product.stock > 0 ? (
              <button
                onClick={handleQuickAdd}
                className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-mint to-brand-emerald text-brand-graphite flex items-center justify-center shadow-glow transition-all hover:scale-110 active:scale-95"
                aria-label={`Add ${product.name} to cart`}
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            ) : (
              <span className="px-3 py-1 rounded-full bg-black/70 text-white text-xs font-medium backdrop-blur-sm">Out of stock</span>
            )}
          </div>
        </div>
        <div className="p-3 space-y-1 bg-white/95 dark:bg-brand-graphite/95">
          <h3 className={`font-semibold text-gray-900 dark:text-white line-clamp-2 ${compact ? 'text-sm' : 'text-base'}`}>{product.name}</h3>
          <p className="text-xs text-gray-600 dark:text-white/80">{product.brand}</p>
          <div className="flex items-center space-x-2 text-[11px]">
            {(product.is_vegan || product.isVegan) && <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium border border-green-200 dark:border-green-700/30">Vegan</span>}
            {(product.is_gluten_free || product.isGlutenFree) && <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-700/30">Gluten Free</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
