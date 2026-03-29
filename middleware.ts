import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('aos_admin_session')
    if (!session) {
      // Opción 1 — mostrar 404 (nadie sabe que existe)
      return NextResponse.rewrite(new URL('/not-found', request.url))

      // Opción 2 — redirigir al login (comportamiento actual)
      // return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}