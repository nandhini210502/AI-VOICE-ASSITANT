import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api/client'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        set({ user: data.user, token: data.token, isAuthenticated: true })
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        return data
      },

      register: async (email, password, username) => {
        const { data } = await api.post('/auth/register', { email, password, username })
        set({ user: data.user, token: data.token, isAuthenticated: true })
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        return data
      },

      guestLogin: async () => {
        const { data } = await api.post('/auth/guest')
        set({ user: data.user, token: data.token, isAuthenticated: true })
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        return data
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        delete api.defaults.headers.common['Authorization']
      },

      initAuth: () => {
        const { token } = get()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)
