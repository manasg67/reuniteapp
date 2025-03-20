import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthState, User, Tokens } from '../types/auth'

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setUser: (user: User) => set({ user, isAuthenticated: true }),
      setTokens: (tokens: Tokens) => set({ tokens }),

      login: (user: User, tokens: Tokens) => {
        set({
          user,
          tokens,
          isAuthenticated: true
        })
      },

      logout: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

export default useAuthStore 