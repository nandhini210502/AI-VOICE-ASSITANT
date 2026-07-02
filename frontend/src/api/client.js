import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to automatically add JWT from auth-storage if it exists
api.interceptors.request.use(
  (config) => {
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const { state } = JSON.parse(authStorage)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      }
    } catch (err) {
      console.error('[API Client] Error reading auth-storage from localStorage:', err)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth on 401
      localStorage.removeItem('auth-storage')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export default api
