import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthState, User, Tokens } from '../types/auth'

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setUser: (user: User) => {
        console.log('Setting user:', user);
        set({ user, isAuthenticated: true });
        console.log('New state after setUser:', get());
      },
      
      setTokens: (tokens: Tokens) => {
        console.log('Setting tokens:', tokens);
        set({ tokens });
        console.log('New state after setTokens:', get());
      },

      login: async (user: User, tokens: Tokens) => {
        console.log('Login called with:', { user, tokens });
        
        // Store tokens in AsyncStorage directly
        try {
          await AsyncStorage.setItem('tokens', JSON.stringify(tokens));
          console.log('Tokens stored in AsyncStorage');
        } catch (error) {
          console.error('Error storing tokens in AsyncStorage:', error);
        }
        
        set({
          user,
          tokens,
          isAuthenticated: true
        });
        console.log('New state after login:', get());
      },

      logout: async () => {
        console.log('Logout called');
        
        // Clear tokens from AsyncStorage
        try {
          await AsyncStorage.removeItem('tokens');
          console.log('Tokens removed from AsyncStorage');
        } catch (error) {
          console.error('Error removing tokens from AsyncStorage:', error);
        }
        
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        });
        console.log('New state after logout:', get());
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log('Rehydrated state:', state);
      },
    }
  )
)

export default useAuthStore 