import { api } from '../utils/api'

export const orderService = {
  async createOrder({ franchise_id, customer_lat, customer_lng, delivery_address, items }) {
    const response = await api.post('/orders', {
      franchise_id,
      customer_lat,
      customer_lng,
      delivery_address,
      items,
    })
    return response.data
  },

  async getOrder(id) {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  async getOrders() {
    const response = await api.get('/orders')
    return response.data
  },

  async cancelOrder(id) {
    const response = await api.put(`/orders/${id}/status`, { status: 'cancelled' })
    return response.data
  },
}
