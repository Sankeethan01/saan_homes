// app/logout/page.jsx
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/app/stores/useAuthStore'
import { clearAllAuthData } from '@/app/utils/auth'

export default function Logout() {
  const router = useRouter()
  const clear = useAuthStore((s) => s.clear)

  useEffect(() => {
    // Clear all auth data from cookies, localStorage, and sessionStorage
    clearAllAuthData()
    
    // Clear Zustand store
    clear()
    
    // Redirect to login page
    router.push('/dashboard/login')
  }, [router, clear])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800">Logging out...</h1>
        <p className="mt-2 text-gray-600">You will be redirected shortly.</p>
      </div>
    </div>
  )
}
