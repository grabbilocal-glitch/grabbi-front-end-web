import { describe, it, expect } from 'vitest'
import { franchiseService } from './franchiseService'
import { mockFranchise, mockProducts, mockPromotions } from '../test/mocks/fixtures'

describe('franchiseService', () => {
  describe('getNearestFranchise', () => {
    it('returns franchise with distance', async () => {
      const result = await franchiseService.getNearestFranchise(51.54, -0.14)
      expect(result).toHaveProperty('franchise')
      expect(result).toHaveProperty('distance')
      expect(result.franchise).toHaveProperty('id')
      expect(result.franchise).toHaveProperty('name')
      expect(result.franchise).toHaveProperty('latitude')
      expect(result.franchise).toHaveProperty('longitude')
      expect(result.franchise).toHaveProperty('delivery_radius')
      expect(result.franchise).toHaveProperty('delivery_fee')
      expect(result.franchise).toHaveProperty('free_delivery_min')
      expect(result.franchise).toHaveProperty('is_active')
    })
  })

  describe('getFranchise', () => {
    it('returns franchise details', async () => {
      const franchise = await franchiseService.getFranchise(mockFranchise.id)
      expect(franchise).toHaveProperty('id')
      expect(franchise).toHaveProperty('name')
      expect(franchise).toHaveProperty('address')
      expect(franchise).toHaveProperty('city')
      expect(franchise).toHaveProperty('delivery_fee')
      expect(franchise.name).toBe('Grabbi Main Store')
    })
  })

  describe('getFranchiseProducts', () => {
    it('returns array of products for franchise', async () => {
      const products = await franchiseService.getFranchiseProducts(mockFranchise.id)
      expect(Array.isArray(products)).toBe(true)
      expect(products.length).toBeGreaterThan(0)
      expect(products[0]).toHaveProperty('item_name')
      expect(products[0]).toHaveProperty('retail_price')
    })

    it('accepts optional params', async () => {
      const products = await franchiseService.getFranchiseProducts(mockFranchise.id, { search: 'broccoli' })
      expect(Array.isArray(products)).toBe(true)
    })
  })

  describe('getFranchisePromotions', () => {
    it('returns array of promotions for franchise', async () => {
      const promotions = await franchiseService.getFranchisePromotions(mockFranchise.id)
      expect(Array.isArray(promotions)).toBe(true)
    })
  })
})
