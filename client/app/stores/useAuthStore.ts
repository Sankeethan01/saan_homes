// app/stores/useAuthStore.ts
"use client"; 

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  setToken: (token: string | null) => void;
  setUserRole: (role: string | null) => void;
  setUser: (user: User | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userRole: null,
      user: null,
      setToken: (t) => set({ token: t }),
      setUserRole: (r) => set({ userRole: r }),
      setUser: (u) => set({ user: u }),
      clear: () => set({ token: null, userRole: null, user: null }),
    }),
    {
      name: "auth-storage", // key in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
    }
  )
);
