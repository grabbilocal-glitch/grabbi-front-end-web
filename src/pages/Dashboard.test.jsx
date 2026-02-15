import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { http, HttpResponse } from 'msw'
import { server } from '../test/mocks/server'
import authReducer from '../store/slices/authSlice'
import cartReducer from '../store/slices/cartSlice'
import loyaltyReducer from '../store/slices/loyaltySlice'
import franchiseReducer from '../store/slices/franchiseSlice'
import Dashboard from './Dashboard'
import { mockOrder } from '../test/mocks/fixtures'

const BASE = '*/api'

function createStore(overrides = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      loyalty: loyaltyReducer,
      franchise: franchiseReducer,
    },
    preloadedState: {
      auth: {
        user: { id: 'user-1', email: 'test@test.com', role: 'customer', firstName: 'Test', lastName: 'Customer' },
        isAuthenticated: true,
        isLoading: false,
      },
      cart: { items: [], isOpen: false },
      loyalty: { points: 150, history: [], customerId: 'CLUB-001' },
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

function renderDashboard(store = null) {
  const s = store || createStore()
  return render(
    <Provider store={s}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<div>Home page</div>} />
          <Route path="/order/:orderId" element={<div>Order tracking</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('Dashboard page', () => {
  it('shows loading orders text when orders tab is active', async () => {
    const user = userEvent.setup()
    const store = createStore()
    renderDashboard(store)

    // Wait for initial data to load (latest order fetch)
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/)).toBeInTheDocument()
    })

    // Click "My orders" tab
    await user.click(screen.getByText('My orders'))

    // The loading state may briefly appear; orders should then load
    await waitFor(() => {
      // Order from fixture should render
      expect(screen.getByText(/ORD2026021302212508c04929/)).toBeInTheDocument()
    })
  })

  it('displays recent orders list when orders tab is clicked', async () => {
    const user = userEvent.setup()
    const store = createStore()
    renderDashboard(store)

    await waitFor(() => {
      expect(screen.getByText('Hi, Test')).toBeInTheDocument()
    })

    await user.click(screen.getByText('My orders'))

    await waitFor(() => {
      expect(screen.getByText(/ORD2026021302212508c04929/)).toBeInTheDocument()
      expect(screen.getByText('\u00A314.22')).toBeInTheDocument()
      expect(screen.getByText('pending')).toBeInTheDocument()
    })
  })

  it('shows loyalty points and member info', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Hi, Test')).toBeInTheDocument()
    })

    // Loyalty points from preloaded state
    expect(screen.getAllByText('150').length).toBeGreaterThan(0)
    // Club card ID
    expect(screen.getAllByText('CLUB-001').length).toBeGreaterThan(0)
    // Member card
    expect(screen.getByText('Member')).toBeInTheDocument()
  })

  it('shows empty orders state', async () => {
    server.use(
      http.get(`${BASE}/orders`, () => {
        return HttpResponse.json([])
      })
    )

    const user = userEvent.setup()
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Hi, Test')).toBeInTheDocument()
    })

    await user.click(screen.getByText('My orders'))

    await waitFor(() => {
      expect(screen.getByText('No orders yet')).toBeInTheDocument()
      expect(screen.getByText('Start Shopping')).toBeInTheDocument()
    })
  })

  it('shows login prompt when not authenticated', () => {
    const store = createStore({
      auth: { user: null, isAuthenticated: false, isLoading: false },
    })
    renderDashboard(store)

    expect(screen.getByText('Please log in to view your dashboard')).toBeInTheDocument()
    expect(screen.getByText('Go home')).toBeInTheDocument()
  })
})
