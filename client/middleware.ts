// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1) Only run this middleware on /dashboard and its sub-paths
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  // 2) Allow login and auth-related pages through unguarded
  if (pathname === '/dashboard/login' || 
      pathname === '/dashboard/logout' || 
      pathname === '/dashboard/register') {
    return NextResponse.next()
  }

  // 3) Grab the JWT from cookies
  const token = req.cookies.get('access_token')?.value
  if (!token) {
    // No token → redirect to login
    return NextResponse.redirect(new URL('/dashboard/login', req.url))
  }

  // 4) Get role from the user_role cookie
  const role = req.cookies.get('user_role')?.value
  if (!role) {
    // No role → redirect to login
    return NextResponse.redirect(new URL('/dashboard/login', req.url))
  }

  // 5) Route-specific guards
  if (pathname.startsWith('/dashboard/admin')) {
    if (role !== 'ADMIN') {
      // Not admin → redirect based on role
      if (role === 'SUPERVISOR') {
        return NextResponse.redirect(new URL('/dashboard/supervisor', req.url))
      } else if (role === 'PUBLIC') {
        return NextResponse.redirect(new URL('/dashboard/me', req.url))
      }
      return NextResponse.redirect(new URL('/dashboard/login', req.url))
    }
  } else if (pathname.startsWith('/dashboard/supervisor')) {
    if (role !== 'SUPERVISOR') {
      // Not supervisor → redirect based on role
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/admin', req.url))
      } else if (role === 'PUBLIC') {
        return NextResponse.redirect(new URL('/dashboard/me', req.url))
      }
      return NextResponse.redirect(new URL('/dashboard/login', req.url))
    }
  } else if (pathname.startsWith('/dashboard/me')) {
    if (role !== 'PUBLIC') {
      // Not public user → redirect based on role
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/admin', req.url))
      } else if (role === 'SUPERVISOR') {
        return NextResponse.redirect(new URL('/dashboard/supervisor', req.url))
      }
      return NextResponse.redirect(new URL('/dashboard/login', req.url))
    }
  }

  // 6) All good: let the request through
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard'], 
}
