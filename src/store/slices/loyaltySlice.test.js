import { describe, it, expect } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import loyaltyReducer, {
  setPoints,
  addPoints,
  redeemPoints,
  setCustomerId,
  selectPoints,
  selectCustomerId,
  selectLoyaltyHistory,
} from './loyaltySlice'

function createStore(preloaded) {
  return configureStore({
    reducer: { loyalty: loyaltyReducer },
    preloadedState: preloaded ? { loyalty: preloaded } : undefined,
  })
}

describe('loyaltySlice', () => {
  describe('initial state', () => {
    it('starts with 0 points, empty history, and null customerId', () => {
      const store = createStore()
      expect(selectPoints(store.getState())).toBe(0)
      expect(selectLoyaltyHistory(store.getState())).toEqual([])
      expect(selectCustomerId(store.getState())).toBeNull()
    })
  })

  describe('addPoints', () => {
    it('adds points and records an earned history entry', () => {
      const store = createStore()
      store.dispatch(addPoints({ amount: 50, description: 'Order points' }))

      expect(selectPoints(store.getState())).toBe(50)

      const history = selectLoyaltyHistory(store.getState())
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('earned')
      expect(history[0].amount).toBe(50)
      expect(history[0].description).toBe('Order points')
      expect(history[0]).toHaveProperty('id')
      expect(history[0]).toHaveProperty('date')
    })

    it('accumulates points across multiple additions', () => {
      const store = createStore()
      store.dispatch(addPoints({ amount: 30, description: 'First order' }))
      store.dispatch(addPoints({ amount: 20, description: 'Second order' }))

      expect(selectPoints(store.getState())).toBe(50)
      expect(selectLoyaltyHistory(store.getState())).toHaveLength(2)
      // Most recent entry should be first (unshift)
      expect(selectLoyaltyHistory(store.getState())[0].description).toBe('Second order')
    })
  })

  describe('redeemPoints', () => {
    it('subtracts points and records a redeemed history entry', () => {
      const store = createStore({ points: 100, history: [], customerId: null })
      store.dispatch(redeemPoints({ amount: 25, description: 'Discount applied' }))

      expect(selectPoints(store.getState())).toBe(75)

      const history = selectLoyaltyHistory(store.getState())
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('redeemed')
      expect(history[0].amount).toBe(25)
      expect(history[0].description).toBe('Discount applied')
    })
  })
})
