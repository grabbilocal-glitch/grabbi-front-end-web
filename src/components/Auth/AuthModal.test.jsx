import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/mocks/server'
import authReducer from '../../store/slices/authSlice'
import loyaltyReducer from '../../store/slices/loyaltySlice'
import AuthModal from './AuthModal'
import { mockLoginResponse, mockRegisterResponse } from '../../test/mocks/fixtures'

const BASE = '*/api'

function createStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      loyalty: loyaltyReducer,
    },
    preloadedState: {
      auth: { user: null, isAuthenticated: false, isLoading: false },
      loyalty: { points: 0, history: [], customerId: null },
    },
  })
}

function renderAuthModal(store = null, onClose = vi.fn()) {
  const s = store || createStore()
  return {
    onClose,
    ...render(
      <Provider store={s}>
        <AuthModal onClose={onClose} />
      </Provider>
    ),
  }
}

// Helper to get the submit button (not the tab button) by its text
function getSubmitButton(name) {
  const buttons = screen.getAllByRole('button', { name })
  const submit = buttons.find((b) => b.getAttribute('type') === 'submit')
  return submit || buttons[buttons.length - 1]
}

describe('AuthModal', () => {
  it('renders login form by default with email and password fields', () => {
    renderAuthModal()

    expect(screen.getByText('Unlock rewards, faster checkout')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    // There are two "Login" buttons (tab + submit); ensure at least the submit exists
    expect(getSubmitButton('Login')).toBeInTheDocument()
  })

  it('switches to signup form when Sign up tab is clicked', async () => {
    const user = userEvent.setup()
    renderAuthModal()

    await user.click(screen.getByText('Sign up'))

    expect(screen.getByLabelText('First name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Last name *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument()
  })

  it('toggles back from signup to login', async () => {
    const user = userEvent.setup()
    renderAuthModal()

    // Switch to signup
    await user.click(screen.getByText('Sign up'))
    expect(screen.getByLabelText('First name *')).toBeInTheDocument()

    // Switch back to login — click the Login tab (first Login button)
    const loginButtons = screen.getAllByRole('button', { name: 'Login' })
    await user.click(loginButtons[0])
    expect(screen.queryByLabelText('First name *')).not.toBeInTheDocument()
    expect(getSubmitButton('Login')).toBeInTheDocument()
  })

  it('validates email field is required via native HTML validation', () => {
    renderAuthModal()

    const emailInput = screen.getByLabelText('Email')
    expect(emailInput).toBeRequired()
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('validates password field is required via native HTML validation', () => {
    renderAuthModal()

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toBeRequired()
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('submits login form and dispatches setUser on success', async () => {
    // Override handler to avoid request.json() body-read issues in jsdom
    server.use(
      http.post(`${BASE}/auth/login`, () => {
        return HttpResponse.json(mockLoginResponse)
      })
    )

    const user = userEvent.setup()
    const store = createStore()
    renderAuthModal(store)

    await user.type(screen.getByLabelText('Email'), 'testcustomer@grabbi.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(getSubmitButton('Login'))

    await waitFor(() => {
      expect(screen.getByText('Login successful!')).toBeInTheDocument()
    })

    // User should be set in Redux store
    const state = store.getState()
    expect(state.auth.isAuthenticated).toBe(true)
    expect(state.auth.user.email).toBe('testcustomer@grabbi.com')
  })

  it('submits register form and dispatches setUser on success', async () => {
    // Override handler to avoid request.json() body-read issues in jsdom
    server.use(
      http.post(`${BASE}/auth/register`, () => {
        return HttpResponse.json(mockRegisterResponse, { status: 201 })
      })
    )

    const user = userEvent.setup()
    const store = createStore()
    renderAuthModal(store)

    await user.click(screen.getByText('Sign up'))

    await user.type(screen.getByLabelText('First name *'), 'Jane')
    await user.type(screen.getByLabelText('Last name *'), 'Doe')
    await user.type(screen.getByLabelText('Email'), 'newuser@test.com')
    await user.type(screen.getByLabelText('Password'), 'securepass')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => {
      expect(screen.getByText('Account created successfully!')).toBeInTheDocument()
    })

    const state = store.getState()
    expect(state.auth.isAuthenticated).toBe(true)
  })

  it('displays error toast when login fails', async () => {
    server.use(
      http.post(`${BASE}/auth/login`, () => {
        return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      })
    )

    const user = userEvent.setup()
    renderAuthModal()

    await user.type(screen.getByLabelText('Email'), 'bad@test.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')
    await user.click(getSubmitButton('Login'))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })
})
