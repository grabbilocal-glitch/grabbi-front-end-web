import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import ProductCard from '../components/Product/ProductCard'
import { productService } from '../services/productService'

export default function CategoryPage() {
  const { categoryName } = useParams()
  const [searchParams] = useSearchParams()
  const [filteredProducts, setFilteredProducts] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ priceRange: 'all', dietary: [], brand: 'all' })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const searchQuery = searchParams.get('search')
  const brands = [...new Set(products.map((p) => p.brand))]

  useEffect(() => {
    fetchProducts()
    
  }, [])

  useEffect(() => {
    let filtered = [...products]
    if (categoryName && categoryName !== 'all') {
      filtered = filtered.filter((p) => {
        const categoryId = p.category_id || p.category?.id || p.category
        if (!categoryId) return false
        return categoryId.toLowerCase() === categoryName.toLowerCase()
      })
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((p) => {
        const name = (p.item_name || p.name || '').toLowerCase()
        const description = (p.short_description || p.long_description || p.description || '').toLowerCase()
        const brand = (p.brand || '').toLowerCase()
        return name.includes(q) || description.includes(q) || brand.includes(q)
      })
    }
    if (filters.priceRange !== 'all') {
      if (filters.priceRange.includes('+')) {
        const min = Number(filters.priceRange.replace('+', ''))
        filtered = filtered.filter((p) => (p.retail_price || p.price) >= min)
      } else {
        const [min, max] = filters.priceRange.split('-').map(Number)
        filtered = filtered.filter((p) => {
          const price = p.retail_price || p.price
          return price >= min && price <= max
        })
      }
    }
    if (filters.dietary.length > 0) {
      filtered = filtered.filter((p) => {
        return filters.dietary.some((d) => {
          if (d === 'vegan') return p.is_vegan
          if (d === 'gluten-free') return p.is_gluten_free
          return false
        })
      })
    }
    if (filters.brand !== 'all') {
      filtered = filtered.filter((p) => p.brand === filters.brand)
    }
    setFilteredProducts(filtered)
  }, [products, categoryName, searchQuery, filters])

  const handleDietaryChange = (d) => {
    setFilters((prev) => ({
      ...prev,
      dietary: prev.dietary.includes(d) ? prev.dietary.filter((x) => x !== d) : [...prev.dietary, d],
    }))
  }

  const fetchProducts = async () => {
    try {
      const [productsData] = await Promise.all([
        productService.getProducts(),
      ])

      setProducts(productsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      // Fallback to empty arrays
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-lg text-gray-600 dark:text-white/80">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-white/60 uppercase tracking-wide">Catalog</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {categoryName === 'all' ? 'All products' : filteredProducts[0]?.category?.name || 'Products'}
            {searchQuery && <span className="text-brand-mint text-lg ml-3">Search: "{searchQuery}"</span>}
          </h1>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden px-4 py-2 rounded-xl glass-card border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white flex items-center space-x-2"
        >
          <FunnelIcon className="h-5 w-5" />
          <span>Filters</span>
        </button>
      </div>

      <div className="flex gap-6">
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-72 flex-shrink-0`}>
          <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-5 sticky top-28 shadow-card">
            <div className="flex items-center justify-between md:hidden mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-1"><XMarkIcon className="h-6 w-6 text-gray-900 dark:text-white" /></button>
            </div>

            <div className="space-y-6 text-gray-900 dark:text-white">
              <div>
                <h4 className="text-sm uppercase tracking-wide text-gray-600 dark:text-white/60 mb-3">Price range</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {['all', '0-5', '5-10', '10-20', '20+'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setFilters((prev) => ({ ...prev, priceRange: range }))}
                      className={`px-3 py-2 rounded-xl border border-gray-200 dark:border-white/20 bg-gray-50 dark:bg-white/15 hover:bg-gray-100 dark:hover:bg-white/20 transition ${
                        filters.priceRange === range ? 'ring-2 ring-brand-mint bg-gray-100 dark:bg-white/25 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-white/80'
                      }`}
                    >
                      {range === 'all' ? 'All' : range === '20+' ? '£20+' : `£${range}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm uppercase tracking-wide text-gray-600 dark:text-white/60 mb-3">Dietary</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Vegan', value: 'vegan' },
                    { label: 'Gluten free', value: 'gluten-free' },
                  ].map((d) => (
                    <button
                      key={d.value}
                      onClick={() => handleDietaryChange(d.value)}
                      className={`px-3 py-2 rounded-xl border border-gray-200 dark:border-white/20 bg-gray-50 dark:bg-white/15 hover:bg-gray-100 dark:hover:bg-white/20 text-sm transition ${
                        filters.dietary.includes(d.value) ? 'ring-2 ring-brand-mint bg-gray-100 dark:bg-white/25 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-white/80'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm uppercase tracking-wide text-gray-600 dark:text-white/60 mb-3">Brand</h4>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters((prev) => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-3 rounded-xl bg-white dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white"
                >
                  <option value="all">All brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand} className="text-gray-900">{brand}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 space-y-4">
          <p className="text-gray-600 dark:text-white/60 text-sm">Showing {filteredProducts.length} items</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-16 rounded-2xl glass-card border border-gray-200 dark:border-white/15 text-gray-600 dark:text-white/70">
              No products found. Try adjusting filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
