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
import CategoryPage from './CategoryPage'
import { mockProducts } from '../test/mocks/fixtures'

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

function renderCategoryPage(categoryName = 'all', search = '', store = null) {
  const s = store || createStore()
  const entry = search
    ? `/category/${categoryName}?search=${encodeURIComponent(search)}`
    : `/category/${categoryName}`

  return render(
    <Provider store={s}>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/product/:id" element={<div>Product detail</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('CategoryPage', () => {
  it('renders loading state initially', () => {
    renderCategoryPage()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders products grid after data loads', async () => {
    renderCategoryPage()

    // Wait for products to load AND filteredProducts to be set
    await waitFor(() => {
      expect(screen.getByText('Organic Broccoli')).toBeInTheDocument()
    })

    expect(screen.getByText('Almond Milk')).toBeInTheDocument()
    // Items count text
    expect(screen.getByText(/Showing 2 items/)).toBeInTheDocument()
  })

  it('shows empty state when no products match category', async () => {
    // Use a category ID that does not match any product's category_id
    renderCategoryPage('nonexistent-category-id')

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('No products found. Try adjusting filters.')).toBeInTheDocument()
    expect(screen.getByText('Showing 0 items')).toBeInTheDocument()
  })

  it('filters products by search query', async () => {
    renderCategoryPage('all', 'Broccoli')

    // Wait for products to load AND filteredProducts to be set
    await waitFor(() => {
      expect(screen.getByText('Organic Broccoli')).toBeInTheDocument()
    })

    // Almond Milk should not appear because search is "Broccoli"
    expect(screen.queryByText('Almond Milk')).not.toBeInTheDocument()
    expect(screen.getByText(/Showing 1 item/)).toBeInTheDocument()
    expect(screen.getByText(/Search:/)).toBeInTheDocument()
  })

  it('handles API error gracefully by showing empty state', async () => {
    server.use(
      http.get(`${BASE}/products`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    renderCategoryPage()

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('No products found. Try adjusting filters.')).toBeInTheDocument()
  })

  it('renders catalog breadcrumb heading', async () => {
    renderCategoryPage()

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Catalog')).toBeInTheDocument()
    // categoryName=all renders "All products"
    expect(screen.getByText('All products')).toBeInTheDocument()
  })
})
