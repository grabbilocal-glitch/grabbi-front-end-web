import { describe, it, expect } from 'vitest'
import { productService } from './productService'
import { mockProducts, mockProduct, mockCategories, mockPromotions } from '../test/mocks/fixtures'

describe('productService', () => {
  describe('getProducts', () => {
    it('returns an array of products', async () => {
      const products = await productService.getProducts()
      expect(Array.isArray(products)).toBe(true)
      expect(products.length).toBe(2)
    })

    it('each product has required fields from the backend', async () => {
      const products = await productService.getProducts()
      const product = products[0]
      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('sku')
      expect(product).toHaveProperty('item_name')
      expect(product).toHaveProperty('retail_price')
      expect(product).toHaveProperty('stock_quantity')
      expect(product).toHaveProperty('category_id')
      expect(product).toHaveProperty('category')
      expect(product).toHaveProperty('images')
      expect(product).toHaveProperty('is_vegan')
      expect(product).toHaveProperty('is_vegetarian')
      expect(product).toHaveProperty('is_gluten_free')
      expect(product).toHaveProperty('pack_size')
      expect(product).toHaveProperty('brand')
    })

    it('accepts query params (franchise_id)', async () => {
      const products = await productService.getProducts({ franchise_id: 'some-franchise-id' })
      expect(Array.isArray(products)).toBe(true)
    })
  })

  describe('getProduct', () => {
    it('returns a single product with full details', async () => {
      const product = await productService.getProduct(mockProduct.id)
      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('item_name')
      expect(product).toHaveProperty('retail_price')
      expect(product).toHaveProperty('images')
      expect(product).toHaveProperty('category')
      expect(product.category).toHaveProperty('name')
    })

    it('accepts optional params (franchise_id)', async () => {
      const product = await productService.getProduct(mockProduct.id, { franchise_id: 'test-franchise' })
      expect(product).toHaveProperty('id')
    })
  })

  describe('getCategories', () => {
    it('returns array of categories', async () => {
      const categories = await productService.getCategories()
      expect(Array.isArray(categories)).toBe(true)
      expect(categories.length).toBeGreaterThan(0)
      expect(categories[0]).toHaveProperty('id')
      expect(categories[0]).toHaveProperty('name')
      expect(categories[0]).toHaveProperty('icon')
    })
  })

  describe('getPromotions', () => {
    it('returns array of promotions', async () => {
      const promotions = await productService.getPromotions()
      expect(Array.isArray(promotions)).toBe(true)
      expect(promotions[0]).toHaveProperty('id')
      expect(promotions[0]).toHaveProperty('title')
      expect(promotions[0]).toHaveProperty('is_active')
    })
  })
})
