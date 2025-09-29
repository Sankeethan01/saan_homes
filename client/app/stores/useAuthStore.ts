// app/stores/useAuthStore.ts
"use client"; 

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { subscribeWithSelector } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
}

interface AuthState {
  token: string | null;
  userRole: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  setUserRole: (role: string | null) => void;
  setUser: (user: User | null) => void;
  clear: () => void;
  // Optimized batch update
  setAuthData: (data: { token?: string | null; userRole?: string | null; user?: User | null }) => void;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        token: null,
        userRole: null,
        user: null,
        isAuthenticated: false,
        setToken: (t) => set({ 
          token: t, 
          isAuthenticated: !!t 
        }),
        setUserRole: (r) => set({ userRole: r }),
        setUser: (u) => set({ user: u }),
        clear: () => set({ 
          token: null, 
          userRole: null, 
          user: null, 
          isAuthenticated: false 
        }),
        // Optimized batch update to prevent multiple re-renders
        setAuthData: (data) => {
          const updates: Partial<AuthState> = {};
          
          if (data.token !== undefined) {
            updates.token = data.token;
            updates.isAuthenticated = !!data.token;
          }
          
          if (data.userRole !== undefined) {
            updates.userRole = data.userRole;
          }
          
          if (data.user !== undefined) {
            updates.user = data.user;
          }
          
          set(updates);
        },
      }),
      {
        name: "auth-storage", // key in localStorage
        storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
        // Only persist essential data
        partialize: (state) => ({
          token: state.token,
          userRole: state.userRole,
          user: state.user,
        }),
      }
    )
  )
);

// Optimized selectors to prevent unnecessary re-renders
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useUserRole = () => useAuthStore((state) => state.userRole);
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

// Optimized actions
export const useAuthActions = () => useAuthStore((state) => ({
  setToken: state.setToken,
  setUserRole: state.setUserRole,
  setUser: state.setUser,
  clear: state.clear,
  setAuthData: state.setAuthData,
}));
