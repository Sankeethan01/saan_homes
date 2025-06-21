// app/stores/useAuthStore.ts
"use client"; 

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (t) => set({ token: t }),
      clear: () => set({ token: null }),
    }),
    {
      name: "auth-storage", // key in localStorage/sessionStorage
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage
    }
  )
);
