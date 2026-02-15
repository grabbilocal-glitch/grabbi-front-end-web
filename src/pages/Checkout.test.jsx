import { describe, it, expect, vi } from 'vitest'
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
import Checkout from './Checkout'
import { mockProduct, mockProduct2, mockFranchise } from '../test/mocks/fixtures'

const BASE = '*/api'

// Cart items shaped as the cartSlice expects (with name and price)
const cartItem1 = { ...mockProduct, name: 'Organic Broccoli', price: 2.99, quantity: 2 }
const cartItem2 = { ...mockProduct2, name: 'Almond Milk', price: 3.49, quantity: 1 }

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
      cart: { items: [cartItem1, cartItem2], isOpen: false },
      loyalty: { points: 0, history: [], customerId: null },
      franchise: {
        selectedFranchise: mockFranchise,
        nearbyFranchises: [],
        customerLocation: { lat: 51.5074, lng: -0.1278 },
        locationLoading: false,
        locationError: null,
      },
      ...overrides,
    },
  })
}

function renderCheckout(store) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/" element={<div>Home page</div>} />
          <Route path="/order/:orderId" element={<div>Order tracking</div>} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('Checkout page', () => {
  it('renders checkout step indicators', () => {
    const store = createStore()
    renderCheckout(store)

    expect(screen.getByText('Address')).toBeInTheDocument()
    expect(screen.getByText('Payment')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('renders the delivery address form on step 1', () => {
    const store = createStore()
    renderCheckout(store)

    expect(screen.getByRole('heading', { name: 'Delivery address' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your delivery address')).toBeInTheDocument()
    expect(screen.getByText('Continue to payment')).toBeInTheDocument()
  })

  it('renders the map picker component', () => {
    const store = createStore()
    renderCheckout(store)

    // MapContainer is mocked to render data-testid="map-container"
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('shows order summary with cart items', () => {
    const store = createStore()
    renderCheckout(store)

    expect(screen.getByText('Order summary')).toBeInTheDocument()
    expect(screen.getByText(/Organic Broccoli/)).toBeInTheDocument()
    expect(screen.getByText(/Almond Milk/)).toBeInTheDocument()
    expect(screen.getByText('2 items')).toBeInTheDocument()
  })

  it('shows validation error when address is empty and Continue is clicked', async () => {
    const user = userEvent.setup()
    const store = createStore()
    renderCheckout(store)

    await user.click(screen.getByText('Continue to payment'))

    // Toast shows validation error
    await waitFor(() => {
      expect(screen.getByText('Please enter an address')).toBeInTheDocument()
    })
  })

  it('advances to payment step when address is provided', async () => {
    const user = userEvent.setup()
    const store = createStore()
    renderCheckout(store)

    await user.type(screen.getByPlaceholderText('Your delivery address'), '123 Test St, London')
    await user.click(screen.getByText('Continue to payment'))

    await waitFor(() => {
      expect(screen.getByText('Payment details')).toBeInTheDocument()
    })
    expect(screen.getByText(/Demo mode/)).toBeInTheDocument()
  })

  it('shows payment validation errors for invalid card data', async () => {
    const user = userEvent.setup()
    const store = createStore()
    renderCheckout(store)

    // Step 1: fill address and continue
    await user.type(screen.getByPlaceholderText('Your delivery address'), '123 Test St, London')
    await user.click(screen.getByText('Continue to payment'))

    await waitFor(() => {
      expect(screen.getByText('Payment details')).toBeInTheDocument()
    })

    // Step 2: click Complete order without filling payment fields
    await user.click(screen.getByText('Complete order'))

    await waitFor(() => {
      expect(screen.getByText('Card number must be 16 digits')).toBeInTheDocument()
      expect(screen.getByText('Expiry must be MM/YY format')).toBeInTheDocument()
      expect(screen.getByText('CVV must be 3 digits')).toBeInTheDocument()
      expect(screen.getByText('Cardholder name is required')).toBeInTheDocument()
    })
  })

  it('shows Processing... text while order is submitting', async () => {
    // Delay the order API response so we can observe the submitting state
    server.use(
      http.post(`${BASE}/orders`, async () => {
        await new Promise((r) => setTimeout(r, 500))
        return HttpResponse.json({ id: 'delayed-order' }, { status: 201 })
      })
    )

    const user = userEvent.setup()
    const store = createStore({
      auth: { user: { id: 'u1', email: 'test@test.com', role: 'customer' }, isAuthenticated: true, isLoading: false },
      cart: { items: [cartItem1], isOpen: false },
      loyalty: { points: 0, history: [], customerId: null },
      franchise: {
        selectedFranchise: mockFranchise,
        nearbyFranchises: [],
        customerLocation: { lat: 51.5074, lng: -0.1278 },
        locationLoading: false,
        locationError: null,
      },
    })
    renderCheckout(store)

    // Step 1
    await user.type(screen.getByPlaceholderText('Your delivery address'), '123 Test St, London')
    await user.click(screen.getByText('Continue to payment'))

    await waitFor(() => {
      expect(screen.getByText('Payment details')).toBeInTheDocument()
    })

    // Step 2: fill valid payment data
    await user.type(screen.getByPlaceholderText('1234 5678 9012 3456'), '1234567890123456')
    await user.type(screen.getByPlaceholderText('MM/YY'), '12/26')
    await user.type(screen.getByPlaceholderText('123'), '123')
    await user.type(screen.getByPlaceholderText('Jane Doe'), 'Test User')
    await user.click(screen.getByText('Complete order'))

    // Button should show "Processing..." during submission
    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })
  })

  it('shows error toast when order API fails', async () => {
    server.use(
      http.post(`${BASE}/orders`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    const user = userEvent.setup()
    const store = createStore({
      auth: { user: { id: 'u1', email: 'test@test.com', role: 'customer' }, isAuthenticated: true, isLoading: false },
      cart: { items: [cartItem1], isOpen: false },
      loyalty: { points: 0, history: [], customerId: null },
      franchise: {
        selectedFranchise: mockFranchise,
        nearbyFranchises: [],
        customerLocation: { lat: 51.5074, lng: -0.1278 },
        locationLoading: false,
        locationError: null,
      },
    })
    renderCheckout(store)

    await user.type(screen.getByPlaceholderText('Your delivery address'), '123 Test St')
    await user.click(screen.getByText('Continue to payment'))

    await waitFor(() => {
      expect(screen.getByText('Payment details')).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('1234 5678 9012 3456'), '1234567890123456')
    await user.type(screen.getByPlaceholderText('MM/YY'), '12/26')
    await user.type(screen.getByPlaceholderText('123'), '123')
    await user.type(screen.getByPlaceholderText('Jane Doe'), 'Test User')
    await user.click(screen.getByText('Complete order'))

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })

  it('redirects to home when cart is empty', async () => {
    const store = createStore({
      cart: { items: [], isOpen: false },
    })
    renderCheckout(store)

    await waitFor(() => {
      expect(screen.getByText('Home page')).toBeInTheDocument()
    })
  })
})
