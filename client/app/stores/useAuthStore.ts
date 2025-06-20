// src/stores/useAuthStore.ts
"use client"; // must live in client components

import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  clear: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

const customStorage: StateStorage = {
  getItem: (name) => {
    // Try localStorage first, then sessionStorage
    const fromLs = localStorage.getItem(name);
    if (fromLs) return fromLs;

    const fromSs = sessionStorage.getItem(name);
    if (fromSs) return fromSs;

    return null;
  },
  setItem: (name, value) => {
    // Check the remember-me flag to decide where to store the token
    const remember = localStorage.getItem("auth-remember") === "true";
    if (remember) {
      localStorage.setItem(name, value);
      sessionStorage.removeItem(name); // Clean up session storage
    } else {
      sessionStorage.setItem(name, value);
      localStorage.removeItem(name); // Clean up local storage
    }
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      _hasHydrated: false,
      setToken: (t) => set({ token: t }),
      clear: () => set({ token: null }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "auth-storage", // key in localStorage/sessionStorage
      storage: customStorage,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
