// Fixtures derived from actual backend API curl responses (grabbi-fixtures/)
// Field names, types, and nesting match the real Go backend exactly.

// === CATEGORIES ===
// Real shape: GET /api/categories returns array; each has optional subcategories[]

export const mockCategories = [
  {
    id: 'b0fb129a-fccb-4a9a-85c8-cac434b020d2',
    name: 'Beverages',
    icon: '\ud83e\udd64',
    description: 'Drinks and beverages',
    created_at: '2026-02-13T01:35:43.485743+05:30',
    updated_at: '2026-02-13T01:35:43.485743+05:30',
  },
  {
    id: '0d4d239c-a21f-431f-a6b1-2e012dc0bde6',
    name: 'Fresh Produce & Veg',
    icon: '\ud83e\udd6c',
    description: 'Fresh fruits and vegetables',
    created_at: '2026-02-13T01:35:41.777489+05:30',
    updated_at: '2026-02-13T01:40:54.749741+05:30',
    subcategories: [
      {
        id: '5d9bfef9-3172-49ec-9a3f-c86267251b4b',
        name: 'Fresh Vegetables',
        category_id: '0d4d239c-a21f-431f-a6b1-2e012dc0bde6',
        icon: '',
        description: 'Fresh vegetables',
        created_at: '2026-02-13T01:35:45.424904+05:30',
        updated_at: '2026-02-13T01:40:57.932106+05:30',
      },
    ],
  },
]

// === SUBCATEGORIES ===
// Real shape: GET /api/subcategories returns array; each nests its parent category

export const mockSubcategories = [
  {
    id: '5d9bfef9-3172-49ec-9a3f-c86267251b4b',
    name: 'Fresh Vegetables',
    category_id: '0d4d239c-a21f-431f-a6b1-2e012dc0bde6',
    category: {
      id: '0d4d239c-a21f-431f-a6b1-2e012dc0bde6',
      name: 'Fresh Produce & Veg',
      icon: '\ud83e\udd6c',
      description: 'Fresh fruits and vegetables',
      created_at: '2026-02-13T01:35:41.777489+05:30',
      updated_at: '2026-02-13T01:40:54.749741+05:30',
    },
    icon: '',
    description: 'Fresh vegetables',
    created_at: '2026-02-13T01:35:45.424904+05:30',
    updated_at: '2026-02-13T01:40:57.932106+05:30',
  },
]

// Shared category object for products (matches real backend shape)
const freshProduceCategory = {
  id: '0d4d239c-a21f-431f-a6b1-2e012dc0bde6',
  name: 'Fresh Produce & Veg',
  icon: '\ud83e\udd6c',
  description: 'Fresh fruits and vegetables',
  created_at: '2026-02-13T01:35:41.777489+05:30',
  updated_at: '2026-02-13T01:40:54.749741+05:30',
}

// === PRODUCTS ===
// Real shape: GET /api/products returns array of product objects
// GET /api/products/:id returns a single product object

export const mockProduct = {
  id: '4797cd10-9faa-46e1-89a2-9ec3bae0c4f9',
  sku: 'TEST-001',
  item_name: 'Organic Broccoli',
  short_description: 'Fresh organic broccoli',
  long_description: 'Freshly harvested organic broccoli from local farms',
  cost_price: 1.5,
  retail_price: 2.99,
  gross_margin: 0,
  staff_discount: 0,
  tax_rate: 0,
  batch_number: '',
  barcode: '',
  stock_quantity: 100,
  reorder_level: 10,
  shelf_location: '',
  weight_volume: 0,
  unit_of_measure: '',
  category_id: '0d4d239c-a21f-431f-a6b1-2e012dc0bde6',
  category: freshProduceCategory,
  brand: 'FarmFresh',
  supplier: '',
  country_of_origin: 'UK',
  is_gluten_free: true,
  is_vegetarian: true,
  is_vegan: true,
  is_age_restricted: false,
  allergen_info: '',
  storage_type: '',
  is_own_brand: false,
  online_visible: true,
  status: 'active',
  notes: '',
  pack_size: '300g',
  created_at: '2026-02-13T01:36:13.900632+05:30',
  updated_at: '2026-02-13T01:36:13.900632+05:30',
  images: [
    {
      id: 'fcb49a36-7c5f-4a91-ade0-5e69a9a83831',
      product_id: '4797cd10-9faa-46e1-89a2-9ec3bae0c4f9',
      image_url: 'https://example.com/broccoli.png',
      is_primary: true,
      created_at: '2026-02-13T01:36:18.610705+05:30',
      updated_at: '2026-02-13T01:36:18.610705+05:30',
    },
  ],
}

