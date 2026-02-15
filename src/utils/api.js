import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://grabbi-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
try {
  const token = localStorage.getItem('token')
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }
} catch {
  // localStorage may not be available in test environments
}

// Callback for handling 401 logout
let on401Callback = null

export const setup401Handler = (callback) => {
  on401Callback = callback
}

// Flag to prevent infinite refresh loops
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response interceptor with token refresh flow
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refresh_token: refreshToken }
        )

        const newToken = response.data.token
        const newRefreshToken = response.data.refresh_token

        // Update tokens
        setAuthToken(newToken)
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken)
        }

        processQueue(null, newToken)

        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)

        // Refresh failed - logout
        try {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('refresh_token')
        } catch {
          // localStorage may not be available
        }
        delete api.defaults.headers.common['Authorization']
        if (on401Callback) {
          on401Callback()
        }
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.href = '/'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// Helper to update token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }
}
