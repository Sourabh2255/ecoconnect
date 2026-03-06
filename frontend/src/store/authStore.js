import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:  null,
      token: null,

      login: (userData, token) => set({ user: userData, token }),

      logout: () => set({ user: null, token: null }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),

      isAuthenticated: () => !!get().token,
    }),
    { name: 'ecoconnect-auth' }
  )
);

export default useAuthStore;
