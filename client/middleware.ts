// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1) Only run this middleware on /dashboard and its sub-paths
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  // 2) Allow the two login pages through unguarded
  if (pathname === '/dashboard/login' || pathname === '/dashboard/login-user') {
    return NextResponse.next()
  }

  // 3) Grab the JWT from cookies (you must set this cookie on login)
  const token = req.cookies.get('access_token')?.value
  if (!token) {
    // no token → redirect to the appropriate login
    const to = pathname.startsWith('/dashboard/me')
      ? '/dashboard/login-user'
      : '/dashboard/login'
    return NextResponse.redirect(new URL(to, req.url))
  }

  // 4) Get role from the user_role cookie
  const role = req.cookies.get('user_role')?.value

  // 5) Route-specific guards
  if (pathname.startsWith('/dashboard/admin')) {
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/login', req.url))
    }
  } else if (pathname.startsWith('/dashboard/supervisor')) {
    if (role !== 'SUPERVISOR') {
      return NextResponse.redirect(new URL('/dashboard/login', req.url))
    }
  } else if (pathname.startsWith('/dashboard/me')) {
    if (role !== 'PUBLIC') {
      return NextResponse.redirect(new URL('/dashboard/login-user', req.url))
    }
  }

  // 6) All good: let the request through
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard'], 
}
