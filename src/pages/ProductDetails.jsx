import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PlusIcon, MinusIcon, StarIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useDispatch } from 'react-redux'
import { addItem, openCart } from '../store/slices/cartSlice'
import { productService } from '../services/productService'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await productService.getProduct(id)
        setProduct(data)
      } catch (error) {
        console.error('Failed to fetch product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  // Set initial image to primary when product loads
  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      const primaryIndex = product.images.findIndex(img => img.is_primary)
      setCurrentImage(primaryIndex === -1 ? 0 : primaryIndex)
    }
  }, [product])

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-600 dark:text-white/80 animate-fade-in">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-gray-600 dark:text-white/80 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/8 mx-auto mb-4 flex items-center justify-center">
          <StarIcon className="h-10 w-10 text-gray-400 dark:text-white/60" />
        </div>
        <p className="text-xl font-semibold text-gray-900 dark:text-white">Product not found</p>
        <p className="text-sm text-gray-600 dark:text-white/70 mt-2">The product you're looking for doesn't exist or removed</p>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 rounded-xl button-primary">Back home</button>
      </div>
    )
  }

  // Handle images
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => img.image_url)
    : product.image 
      ? [product.image] 
      : []
  
  // Check if promotion is active
  const isPromotionActive = () => {
    if (!product.promotion_price) return false
    const now = new Date()
    const startDate = product.promotion_start ? new Date(product.promotion_start) : null
    const endDate = product.promotion_end ? new Date(product.promotion_end) : null
    
    if (startDate && now < startDate) return false
    if (endDate && now > endDate) return false
    return true
  }

  const promotionActive = isPromotionActive()
  const currentPrice = promotionActive ? product.promotion_price : (product.retail_price || product.price)
  const stockQuantity = product.stock_quantity || product.stock
  const itemName = product.item_name || product.name
  const packSize = product.pack_size || product.packSize
  const shortDescription = product.short_description || product.description
  const longDescription = product.long_description || product.description

  const pointsEarned = Math.floor(currentPrice * quantity)

  const handleAddToCart = () => {
    if (stockQuantity > 0 && quantity > 0) {
      dispatch(addItem({ 
        ...product, 
        name: itemName,
        price: currentPrice,
        quantity 
      }))
      dispatch(openCart())
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/15 glass-card shadow-glow group">
          <img
            src={images[currentImage]}
            alt={itemName}
            className="w-full h-[420px] object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {/* Category Badge */}
            <div className="px-3 py-1 rounded-full bg-black/70 text-white text-xs font-medium backdrop-blur-sm border border-white/20">
              {product.category?.name || product.category || 'Product'}
            </div>
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-medium backdrop-blur-sm border border-white/20">
              {currentImage + 1} / {images.length}
            </div>
          )}
          <div className="absolute bottom-4 left-4 px-3 py-2 rounded-full bg-white/95 dark:bg-brand-graphite/95 text-gray-900 dark:text-white/90 backdrop-blur-md border border-gray-200 dark:border-white/20 font-medium">
            {packSize}
          </div>
          {/* Promotion Badge on Image */}
          {promotionActive && (
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-brand-mint/90 text-brand-graphite text-xs font-bold backdrop-blur-md border border-brand-mint flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              PROMO ACTIVE
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex space-x-3">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                  currentImage === index
                    ? 'border-brand-mint ring-2 ring-brand-mint/50 scale-105 shadow-lg'
                    : 'border-gray-200 dark:border-white/15 hover:border-brand-mint/50 hover:scale-105'
                }`}
              >
                <img src={img} alt={`${itemName}-${index}`} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{itemName}</h1>
              <p className="text-gray-600 dark:text-white/80 mt-1">{product.brand}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {promotionActive ? (
              <div className="flex items-center gap-3">
                <p className="text-4xl font-bold text-brand-mint">£{currentPrice.toFixed(2)}</p>
                <p className="text-xl text-gray-400 dark:text-white/50 line-through">£{(product.retail_price || product.price).toFixed(2)}</p>
              </div>
            ) : (
              <p className="text-4xl font-bold text-brand-mint">£{currentPrice.toFixed(2)}</p>
            )}
            <span className="px-3 py-1 rounded-full bg-brand-mint/10 text-brand-mint border border-brand-mint/20 text-sm font-semibold">
              {packSize}
            </span>
          </div>
          
          {/* Promotion Timeline */}
          {promotionActive && (
            <div className="flex items-center gap-2 text-sm">
              <ClockIcon className="h-4 w-4 text-brand-mint" />
              <p className="text-brand-mint font-medium">
                Offer valid: {new Date(product.promotion_start).toLocaleDateString()} - {new Date(product.promotion_end).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl glass-card border border-gray-200 dark:border-white/15 space-y-4">
          <p className="text-gray-700 dark:text-white/90 leading-relaxed">{shortDescription}</p>
          {longDescription && longDescription !== shortDescription && (
            <p className="text-sm text-gray-600 dark:text-white/80 leading-relaxed border-t border-gray-200 dark:border-white/10 pt-3">
              {longDescription}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2">
            {(product.is_vegan || product.isVegan) && (
              <span className="px-3 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium border border-green-200 dark:border-green-700/30">
                Vegan
              </span>
            )}
            {(product.is_gluten_free || product.isGlutenFree) && (
              <span className="px-3 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-700/30">
                Gluten Free
              </span>
            )}
            {(product.is_vegetarian || product.isVegetarian) && (
              <span className="px-3 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium border border-teal-200 dark:border-teal-700/30">
                Vegetarian
              </span>
            )}
          </div>
          
          {/* Allergen Info */}
          {product.allergen_info && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <p className="text-xs font-semibold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                <ExclamationTriangleIcon className="h-4 w-4" />
                Allergen Information
              </p>
              <p className="text-sm text-red-700 dark:text-red-200 mt-1">{product.allergen_info}</p>
            </div>
          )}
          
          {/* Expiry Date */}
          {product.expiry_date && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <span>📅 Expiry Date:</span>
              <span className="font-medium">{new Date(product.expiry_date).toLocaleDateString()}</span>
            </div>
          )}
          
          <p className="text-sm text-gray-600 dark:text-white/80 font-medium">
            Stock: {stockQuantity > 0 ? (
              <span className="text-brand-mint font-semibold">{stockQuantity} available</span>
            ) : (
              <span className="text-red-600 dark:text-red-400 font-semibold">Out of stock</span>
            )}
          </p>
        </div>

        <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-5 flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/10 border border-brand-gold/30">
            <StarIcon className="h-6 w-6 text-brand-gold" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-white/80">Loyalty Points</p>
            <p className="text-gray-900 dark:text-white font-semibold">
              Earn <span className="text-brand-gold font-bold">{pointsEarned}</span> points with this order
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {stockQuantity > 0 ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="flex items-center rounded-2xl border border-gray-200 dark:border-white/20 bg-gray-50 dark:bg-white/15">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                  <span className="px-5 text-lg font-semibold text-gray-900 dark:text-white w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(stockQuantity, q + 1))}
                    className="p-3 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
                    aria-label="Increase quantity"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
                <span className="text-sm text-gray-600 dark:text-white/80">
                  Max: <span className="font-semibold text-gray-900 dark:text-white">{stockQuantity}</span>
                </span>
              </div>

              {/* Age Restriction Notice */}
              {product.is_age_restricted && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-red-800 dark:text-red-300">Age Restriction</p>
                    <p className="text-red-600 dark:text-red-400 mt-1">
                      This product is restricted to customers aged {product.minimum_age || 18} or above. You will need to verify your age at checkout.
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                className="w-full py-4 rounded-2xl button-primary text-brand-graphite text-lg font-bold shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Add to cart – £{(currentPrice * quantity).toFixed(2)}
              </button>
            </>
          ) : (
            <div className="p-4 rounded-2xl bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 text-red-800 dark:text-red-100 font-medium">
              Currently out of stock
            </div>
          )}
        </div>
      </div>
    </div>
  )
}