export const mockProduct2 = {
  id: 'f40d6783-3ba4-47b4-a857-0ff2a8138c0c',
  sku: 'TEST-002',
  item_name: 'Almond Milk',
  short_description: 'Organic almond milk 1L',
  long_description: '',
  cost_price: 1,
  retail_price: 3.49,
  promotion_price: 2.99,
  gross_margin: 0,
  staff_discount: 0,
  tax_rate: 0,
  batch_number: '',
  barcode: 'TEST002BAR',
  stock_quantity: 50,
  reorder_level: 0,
  shelf_location: '',
  weight_volume: 0,
  unit_of_measure: '',
  category_id: '0d4d239c-a21f-431f-a6b1-2e012dc0bde6',
  category: freshProduceCategory,
  brand: 'OatlyAlt',
  supplier: '',
  country_of_origin: '',
  is_gluten_free: true,
  is_vegetarian: false,
  is_vegan: true,
  is_age_restricted: false,
  allergen_info: '',
  storage_type: '',
  is_own_brand: false,
  online_visible: true,
  status: 'active',
  notes: '',
  pack_size: '1L',
  created_at: '2026-02-13T01:36:41.014318+05:30',
  updated_at: '2026-02-13T01:36:41.014318+05:30',
  images: [
    {
      id: 'ba8c4194-f754-43ab-ba91-8c82f2d8aac7',
      product_id: 'f40d6783-3ba4-47b4-a857-0ff2a8138c0c',
      image_url: 'https://storage.googleapis.com/grabbi-store.firebasestorage.app/products/1770926802_test_product_img.png',
      is_primary: true,
      created_at: '2026-02-13T01:36:45.477031+05:30',
      updated_at: '2026-02-13T01:36:45.477031+05:30',
    },
  ],
}

export const mockProducts = [mockProduct, mockProduct2]

// === FRANCHISE PRODUCTS (public) ===
// Real shape: GET /api/franchises/:id/products returns products with extra franchise fields

export const mockFranchiseProduct = {
  ...mockProduct2,
  stock_quantity: 47,
  updated_at: '2026-02-13T02:21:24.626325+05:30',
  franchise_stock: 47,
  franchise_price: 3.49,
  franchise_promo_price: 2.99,
  franchise_shelf_location: '',
  franchise_available: true,
}

export const mockFranchiseProducts = [mockFranchiseProduct]

// === PROMOTIONS ===
// Real shape: GET /api/promotions returns array

export const mockPromotions = [
  {
    id: 'ceb27638-0e15-4fd4-a6c7-f56f91fba79d',
    title: 'Summer Sale',
    description: 'Big discounts',
    image: 'https://storage.googleapis.com/grabbi-store.firebasestorage.app/promotions/1770927076_test_product_img.png',
    product_url: '',
    is_active: true,
    created_at: '2026-02-13T01:41:20.241224+05:30',
    updated_at: '2026-02-13T01:41:20.241224+05:30',
  },
]

// === FRANCHISES ===
// Real shape: GET /api/franchises/:id returns franchise with owner and store_hours

const zeroUser = {
  id: '00000000-0000-0000-0000-000000000000',
  email: '',
  name: '',
  role: '',
  loyalty_points: 0,
  created_at: '0001-01-01T00:00:00Z',
  updated_at: '0001-01-01T00:00:00Z',
}

export const mockFranchise = {
  id: '97bc3d3b-c0a2-4d6c-a12a-2e7a78756e1d',
  name: 'Grabbi Main Store',
  slug: 'grabbi-main',
  owner_id: '993534ee-142e-4170-96e2-ac4278599322',
  owner: zeroUser,
  address: 'London, UK',
  city: 'London',
  post_code: 'EC1A 1BB',
  latitude: 51.5074,
  longitude: -0.1278,
  delivery_radius: 5,
  delivery_fee: 4.99,
  free_delivery_min: 50,
  phone: '',
  email: '',
  is_active: true,
  store_hours: [
    { id: '6fb31037-87b2-40c9-ae9c-17f4a90c2135', franchise_id: '97bc3d3b-c0a2-4d6c-a12a-2e7a78756e1d', day_of_week: 0, open_time: '09:00', close_time: '21:00', is_closed: false, created_at: '2026-02-13T01:34:23.808967+05:30', updated_at: '2026-02-13T01:34:23.808967+05:30' },
    { id: '0d90dfbe-d3a1-4a46-918f-3e3ceb1b04ed', franchise_id: '97bc3d3b-c0a2-4d6c-a12a-2e7a78756e1d', day_of_week: 1, open_time: '09:00', close_time: '21:00', is_closed: false, created_at: '2026-02-13T01:34:25.661138+05:30', updated_at: '2026-02-13T01:34:25.661138+05:30' },
  ],
  created_at: '2026-02-13T01:34:22.176672+05:30',
  updated_at: '2026-02-13T01:34:22.176672+05:30',
}

// Real shape: GET /api/franchises/nearest returns { distance, franchise }
export const mockNearestFranchise = {
  distance: 0,
  franchise: mockFranchise,
}

