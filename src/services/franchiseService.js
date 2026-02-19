import { api } from '../utils/api'

export const franchiseService = {
  async getNearestFranchise(lat, lng) {
    const response = await api.get('/franchises/nearest', { params: { lat, lng } })
    return response.data
  },

  async getNearbyFranchises(lat, lng) {
    // Backend will filter franchises based on each franchise's own delivery_radius
    const response = await api.get('/franchises/nearby', { params: { lat, lng } })
    return response.data
  },

  async getFranchise(id) {
    const response = await api.get(`/franchises/${id}`)
    return response.data
  },

  async getFranchiseProducts(franchiseId, params = {}) {
    const response = await api.get(`/franchises/${franchiseId}/products`, { params })
    return response.data
  },

  async getFranchisePromotions(franchiseId) {
    const response = await api.get(`/franchises/${franchiseId}/promotions`)
    return response.data
  },
}
