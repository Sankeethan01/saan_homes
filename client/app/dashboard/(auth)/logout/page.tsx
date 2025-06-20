// app/logout/page.jsx
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/app/stores/useAuthStore'

export default function LogoutPage() {
  const router = useRouter()
  const setToken = useAuthStore((s) => s.setToken)

  useEffect(() => {
    // Clear the token from the store and storage
    setToken(null)
    
    // Remove the remember me flag
    localStorage.removeItem("auth-remember")

    // Redirect to the login page
    router.replace('/dashboard/login')
  }, [setToken, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Logging out...</p>
      </div>
    </div>
  )
}
