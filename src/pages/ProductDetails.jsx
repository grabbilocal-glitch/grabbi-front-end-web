import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PlusIcon, MinusIcon, StarIcon } from '@heroicons/react/24/outline'
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
        <p className="text-sm text-gray-600 dark:text-white/70 mt-2">The product you're looking for doesn't exist</p>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 rounded-xl button-primary">Back home</button>
      </div>
    )
  }

  // Generate unique image variations with different filters/crops
  const supportsTransform = product.image?.includes('cloudinary')

  const images = [
    product.image,
    supportsTransform ? `${product.image}?w=800&q=80` : product.image,
    supportsTransform ? `${product.image}?w=800&h=800&q=80` : product.image,
  ]
  const pointsEarned = Math.floor(product.price * quantity)

  const handleAddToCart = () => {
    if (product.stock > 0 && quantity > 0) {
      dispatch(addItem({ ...product, quantity }))
      dispatch(openCart())
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/15 glass-card shadow-glow group">
          <img
            src={images[currentImage]}
            alt={product.name}
            className="w-full h-[420px] object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-medium backdrop-blur-sm border border-white/20">
            {product.category?.name || product.category || 'Product'}
          </div>
          <div className="absolute bottom-4 left-4 px-3 py-2 rounded-full bg-white/90 dark:bg-white/12 text-gray-900 dark:text-white/90 backdrop-blur-md border border-gray-200 dark:border-white/20 font-medium">
            {product.pack_size || product.packSize}
          </div>
        </div>
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
              <img src={img} alt={`${product.name}-${index}`} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{product.name}</h1>
              <p className="text-gray-600 dark:text-white/80 mt-1">{product.brand}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <p className="text-4xl font-bold text-brand-mint">£{product.price.toFixed(2)}</p>
            <span className="px-3 py-1 rounded-full bg-brand-mint/10 text-brand-mint border border-brand-mint/20 text-sm font-semibold">
              {product.pack_size || product.packSize}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-gray-200 dark:border-white/15 space-y-4">
          <p className="text-gray-700 dark:text-white/90 leading-relaxed">{product.description}</p>
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
          </div>
          <p className="text-sm text-gray-600 dark:text-white/80 font-medium">
            Stock: {product.stock > 0 ? (
              <span className="text-brand-mint font-semibold">{product.stock} available</span>
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
          {product.stock > 0 ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="flex items-center rounded-2xl border border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-white/8">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                  <span className="px-5 text-lg font-semibold text-gray-900 dark:text-white w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-3 text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
                    aria-label="Increase quantity"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
                <span className="text-sm text-gray-600 dark:text-white/80">
                  Max: <span className="font-semibold text-gray-900 dark:text-white">{product.stock}</span>
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-4 rounded-2xl button-primary text-brand-graphite text-lg font-bold shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Add to cart – £{(product.price * quantity).toFixed(2)}
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
