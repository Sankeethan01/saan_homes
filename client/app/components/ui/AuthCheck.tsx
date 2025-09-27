'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/app/stores/useAuthStore';
import { getAccessToken, isTokenValid, refreshAccessToken, setupTokenRefreshTimer } from '@/app/utils/auth';
import AuthLoader from './AuthLoader';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const clearToken = useAuthStore((s) => s.clear);
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/aboutus',
    '/services',
    '/projects',
    '/equipments',
    '/dashboard/login',
    '/dashboard/register',
    '/dashboard/logout',
  ];
  
  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || 
    pathname.startsWith('/projects/') || 
    pathname.startsWith('/equipments/')
  );

  useEffect(() => {
    // Skip auth check for public routes
    if (isPublicRoute) {
      setIsChecking(false);
      return;
    }

    // Only show loader after a short delay to avoid flashing for quick checks
    const loaderTimeout = setTimeout(() => {
      if (isChecking) {
        setShowLoader(true);
      }
    }, 300);

    // For protected routes, check token validity
    const checkAuth = async () => {
      const token = getAccessToken();
      
      // If no token, redirect to login
      if (!token) {
        console.log('No token found, redirecting to login');
        clearToken();
        router.replace(`/dashboard/login?returnUrl=${encodeURIComponent(pathname)}`);
        return;
      }
      
      // If token is invalid (expired), try to refresh
      if (!isTokenValid(token)) {
        console.log('Token is invalid or expired, attempting refresh');
        const refreshSuccess = await refreshAccessToken();
        
        if (!refreshSuccess) {
          console.log('Token refresh failed, redirecting to login');
          clearToken();
          router.replace(`/dashboard/login?returnUrl=${encodeURIComponent(pathname)}`);
          return;
        }
        
        // Set up token refresh timer after successful refresh
        setupTokenRefreshTimer();
      } else {
        // Token is valid, set up refresh timer anyway
        setupTokenRefreshTimer();
      }
      
      setIsChecking(false);
      setShowLoader(false);
    };
    
    checkAuth();
    
    // Clean up timeout
    return () => clearTimeout(loaderTimeout);
  }, [pathname, router, clearToken, isPublicRoute, isChecking]);
  
  // Show loader while checking auth on protected routes
  if (showLoader && !isPublicRoute) {
    return <AuthLoader />;
  }
  
  // For public routes or when auth check is complete
  return <>{children}</>;
}
