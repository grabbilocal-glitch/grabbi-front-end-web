import { describe, it, expect } from 'vitest'
import { orderService } from './orderService'
import { mockOrder, mockFranchise, mockProduct } from '../test/mocks/fixtures'

describe('orderService', () => {
  describe('createOrder', () => {
    it('creates an order and returns order data with id', async () => {
      const result = await orderService.createOrder({
        franchise_id: mockFranchise.id,
        customer_lat: 51.54,
        customer_lng: -0.14,
        delivery_address: '123 Camden Rd, London NW1',
        items: [{ product_id: mockProduct.id, quantity: 2 }],
      })
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('order_number')
      expect(result).toHaveProperty('status')
      expect(result).toHaveProperty('subtotal')
      expect(result).toHaveProperty('delivery_fee')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('items')
      expect(result).toHaveProperty('user_id')
      expect(result).toHaveProperty('points_earned')
      expect(result.status).toBe('pending')
    })

    it('returns items array with product details', async () => {
      const result = await orderService.createOrder({
        franchise_id: mockFranchise.id,
        delivery_address: 'Test Address',
        items: [{ product_id: mockProduct.id, quantity: 1 }],
      })
      expect(result.items.length).toBeGreaterThan(0)
      expect(result.items[0]).toHaveProperty('product_id')
      expect(result.items[0]).toHaveProperty('quantity')
      expect(result.items[0]).toHaveProperty('price')
    })
  })

  describe('getOrder', () => {
    it('returns order details by id', async () => {
      const order = await orderService.getOrder(mockOrder.id)
      expect(order).toHaveProperty('id')
      expect(order).toHaveProperty('order_number')
      expect(order).toHaveProperty('status')
      expect(order).toHaveProperty('total')
      expect(order).toHaveProperty('delivery_address')
      expect(order).toHaveProperty('items')
    })
  })
})
