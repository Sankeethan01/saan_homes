"use client";

import { useAuthStore } from "@/app/stores/useAuthStore";
import { useState, useEffect } from "react";

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Zustand's persist middleware provides `onFinishHydration` to listen for when rehydration is complete.
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => 
      setHydrated(true)
    );

    // Immediately set the state to true if it's already hydrated.
    setHydrated(useAuthStore.persist.hasHydrated());

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
}; 