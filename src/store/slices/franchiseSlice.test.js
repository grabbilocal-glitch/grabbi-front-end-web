import { describe, it, expect, beforeEach, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import franchiseReducer, {
  setSelectedFranchise,
  setNearbyFranchises,
  setCustomerLocation,
  setLocationLoading,
  setLocationError,
  clearFranchise,
  selectSelectedFranchise,
  selectCustomerLocation,
  selectLocationLoading,
  selectLocationError,
} from './franchiseSlice'
import { mockFranchise } from '../../test/mocks/fixtures'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

function createStore() {
  return configureStore({
    reducer: { franchise: franchiseReducer },
  })
}

describe('franchiseSlice', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('setSelectedFranchise', () => {
    it('sets the selected franchise', () => {
      const store = createStore()
      store.dispatch(setSelectedFranchise(mockFranchise))
      expect(selectSelectedFranchise(store.getState())).toEqual(mockFranchise)
    })

    it('saves franchise to localStorage', () => {
      const store = createStore()
      store.dispatch(setSelectedFranchise(mockFranchise))
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'selectedFranchise',
        JSON.stringify(mockFranchise)
      )
    })

    it('removes from localStorage when set to null', () => {
      const store = createStore()
      store.dispatch(setSelectedFranchise(null))
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('selectedFranchise')
    })
  })

  describe('setCustomerLocation', () => {
    it('sets customer coordinates', () => {
      const store = createStore()
      const location = { lat: 51.54, lng: -0.14 }
      store.dispatch(setCustomerLocation(location))
      expect(selectCustomerLocation(store.getState())).toEqual(location)
    })
  })

  describe('setLocationLoading / setLocationError', () => {
    it('tracks loading state', () => {
      const store = createStore()
      store.dispatch(setLocationLoading(true))
      expect(selectLocationLoading(store.getState())).toBe(true)
      store.dispatch(setLocationLoading(false))
      expect(selectLocationLoading(store.getState())).toBe(false)
    })

    it('tracks error state', () => {
      const store = createStore()
      store.dispatch(setLocationError('Not found'))
      expect(selectLocationError(store.getState())).toBe('Not found')
    })
  })

  describe('clearFranchise', () => {
    it('clears franchise and location', () => {
      const store = createStore()
      store.dispatch(setSelectedFranchise(mockFranchise))
      store.dispatch(setCustomerLocation({ lat: 51.54, lng: -0.14 }))
      store.dispatch(clearFranchise())
      expect(selectSelectedFranchise(store.getState())).toBeNull()
      expect(selectCustomerLocation(store.getState())).toBeNull()
    })
  })

  describe('setNearbyFranchises', () => {
    it('stores list of franchises', () => {
      const store = createStore()
      store.dispatch(setNearbyFranchises([mockFranchise]))
      expect(store.getState().franchise.nearbyFranchises).toHaveLength(1)
    })
  })
})
