import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../store/slices/authSlice'
import cartReducer from '../../store/slices/cartSlice'
import loyaltyReducer from '../../store/slices/loyaltySlice'
import franchiseReducer from '../../store/slices/franchiseSlice'
import Navbar from './Navbar'
import { mockProduct, mockFranchise } from '../../test/mocks/fixtures'

// Mock the ThemeContext to avoid localStorage issues in jsdom
vi.mock('../../contexts/ThemeContext', () => {
  const React = require('react')
  return {
    ThemeProvider: ({ children }) => children,
    useTheme: () => ({ theme: 'light', toggleTheme: () => {} }),
  }
})

function createStore(overrides = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      loyalty: loyaltyReducer,
      franchise: franchiseReducer,
    },
    preloadedState: {
      auth: { user: null, isAuthenticated: false, isLoading: false },
      cart: { items: [], isOpen: false },
      loyalty: { points: 0, history: [], customerId: null },
      franchise: {
        selectedFranchise: null,
        nearbyFranchises: [],
        customerLocation: null,
        locationLoading: false,
        locationError: null,
      },
      ...overrides,
    },
  })
}

function renderNavbar(store = null) {
  const s = store || createStore()
  return render(
    <Provider store={s}>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </Provider>
  )
}

describe('Navbar', () => {
  it('renders the logo with link to home', () => {
    renderNavbar()

    const logo = screen.getByAltText('GRABBI Logo')
    expect(logo).toBeInTheDocument()
    expect(screen.getByText('GRABBI')).toBeInTheDocument()
    expect(screen.getByText('Quick Commerce')).toBeInTheDocument()
  })

  it('renders the search bar', () => {
    renderNavbar()

    expect(screen.getByPlaceholderText('Search fresh, premium, ready in minutes...')).toBeInTheDocument()
  })

  it('shows cart badge with item count when cart has items', () => {
    const store = createStore({
      cart: {
        items: [{ ...mockProduct, name: 'Broccoli', price: 2.99, quantity: 3 }],
        isOpen: false,
      },
    })
    renderNavbar(store)

    // Badge showing count
    expect(screen.getByText('3')).toBeInTheDocument()
    // Aria label includes count
    expect(screen.getByLabelText('Shopping cart (3 items)')).toBeInTheDocument()
  })

  it('shows Sign in button when not authenticated', () => {
    renderNavbar()

    expect(screen.getByLabelText('Sign in')).toBeInTheDocument()
  })

  it('shows user account button when logged in', () => {
    const store = createStore({
      auth: {
        user: { id: 'u1', email: 'test@test.com', firstName: 'Jane', role: 'customer' },
        isAuthenticated: true,
        isLoading: false,
      },
      loyalty: { points: 75, history: [], customerId: null },
    })
    renderNavbar(store)

    // Account button shows user name
    expect(screen.getByLabelText('Jane')).toBeInTheDocument()
    // Loyalty points displayed for authenticated users
    expect(screen.getByText('75 pts')).toBeInTheDocument()
    expect(screen.getByText('Loyalty')).toBeInTheDocument()
  })

  it('shows location bar prompting to set location when no franchise selected', () => {
    renderNavbar()

    expect(screen.getByText(/Set your location for delivery/)).toBeInTheDocument()
    expect(screen.getByText('Set location')).toBeInTheDocument()
  })
})