// Second franchise for multi-store testing
export const mockFranchise2 = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Grabbi North Store',
  slug: 'grabbi-north',
  owner_id: '993534ee-142e-4170-96e2-ac4278599322',
  owner: zeroUser,
  address: 'Manchester, UK',
  city: 'Manchester',
  post_code: 'M1 1AA',
  latitude: 53.4808,
  longitude: -2.2426,
  delivery_radius: 5,
  delivery_fee: 3.99,
  free_delivery_min: 40,
  phone: '',
  email: '',
  is_active: true,
  store_hours: [],
  created_at: '2026-02-13T01:34:22.176672+05:30',
  updated_at: '2026-02-13T01:34:22.176672+05:30',
}

// Real shape: GET /api/franchises/nearby returns { franchises: [...] }
export const mockNearbyFranchises = {
  franchises: [
    { ...mockFranchise, distance: 0.5, delivery_time: '30-45 min' },
    { ...mockFranchise2, distance: 1.2, delivery_time: '45-60 min' },
  ],
}

// === AUTH ===
// Real shape: POST /api/auth/login returns { token, user }
// Real shape: POST /api/auth/register returns { token, user }
// Real shape: GET /api/auth/profile returns user object (no token wrapper)

export const mockLoginResponse = {
  token: 'mock-jwt-token-for-testing',
  user: {
    id: 'c7983ed7-2bca-4aa4-b7fb-57eb79086c47',
    email: 'testcustomer@grabbi.com',
    name: 'Test Customer',
    role: 'customer',
    loyalty_points: 0,
    franchise_id: null,
  },
}

export const mockRegisterResponse = {
  token: 'mock-jwt-token-for-testing',
  user: {
    id: 'new-user-id',
    email: 'newuser@test.com',
    name: 'New User',
    role: 'customer',
    loyalty_points: 0,
  },
}

export const mockProfile = {
  id: '9926dd88-21f9-41e4-8d4f-a2f231a1ba39',
  email: 'testcurl2@test.com',
  name: '',
  role: 'customer',
  loyalty_points: 0,
  franchise_id: null,
}

// === CART ===
// Real shape: POST /api/cart returns cart item with nested user and product
// Real shape: GET /api/cart returns array of cart items

export const mockCartItem = {
  id: 'feb60852-8b48-4529-b2b2-b6d9503b6398',
  user_id: '9926dd88-21f9-41e4-8d4f-a2f231a1ba39',
  user: zeroUser,
  product_id: 'f40d6783-3ba4-47b4-a857-0ff2a8138c0c',
  product: mockProduct2,
  quantity: 2,
  created_at: '2026-02-13T02:21:11.5641+05:30',
  updated_at: '2026-02-13T02:21:11.5641+05:30',
}

export const mockCartItems = [mockCartItem]

// === ORDERS ===
// Real shape: POST /api/orders returns order with nested user, items[].product
// Real shape: GET /api/orders returns array of orders
// Real shape: GET /api/orders/:id returns single order

const orderUser = {
  id: '9926dd88-21f9-41e4-8d4f-a2f231a1ba39',
  email: 'testcurl2@test.com',
  name: '',
  role: 'customer',
  loyalty_points: 10,
  created_at: '2026-02-13T02:20:36.487946+05:30',
  updated_at: '2026-02-13T02:21:27.029584+05:30',
}

export const mockOrder = {
  id: '08c04929-d161-41da-9168-62cd21835257',
  user_id: '9926dd88-21f9-41e4-8d4f-a2f231a1ba39',
  user: orderUser,
  order_number: 'ORD2026021302212508c04929',
  status: 'pending',
  subtotal: 10.47,
  delivery_fee: 3.75,
  total: 14.22,
  delivery_address: '123 Test St, London SW1A 1AA',
  payment_method: 'card',
  points_earned: 10,
  items: [
    {
      id: '9b7b5754-84c4-462a-b67c-b20114e247b3',
      order_id: '08c04929-d161-41da-9168-62cd21835257',
      product_id: 'f40d6783-3ba4-47b4-a857-0ff2a8138c0c',
      product: {
        ...mockProduct2,
        stock_quantity: 47,
        updated_at: '2026-02-13T02:21:24.626325+05:30',
      },
      image_url: 'https://storage.googleapis.com/grabbi-store.firebasestorage.app/products/1770926802_test_product_img.png',
      quantity: 3,
      price: 3.49,
      created_at: '2026-02-13T02:21:26.031361+05:30',
      updated_at: '2026-02-13T02:21:26.031361+05:30',
    },
  ],
  created_at: '2026-02-13T02:21:25.290573+05:30',
  updated_at: '2026-02-13T02:21:25.290573+05:30',
}

export const mockOrders = [mockOrder]

// === HEALTH ===
export const mockHealth = {
  database: 'connected',
  status: 'ok',
}
