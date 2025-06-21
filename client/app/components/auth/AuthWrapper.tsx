"use client";

import { useHydration } from "@/app/hooks/useHydration";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const isHydrated = useHydration();

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
