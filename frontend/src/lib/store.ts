import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Merchant } from '@/types'

interface AuthState {
  merchant: Merchant | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (merchant: Merchant, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      merchant: null,
      token: null,
      isAuthenticated: false,
      setAuth: (merchant, token) =>
        set({ merchant, token, isAuthenticated: true }),
      clearAuth: () =>
        set({ merchant: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'payguard-auth',
    }
  )
)
