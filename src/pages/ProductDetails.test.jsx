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
import ProductDetails from './ProductDetails'
import { mockProduct, mockProduct2 } from '../test/mocks/fixtures'

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

function renderProductDetails(productId = mockProduct.id, store = null) {
  const s = store || createStore()
  return render(
    <Provider store={s}>
      <MemoryRouter initialEntries={[`/product/${productId}`]}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('ProductDetails page', () => {
  it('renders loading state initially', () => {
    renderProductDetails()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays product name, brand, and price after loading', async () => {
    renderProductDetails()

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // mockProduct: item_name = 'Organic Broccoli', brand = 'FarmFresh', retail_price = 2.99
    expect(screen.getByText('Organic Broccoli')).toBeInTheDocument()
    expect(screen.getByText('FarmFresh')).toBeInTheDocument()
    // Price appears in the price display and also in the Add to cart button
    const priceElements = screen.getAllByText(/£2\.99/)
    expect(priceElements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders product image with correct alt text', async () => {
    renderProductDetails()

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    const img = screen.getByAltText('Organic Broccoli')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/broccoli.png')
  })

  it('adds product to cart and opens cart drawer', async () => {
    const user = userEvent.setup()
    const store = createStore()
    renderProductDetails(mockProduct.id, store)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // "Add to cart" button with price
    const addButton = screen.getByRole('button', { name: /Add to cart/ })
    expect(addButton).toBeInTheDocument()
    await user.click(addButton)

    // Cart should have one item and be open
    const state = store.getState()
    expect(state.cart.items).toHaveLength(1)
    expect(state.cart.items[0].name).toBe('Organic Broccoli')
    expect(state.cart.isOpen).toBe(true)
  })

  it('updates quantity with increase and decrease buttons', async () => {
    const user = userEvent.setup()
    renderProductDetails()

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // Default quantity is 1
    expect(screen.getByText('1')).toBeInTheDocument()

    // Increase quantity
    const increaseButton = screen.getByLabelText('Increase quantity')
    await user.click(increaseButton)
    expect(screen.getByText('2')).toBeInTheDocument()

    await user.click(increaseButton)
    expect(screen.getByText('3')).toBeInTheDocument()

    // Decrease quantity
    const decreaseButton = screen.getByLabelText('Decrease quantity')
    await user.click(decreaseButton)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('displays dietary badges and description', async () => {
    renderProductDetails()

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // mockProduct: is_vegan=true, is_vegetarian=true, is_gluten_free=true
    expect(screen.getByText('Vegan')).toBeInTheDocument()
    expect(screen.getByText('Vegetarian')).toBeInTheDocument()
    expect(screen.getByText('Gluten Free')).toBeInTheDocument()

    // Description
    expect(screen.getByText('Fresh organic broccoli')).toBeInTheDocument()
  })

  it('shows product not found state for invalid product', async () => {
    server.use(
      http.get(`${BASE}/products/:id`, () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 })
      })
    )

    renderProductDetails('nonexistent-id')

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Product not found')).toBeInTheDocument()
    expect(screen.getByText(/doesn't exist or removed/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Back home/ })).toBeInTheDocument()
  })

  it('shows out of stock state when stock_quantity is 0', async () => {
    server.use(
      http.get(`${BASE}/products/:id`, () => {
        return HttpResponse.json({ ...mockProduct, stock_quantity: 0 })
      })
    )

    renderProductDetails()

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Out of stock')).toBeInTheDocument()
    expect(screen.getByText('Currently out of stock')).toBeInTheDocument()
    // Add to cart button should not be present
    expect(screen.queryByRole('button', { name: /Add to cart/ })).not.toBeInTheDocument()
  })
})
