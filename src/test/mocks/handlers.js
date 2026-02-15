import { http, HttpResponse } from 'msw'
import {
  mockProducts,
  mockProduct,
  mockProduct2,
  mockCategories,
  mockSubcategories,
  mockPromotions,
  mockNearestFranchise,
  mockFranchise,
  mockFranchiseProducts,
  mockLoginResponse,
  mockRegisterResponse,
  mockProfile,
  mockCartItem,
  mockCartItems,
  mockOrder,
  mockOrders,
  mockHealth,
} from './fixtures'

// Use wildcard prefix so handlers match regardless of VITE_API_URL host
const BASE = '*/api'

export const handlers = [
  // === HEALTH ===
  http.get(`${BASE}/health`, () => {
    return HttpResponse.json(mockHealth)
  }),

  // === PUBLIC PRODUCT ROUTES ===
  http.get(`${BASE}/products`, ({ request }) => {
    // Real API returns array of products; accepts ?franchise_id query param
    return HttpResponse.json(mockProducts)
  }),

  http.get(`${BASE}/products/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p.id === params.id) || mockProduct
    return HttpResponse.json(product)
  }),

  // === CATEGORY ROUTES ===
  http.get(`${BASE}/categories`, () => {
    // Real API returns array; some categories have subcategories[] nested
    return HttpResponse.json(mockCategories)
  }),

  http.get(`${BASE}/categories/:id`, ({ params }) => {
    const cat = mockCategories.find((c) => c.id === params.id) || mockCategories[0]
    return HttpResponse.json({ ...cat, products: mockProducts })
  }),

  // === SUBCATEGORY ROUTES ===
  http.get(`${BASE}/subcategories`, () => {
    // Real API returns array; each subcategory nests its parent category
    return HttpResponse.json(mockSubcategories)
  }),

  // === PROMOTION ROUTES ===
  http.get(`${BASE}/promotions`, () => {
    return HttpResponse.json(mockPromotions)
  }),

  http.get(`${BASE}/promotions/:id`, () => {
    return HttpResponse.json(mockPromotions[0])
  }),

  // === FRANCHISE ROUTES ===
  http.get(`${BASE}/franchises/nearest`, () => {
    // Real API returns { distance: number, franchise: {...} }
    return HttpResponse.json(mockNearestFranchise)
  }),

  http.get(`${BASE}/franchises/:id/products`, () => {
    // Real API returns array of products with franchise_* extra fields
    return HttpResponse.json(mockFranchiseProducts)
  }),

  http.get(`${BASE}/franchises/:id/promotions`, () => {
    return HttpResponse.json(mockPromotions)
  }),

  http.get(`${BASE}/franchises/:id`, () => {
    // Real API returns franchise object with owner, store_hours, etc.
    return HttpResponse.json(mockFranchise)
  }),

  // === AUTH ROUTES ===
  http.post(`${BASE}/auth/register`, () => {
    // Real API returns { token, user }
    return HttpResponse.json(mockRegisterResponse, { status: 201 })
  }),

  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = await request.json()
    if (body.password === 'wrongpassword') {
      return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    // Real API returns { token, user }
    return HttpResponse.json(mockLoginResponse)
  }),

  http.get(`${BASE}/auth/profile`, () => {
    // Real API returns flat user object (no token wrapper)
    return HttpResponse.json(mockProfile)
  }),

  // === CART ROUTES ===
  http.get(`${BASE}/cart`, () => {
    // Real API returns array of cart items with nested user and product
    return HttpResponse.json(mockCartItems)
  }),

  http.post(`${BASE}/cart`, async ({ request }) => {
    const body = await request.json()
    // Real API returns full cart item with nested user and product
    return HttpResponse.json({
      ...mockCartItem,
      product_id: body.product_id,
      quantity: body.quantity,
    })
  }),

  http.put(`${BASE}/cart/:id`, async ({ request, params }) => {
    const body = await request.json()
    return HttpResponse.json({
      ...mockCartItem,
      id: params.id,
      quantity: body.quantity,
    })
  }),

  http.delete(`${BASE}/cart/:id`, () => {
    return HttpResponse.json({ message: 'Item removed' })
  }),

  http.delete(`${BASE}/cart`, () => {
    return HttpResponse.json({ message: 'Cart cleared' })
  }),

  // === ORDER ROUTES ===
  http.post(`${BASE}/orders`, async () => {
    // Real API returns full order with nested user and items[].product
    return HttpResponse.json(mockOrder, { status: 201 })
  }),

  http.get(`${BASE}/orders`, () => {
    // Real API returns array of orders
    return HttpResponse.json(mockOrders)
  }),

  http.get(`${BASE}/orders/:id`, ({ params }) => {
    // Real API returns single order object
    return HttpResponse.json(mockOrder)
  }),
]
