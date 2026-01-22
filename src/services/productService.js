import { api } from '../utils/api'

export const productService = {
  async getProducts(params = {}) {
    const response = await api.get('/products', { params })
    return response.data
  },

  async getProduct(id) {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  async getCategories() {
    const response = await api.get('/categories')
    return response.data
  },

  async getPromotions() {
    const response = await api.get('/promotions')
    return response.data
  },
}
