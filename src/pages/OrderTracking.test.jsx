import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '../test/mocks/server'
import OrderTracking from './OrderTracking'
import { mockOrder } from '../test/mocks/fixtures'

const BASE = '*/api'

function renderOrderTracking(orderId = mockOrder.id) {
  return render(
    <MemoryRouter initialEntries={[`/order/${orderId}`]}>
      <Routes>
        <Route path="/order/:orderId" element={<OrderTracking />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('OrderTracking page', () => {
  it('renders loading state initially', () => {
    renderOrderTracking()
    expect(screen.getByText('Loading order details...')).toBeInTheDocument()
  })

  it('displays order data after loading', async () => {
    renderOrderTracking()

    await waitFor(() => {
      expect(screen.queryByText('Loading order details...')).not.toBeInTheDocument()
    })

    // Order number from real fixture
    expect(screen.getByText(/ORD2026021302212508c04929/)).toBeInTheDocument()

    // Page heading
    expect(screen.getByText('Live order tracking')).toBeInTheDocument()

    // Order details section
    expect(screen.getByText('Order details')).toBeInTheDocument()

    // Total from fixture: 14.22
    expect(screen.getByText('\u00A314.22')).toBeInTheDocument()

    // Delivery fee from fixture: 3.75
    expect(screen.getByText('\u00A33.75')).toBeInTheDocument()

    // Payment method
    expect(screen.getByText('card')).toBeInTheDocument()

    // Delivery address from fixture
    expect(screen.getByText('Delivery address')).toBeInTheDocument()
    expect(screen.getByText('123 Test St, London SW1A 1AA')).toBeInTheDocument()
  })

  it('shows order status steps', async () => {
    renderOrderTracking()

    await waitFor(() => {
      expect(screen.queryByText('Loading order details...')).not.toBeInTheDocument()
    })

    // Status steps should be rendered
    expect(screen.getByText('Order placed')).toBeInTheDocument()
    expect(screen.getByText('Preparing')).toBeInTheDocument()
    expect(screen.getByText('Dispatched')).toBeInTheDocument()
    expect(screen.getByText('Delivered')).toBeInTheDocument()

    // "pending" maps to step 1, so "In progress" should appear
    expect(screen.getByText('In progress')).toBeInTheDocument()
  })

  it('shows error state when order API returns 404', async () => {
    server.use(
      http.get(`${BASE}/orders/:id`, () => {
        return HttpResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      })
    )

    renderOrderTracking('nonexistent-id')

    await waitFor(() => {
      expect(screen.queryByText('Loading order details...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Order not found')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument()
  })

  it('shows error state when API returns a custom error message', async () => {
    server.use(
      http.get(`${BASE}/orders/:id`, () => {
        return HttpResponse.json(
          { error: 'Unauthorized access' },
          { status: 401 }
        )
      })
    )

    renderOrderTracking()

    await waitFor(() => {
      expect(screen.queryByText('Loading order details...')).not.toBeInTheDocument()
    })

    // The component reads error.response?.data?.error
    expect(screen.getByText('Unauthorized access')).toBeInTheDocument()
  })

  it('renders map preview placeholder', async () => {
    renderOrderTracking()

    await waitFor(() => {
      expect(screen.queryByText('Loading order details...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Map preview')).toBeInTheDocument()
    expect(screen.getByText(/Google Maps/)).toBeInTheDocument()
  })
})
