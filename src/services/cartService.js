import { api } from '../utils/api'

export const cartService = {
  async getCart() {
    const response = await api.get('/cart')
    return response.data
  },

  async addToCart(product_id, quantity = 1) {
    const response = await api.post('/cart', { product_id, quantity })
    return response.data
  },

  async updateCartItem(cartItemId, quantity) {
    const response = await api.put(`/cart/${cartItemId}`, { quantity })
    return response.data
  },

  async removeCartItem(cartItemId) {
    const response = await api.delete(`/cart/${cartItemId}`)
    return response.data
  },

  async clearCart() {
    const response = await api.delete('/cart')
    return response.data
  },
}