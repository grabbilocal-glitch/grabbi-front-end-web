import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../store/slices/authSlice'
import cartReducer from '../../store/slices/cartSlice'
import loyaltyReducer from '../../store/slices/loyaltySlice'
import franchiseReducer from '../../store/slices/franchiseSlice'
import CartDrawer from './CartDrawer'
import { mockProduct, mockProduct2 } from '../../test/mocks/fixtures'

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
      cart: { items: [cartItem1, cartItem2], isOpen: true },
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

function renderCartDrawer(store) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CartDrawer />} />
          <Route path="/checkout" element={<div>Checkout page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('CartDrawer', () => {
  it('renders nothing when cart is closed', () => {
    const store = createStore({ cart: { items: [cartItem1], isOpen: false } })
    const { container } = renderCartDrawer(store)

    // CartDrawer returns null when isOpen is false
    expect(container.innerHTML).toBe('')
  })

  it('renders cart items list when open', () => {
    const store = createStore()
    renderCartDrawer(store)

    expect(screen.getByText('GRABBI Cart')).toBeInTheDocument()
    expect(screen.getByText('Organic Broccoli')).toBeInTheDocument()
    expect(screen.getByText('Almond Milk')).toBeInTheDocument()
  })

  it('increases item quantity when plus button is clicked', async () => {
    const user = userEvent.setup()
    const store = createStore()
    renderCartDrawer(store)

    // Find increase buttons (there are 2 items, each has one)
    const increaseButtons = screen.getAllByLabelText('Increase quantity')
    await user.click(increaseButtons[0]) // Increase first item (Organic Broccoli)

    // Quantity should now be 3
    const state = store.getState()
    const item = state.cart.items.find((i) => i.id === mockProduct.id)
    expect(item.quantity).toBe(3)
  })

  it('decreases item quantity when minus button is clicked', async () => {
    const user = userEvent.setup()
    const store = createStore()
    renderCartDrawer(store)

    const decreaseButtons = screen.getAllByLabelText('Decrease quantity')
    await user.click(decreaseButtons[0]) // Decrease first item from 2 to 1

    const state = store.getState()
    const item = state.cart.items.find((i) => i.id === mockProduct.id)
    expect(item.quantity).toBe(1)
  })

  it('removes item when trash button is clicked', async () => {
    const user = userEvent.setup()
    const store = createStore()
    renderCartDrawer(store)

    const removeButton = screen.getByLabelText('Remove Organic Broccoli from cart')
    await user.click(removeButton)

    const state = store.getState()
    expect(state.cart.items).toHaveLength(1)
    expect(state.cart.items[0].name).toBe('Almond Milk')
  })

  it('shows empty cart message when no items', () => {
    const store = createStore({ cart: { items: [], isOpen: true } })
    renderCartDrawer(store)

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    expect(screen.getByText('Add items to get started')).toBeInTheDocument()
    expect(screen.getByText('Start shopping')).toBeInTheDocument()
  })

  it('displays subtotal, delivery, and total correctly', () => {
    const store = createStore()
    renderCartDrawer(store)

    // Subtotal: 2.99*2 + 3.49*1 = 9.47
    expect(screen.getByText('\u00A39.47')).toBeInTheDocument()

    // Delivery: 9.47 < 50 (FREE_DELIVERY_THRESHOLD) so delivery fee = 4.99
    expect(screen.getByText('\u00A34.99')).toBeInTheDocument()

    // Total: 9.47 + 4.99 = 14.46
    expect(screen.getByText('\u00A314.46')).toBeInTheDocument()
  })

  it('closes the cart drawer when close button is clicked', async () => {
    const user = userEvent.setup()
    const store = createStore()
    renderCartDrawer(store)

    const closeButton = screen.getByLabelText('Close cart')
    await user.click(closeButton)

    expect(store.getState().cart.isOpen).toBe(false)
  })
})
