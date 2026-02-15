import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../store/slices/authSlice'
import ProtectedRoute from './ProtectedRoute'

// Provide a robust localStorage mock
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

function createStore(authState) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: authState },
  })
}

function renderWithProviders(store, initialEntries = ['/protected']) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<div>Home (redirected)</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('renders children when user is authenticated via Redux state', () => {
    const store = createStore({
      user: { id: 'test-id', email: 'test@test.com', role: 'customer' },
      isAuthenticated: true,
      isLoading: false,
    })
    renderWithProviders(store)
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders children when user has a token in localStorage (even if Redux is not authenticated)', () => {
    // This covers the case where the page reloads and Redux state is lost
    // but token is still in localStorage
    localStorageMock.setItem('token', 'mock-jwt-token-for-testing')
    const store = createStore({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
    renderWithProviders(store)
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to home when not authenticated and no token', () => {
    const store = createStore({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
    renderWithProviders(store)
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByText('Home (redirected)')).toBeInTheDocument()
  })
})
