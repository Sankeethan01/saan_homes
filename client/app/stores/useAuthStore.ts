// app/stores/useAuthStore.ts
"use client"; 

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  token: string | null;
  userRole: string | null;
  setToken: (token: string | null) => void;
  setUserRole: (role: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userRole: null,
      setToken: (t) => set({ token: t }),
      setUserRole: (r) => set({ userRole: r }),
      clear: () => set({ token: null, userRole: null }),
    }),
    {
      name: "auth-storage", // key in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
    }
  )
);
