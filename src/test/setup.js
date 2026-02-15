import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import axios from 'axios'
import { server } from './mocks/server'

// Force Axios to use the fetch adapter instead of jsdom XMLHttpRequest.
// MSW v2 intercepts fetch reliably but not jsdom's XHR implementation.
axios.defaults.adapter = 'fetch'

// Mock react-leaflet — Leaflet needs real DOM APIs unavailable in jsdom
vi.mock('react-leaflet', () => {
  const React = require('react')
  return {
    MapContainer: ({ children }) => React.createElement('div', { 'data-testid': 'map-container' }, children),
    TileLayer: () => null,
    Marker: () => null,
    useMapEvents: () => null,
    useMap: () => ({ invalidateSize: () => {}, setView: () => {}, getZoom: () => 13 }),
  }
})

vi.mock('leaflet', () => {
  const Icon = { Default: { prototype: { _getIconUrl: '' }, mergeOptions: () => {} } }
  return { default: { Icon }, Icon }
})

// Ensure localStorage is available for api.js module-level code.
// Node 22+ provides a built-in localStorage that requires --localstorage-file;
// without that flag, its methods throw. Replace it unconditionally with a
// simple in-memory implementation so that both api.js and ThemeContext work.
{
  const store = {}
  const localStorageShim = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
    get length() { return Object.keys(store).length },
    key: (i) => Object.keys(store)[i] || null,
  }
  // Try to detect broken localStorage (Node.js built-in without --localstorage-file)
  let needsShim = typeof globalThis.localStorage === 'undefined'
  if (!needsShim) {
    try {
      globalThis.localStorage.getItem('__test__')
    } catch {
      needsShim = true
    }
  }
  if (needsShim) {
    globalThis.localStorage = localStorageShim
  }
}

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
