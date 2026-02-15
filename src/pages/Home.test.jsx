import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { http, HttpResponse } from 'msw'
import { server } from '../test/mocks/server'
import authReducer from '../store/slices/authSlice'
import cartReducer from '../store/slices/cartSlice'
import loyaltyReducer from '../store/slices/loyaltySlice'
import franchiseReducer from '../store/slices/franchiseSlice'
import Home from './Home'
import { mockCategories, mockPromotions, mockFranchise } from '../test/mocks/fixtures'

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

function renderHome(store) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </Provider>
  )
}

describe('Home page', () => {
  it('renders loading state initially', () => {
    const store = createStore()
    renderHome(store)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders categories after data loads', async () => {
    const store = createStore()
    renderHome(store)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Categories section heading
    expect(screen.getByText('Browse categories')).toBeInTheDocument()

    // Real category names from fixture
    expect(screen.getByText('Beverages')).toBeInTheDocument()
    // "Fresh Produce & Veg" appears in both category grid and product badges
    expect(screen.getAllByText(/Fresh Produce/).length).toBeGreaterThan(0)
  })

  it('renders promotions carousel after data loads', async () => {
    const store = createStore()
    renderHome(store)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Promotion title from fixture
    expect(screen.getByText('Summer Sale')).toBeInTheDocument()
    // Navigation buttons
    expect(screen.getByLabelText('Previous slide')).toBeInTheDocument()
    expect(screen.getByLabelText('Next slide')).toBeInTheDocument()
  })

  it('renders product names in the Best sellers section', async () => {
    const store = createStore()
    renderHome(store)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Best sellers')).toBeInTheDocument()
    // Product names from fixtures are rendered by ProductCard
    expect(screen.getAllByText('Organic Broccoli').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Almond Milk').length).toBeGreaterThan(0)
  })

  it('shows location prompt when no franchise is selected', async () => {
    const store = createStore()
    renderHome(store)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Set your delivery location')).toBeInTheDocument()
    expect(screen.getByText(/See products available near you/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Set location' })).toBeInTheDocument()
  })

  it('hides location prompt when a franchise is selected', async () => {
    const store = createStore({
      franchise: {
        selectedFranchise: mockFranchise,
        nearbyFranchises: [],
        customerLocation: { lat: 51.5074, lng: -0.1278 },
        locationLoading: false,
        locationError: null,
      },
    })
    renderHome(store)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(screen.queryByText('Set your delivery location')).not.toBeInTheDocument()
  })

  it('shows "Order again" section when user is authenticated', async () => {
    const store = createStore({
      auth: {
        user: { id: 'user-1', email: 'test@test.com', role: 'customer' },
        isAuthenticated: true,
        isLoading: false,
      },
    })
    renderHome(store)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Order again')).toBeInTheDocument()
  })

  it('hides "Order again" section when user is not authenticated', async () => {
    const store = createStore()
    renderHome(store)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(screen.queryByText('Order again')).not.toBeInTheDocument()
  })

  it('handles API error gracefully', async () => {
    server.use(
      http.get(`${BASE}/products`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      }),
      http.get(`${BASE}/categories`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      }),
      http.get(`${BASE}/promotions`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    const store = createStore()
    renderHome(store)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Page should still render without crashing (empty data)
    expect(screen.getByText('Browse categories')).toBeInTheDocument()
    expect(screen.getByText('Best sellers')).toBeInTheDocument()
  })
})
