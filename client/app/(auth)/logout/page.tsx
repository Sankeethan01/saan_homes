// app/logout/page.jsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()
  useEffect(() => {
    // 1) Remove tokens
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    // 2) Redirect
    router.replace('/login')
  }, [router])

  return <p className="p-6 text-center">Signing you out…</p>
}
