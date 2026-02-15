import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/mocks/server'
import franchiseReducer from '../../store/slices/franchiseSlice'
import StoreSelector from './StoreSelector'
import { mockFranchise, mockNearestFranchise } from '../../test/mocks/fixtures'

const BASE = '*/api'

function createStore(overrides = {}) {
  return configureStore({
    reducer: { franchise: franchiseReducer },
    preloadedState: {
      franchise: {
        selectedFranchise: null,
        nearbyFranchises: [],
        customerLocation: null,
        locationLoading: false,
        locationError: null,
        ...overrides,
      },
    },
  })
}

function renderStoreSelector(store = null, onClose = vi.fn()) {
  const s = store || createStore()
  return {
    onClose,
    ...render(
      <Provider store={s}>
        <StoreSelector onClose={onClose} />
      </Provider>
    ),
  }
}

// Stub navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
}

beforeEach(() => {
  Object.defineProperty(navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
    configurable: true,
  })
  vi.clearAllMocks()
})

describe('StoreSelector', () => {
  it('renders the map picker and heading', () => {
    // Prevent auto-detection from triggering
    const store = createStore({ selectedFranchise: mockFranchise })
    renderStoreSelector(store)

    expect(screen.getByText('Find your store')).toBeInTheDocument()
    expect(screen.getByText(/nearest Grabbi store/)).toBeInTheDocument()
    // Map container from mocked react-leaflet
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('shows Use my location button', () => {
    const store = createStore({ selectedFranchise: mockFranchise })
    renderStoreSelector(store)

    expect(screen.getByText('Use my location')).toBeInTheDocument()
  })

  it('displays selected franchise info when franchise is found', () => {
    const store = createStore({ selectedFranchise: mockFranchise })
    renderStoreSelector(store)

    expect(screen.getByText(/Delivering from: Grabbi Main Store/)).toBeInTheDocument()
    expect(screen.getByText('London, UK')).toBeInTheDocument()
  })

  it('displays error message when location error occurs', () => {
    // Set selectedFranchise to prevent the auto-detect useEffect from clearing the error
    const store = createStore({ locationError: 'No store delivers to your area yet', selectedFranchise: mockFranchise })
    renderStoreSelector(store)

    expect(screen.getByText('No store delivers to your area yet')).toBeInTheDocument()
  })
})
