import { describe, it, expect } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import cartReducer, {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
  selectIsCartOpen,
} from './cartSlice'
import { mockProduct, mockProduct2 } from '../../test/mocks/fixtures'

function createStore(preloadedItems = []) {
  return configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: { items: preloadedItems, isOpen: false } },
  })
}

describe('cartSlice', () => {
  describe('addItem', () => {
    it('adds a new item to cart', () => {
      const store = createStore()
      store.dispatch(addItem({ ...mockProduct, name: 'Organic Broccoli', price: 2.99, quantity: 1 }))
      const items = selectCartItems(store.getState())
      expect(items).toHaveLength(1)
      expect(items[0].price).toBe(2.99)
    })

    it('increases quantity for existing item', () => {
      const store = createStore()
      store.dispatch(addItem({ ...mockProduct, name: 'Organic Broccoli', price: 2.99, quantity: 1 }))
      store.dispatch(addItem({ ...mockProduct, name: 'Organic Broccoli', price: 2.99, quantity: 2 }))
      const items = selectCartItems(store.getState())
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(3)
    })

    it('adds multiple different items', () => {
      const store = createStore()
      store.dispatch(addItem({ ...mockProduct, price: 2.99, quantity: 1 }))
      store.dispatch(addItem({ ...mockProduct2, price: 3.49, quantity: 1 }))
      expect(selectCartItems(store.getState())).toHaveLength(2)
    })
  })

  describe('removeItem', () => {
    it('removes item from cart', () => {
      const store = createStore([{ ...mockProduct, price: 2.99, quantity: 1 }])
      store.dispatch(removeItem(mockProduct.id))
      expect(selectCartItems(store.getState())).toHaveLength(0)
    })
  })

  describe('updateQuantity', () => {
    it('updates quantity of existing item', () => {
      const store = createStore([{ ...mockProduct, price: 2.99, quantity: 1 }])
      store.dispatch(updateQuantity({ id: mockProduct.id, quantity: 5 }))
      expect(selectCartItems(store.getState())[0].quantity).toBe(5)
    })

    it('removes item when quantity set to 0', () => {
      const store = createStore([{ ...mockProduct, price: 2.99, quantity: 1 }])
      store.dispatch(updateQuantity({ id: mockProduct.id, quantity: 0 }))
      expect(selectCartItems(store.getState())).toHaveLength(0)
    })
  })

  describe('clearCart', () => {
    it('removes all items', () => {
      const store = createStore([
        { ...mockProduct, price: 2.99, quantity: 1 },
        { ...mockProduct2, price: 3.49, quantity: 2 },
      ])
      store.dispatch(clearCart())
      expect(selectCartItems(store.getState())).toHaveLength(0)
    })
  })

  describe('cart open/close', () => {
    it('toggleCart flips isOpen', () => {
      const store = createStore()
      expect(selectIsCartOpen(store.getState())).toBe(false)
      store.dispatch(toggleCart())
      expect(selectIsCartOpen(store.getState())).toBe(true)
      store.dispatch(toggleCart())
      expect(selectIsCartOpen(store.getState())).toBe(false)
    })

    it('openCart/closeCart', () => {
      const store = createStore()
      store.dispatch(openCart())
      expect(selectIsCartOpen(store.getState())).toBe(true)
      store.dispatch(closeCart())
      expect(selectIsCartOpen(store.getState())).toBe(false)
    })
  })

  describe('selectors', () => {
    it('selectCartTotal computes correctly', () => {
      const store = createStore([
        { ...mockProduct, price: 2.99, quantity: 3 },
        { ...mockProduct2, price: 3.49, quantity: 1 },
      ])
      const total = selectCartTotal(store.getState())
      expect(total).toBeCloseTo(2.99 * 3 + 3.49, 2)
    })

    it('selectCartItemCount sums quantities', () => {
      const store = createStore([
        { ...mockProduct, price: 2.99, quantity: 3 },
        { ...mockProduct2, price: 3.49, quantity: 2 },
      ])
      expect(selectCartItemCount(store.getState())).toBe(5)
    })
  })
})
