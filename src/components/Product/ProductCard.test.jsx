import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../../store/slices/cartSlice'
import ProductCard from './ProductCard'
import { mockProduct, mockProduct2 } from '../../test/mocks/fixtures'

function createStore(preloadedItems = []) {
  return configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: { items: preloadedItems, isOpen: false } },
  })
}

function renderProductCard(product, store = null) {
  const s = store || createStore()
  return render(
    <Provider store={s}>
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>
    </Provider>
  )
}

describe('ProductCard', () => {
  it('renders product name, price, brand, and image', () => {
    renderProductCard(mockProduct)

    // item_name = 'Organic Broccoli'
    expect(screen.getByText('Organic Broccoli')).toBeInTheDocument()
    // retail_price = 2.99
    expect(screen.getByText(/2\.99/)).toBeInTheDocument()
    // brand
    expect(screen.getByText('FarmFresh')).toBeInTheDocument()
    // Image with correct alt
    const img = screen.getByAltText('Organic Broccoli')
    expect(img).toHaveAttribute('src', 'https://example.com/broccoli.png')
  })

  it('dispatches addItem and openCart when quick-add button is clicked', async () => {
    const user = userEvent.setup()
    const store = createStore()
    renderProductCard(mockProduct, store)

    const addButton = screen.getByLabelText('Add Organic Broccoli to cart')
    await user.click(addButton)

    const state = store.getState()
    expect(state.cart.items).toHaveLength(1)
    expect(state.cart.items[0].name).toBe('Organic Broccoli')
    expect(state.cart.items[0].price).toBe(2.99)
    expect(state.cart.isOpen).toBe(true)
  })

  it('renders a link to the product detail page', () => {
    renderProductCard(mockProduct)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/product/${mockProduct.id}`)
  })

  it('shows promotion price when promotion_price is set', () => {
    // mockProduct2 has promotion_price: 2.99 and retail_price: 3.49
    renderProductCard(mockProduct2)

    // The promo price should be displayed
    expect(screen.getByText(/2\.99/)).toBeInTheDocument()
    // The original price should appear with line-through
    expect(screen.getByText(/3\.49/)).toBeInTheDocument()
    // OFFER badge should appear
    expect(screen.getByText('OFFER')).toBeInTheDocument()
  })

  it('shows out of stock badge when stock_quantity is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock_quantity: 0 }
    renderProductCard(outOfStockProduct)

    expect(screen.getByText('Out of stock')).toBeInTheDocument()
    // Quick-add button should not be present
    expect(screen.queryByLabelText('Add Organic Broccoli to cart')).not.toBeInTheDocument()
  })
})
