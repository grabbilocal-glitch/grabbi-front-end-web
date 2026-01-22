import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import ProductCard from '../components/Product/ProductCard'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../store/slices/authSlice'
import { productService } from '../services/productService'

export default function Home() {
  const [currentPromo, setCurrentPromo] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [categories, setCategories] = useState([])
  const [promotions, setPromotions] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesData, promotionsData, productsData] = await Promise.all([
        productService.getCategories(),
        productService.getPromotions(),
        productService.getProducts(),
      ])

      setCategories(categoriesData || [])
      setPromotions(promotionsData || [])
      
      // Split products into best sellers and new arrivals
      const products = productsData || []
      setBestSellers(products.slice(0, 6))
      setNewArrivals(products.slice(6, 12))
    } catch (error) {
      console.error('Failed to fetch data:', error)
      // Fallback to empty arrays
      setCategories([])
      setPromotions([])
      setBestSellers([])
      setNewArrivals([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isPaused || promotions.length === 0) return
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promotions.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isPaused, promotions.length])

  const nextPromo = () => {
    setCurrentPromo((prev) => (prev + 1) % promotions.length)
  }

  const prevPromo = () => {
    setCurrentPromo((prev) => (prev - 1 + promotions.length) % promotions.length)
  }

  const goToSlide = (index) => {
    setCurrentPromo(index)
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-lg text-gray-600 dark:text-white/80">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/15 glass-card shadow-glow">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(82,201,139,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(244,206,106,0.25),transparent_30%)]" />
        <div className="grid md:grid-cols-2 gap-8 p-8 md:p-10 relative">
          <div className="space-y-5">
            <p className="text-brand-gold font-semibold uppercase tracking-[0.2em] text-xs">Fresh • Fast • Premium</p>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900 dark:text-white">
              Instant delivery of curated groceries & premium essentials.
            </h1>
            <p className="text-gray-700 dark:text-white/80 max-w-xl">
              Handpicked best sellers, crafted bundles, and new arrivals delivered in minutes. Earn loyalty points every time you shop.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/category/all" className="px-5 py-3 rounded-2xl button-primary">Shop now</Link>
              <Link to="/dashboard" className="px-5 py-3 rounded-2xl button-ghost">View loyalty</Link>
            </div>
            <div className="flex items-center space-x-6 pt-2 text-gray-700 dark:text-white/80">
              <div>
                <p className="text-lg font-bold text-brand-mint">2h</p>
                <p className="text-xs uppercase tracking-wide">Standard delivery</p>
              </div>
              <div className="h-10 w-px bg-gray-300 dark:bg-white/20" />
              <div>
                <p className="text-lg font-bold text-brand-gold">£20+</p>
                <p className="text-xs uppercase tracking-wide">Free delivery</p>
              </div>
              <div className="h-10 w-px bg-gray-300 dark:bg-white/20" />
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">50 pts</p>
                <p className="text-xs uppercase tracking-wide">Welcome bonus</p>
              </div>
            </div>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="absolute -top-6 -left-6 h-24 w-24 bg-brand-mint/30 blur-3xl -z-10" />
            <div className="absolute -bottom-10 -right-8 h-28 w-28 bg-brand-gold/30 blur-3xl -z-10" />
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/15 shadow-glow h-72 md:h-80">
              <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${currentPromo * 100}%)` }}
              >
                {promotions.map((promo, index) => (
                  <div
                    key={promo.id}
                    className="relative min-w-full h-full flex-shrink-0"
                  >
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 space-y-2 z-10">
                      <p className="text-sm text-white/90 font-medium">Featured</p>
                      <h3 className="text-2xl font-bold text-white">{promo.title}</h3>
                      <p className="text-white/90 text-sm max-w-md">{promo.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={prevPromo}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 z-20"
                aria-label="Previous slide"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={nextPromo}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 z-20"
                aria-label="Next slide"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
                {promotions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentPromo
                        ? 'w-8 bg-white shadow-lg'
                        : 'w-2 bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Browse categories</h2>
          <Link to="/category/all" className="text-sm text-brand-mint hover:text-brand-emerald dark:hover:text-white transition-colors">See all</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="group rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-4 flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300 shadow-card hover:shadow-lg"
            >
              <div className="h-12 w-12 rounded-full bg-white/80 dark:bg-white/12 border border-gray-200 dark:border-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="text-2xl">{category.icon || '📦'}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Order Again */}
      {isAuthenticated && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order again</h2>
            <Link to="/category/all" className="text-sm text-brand-mint hover:text-brand-emerald dark:hover:text-white transition-colors">See all</Link>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {bestSellers.slice(0, 5).map((product, index) => (
              <div key={product.id} className="w-56 flex-shrink-0 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <ProductCard product={product} compact />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Best sellers */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Best sellers</h2>
          <Link to="/category/all" className="text-sm text-brand-mint hover:text-brand-emerald dark:hover:text-white transition-colors">Browse</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bestSellers.map((product, index) => (
            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New arrivals</h2>
          <Link to="/category/all" className="text-sm text-brand-mint hover:text-brand-emerald dark:hover:text-white transition-colors">Explore</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {newArrivals.map((product, index) => (
            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
