import { describe, it, expect, beforeEach, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, {
  setUser,
  logout,
  setLoading,
  selectUser,
  selectIsAuthenticated,
} from './authSlice'
import { mockLoginResponse } from '../../test/mocks/fixtures'

// Provide a robust localStorage mock that works regardless of jsdom or
// the globalThis override from franchiseSlice.test.js
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: (i) => Object.keys(store)[i] || null,
  }
})()

try {
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  })
} catch {
  globalThis.localStorage = localStorageMock
}

function createStore(preloadedAuth) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: preloadedAuth ? { auth: preloadedAuth } : undefined,
  })
}

describe('authSlice', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('starts with user null and not authenticated', () => {
      const store = createStore()
      expect(selectUser(store.getState())).toBeNull()
      expect(selectIsAuthenticated(store.getState())).toBe(false)
      expect(store.getState().auth.isLoading).toBe(false)
    })
  })

  describe('setUser', () => {
    it('sets user and marks as authenticated', () => {
      const store = createStore()
      const user = mockLoginResponse.user
      store.dispatch(setUser(user))
      expect(selectUser(store.getState())).toEqual(user)
      expect(selectIsAuthenticated(store.getState())).toBe(true)
    })

    it('user object has real API shape fields', () => {
      const store = createStore()
      store.dispatch(setUser(mockLoginResponse.user))
      const user = selectUser(store.getState())
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('role')
      expect(user).toHaveProperty('loyalty_points')
      expect(user.role).toBe('customer')
    })

    it('setting user to null clears authentication', () => {
      const store = createStore()
      store.dispatch(setUser(mockLoginResponse.user))
      expect(selectIsAuthenticated(store.getState())).toBe(true)
      store.dispatch(setUser(null))
      expect(selectUser(store.getState())).toBeNull()
      expect(selectIsAuthenticated(store.getState())).toBe(false)
    })
  })

  describe('logout', () => {
    it('clears user and authentication state', () => {
      const store = createStore({
        user: mockLoginResponse.user,
        isAuthenticated: true,
        isLoading: false,
      })
      expect(selectIsAuthenticated(store.getState())).toBe(true)
      store.dispatch(logout())
      expect(selectUser(store.getState())).toBeNull()
      expect(selectIsAuthenticated(store.getState())).toBe(false)
    })

    it('removes token and user from localStorage', () => {
      localStorageMock.setItem('token', 'mock-jwt-token-for-testing')
      localStorageMock.setItem('user', JSON.stringify(mockLoginResponse.user))
      vi.clearAllMocks() // clear the setItem call counts

      const store = createStore({
        user: mockLoginResponse.user,
        isAuthenticated: true,
        isLoading: false,
      })
      store.dispatch(logout())
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('setLoading', () => {
    it('tracks loading state', () => {
      const store = createStore()
      expect(store.getState().auth.isLoading).toBe(false)
      store.dispatch(setLoading(true))
      expect(store.getState().auth.isLoading).toBe(true)
      store.dispatch(setLoading(false))
      expect(store.getState().auth.isLoading).toBe(false)
    })
  })
})
