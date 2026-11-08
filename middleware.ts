import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session'

// Primera barrera: sin una sesión firmada válida, el panel responde 404
// (nadie sabe que existe). La revocación de sesiones se verifica además
// en el servidor contra la base de datos.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    const valid = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value)
    if (!valid) {
      return NextResponse.rewrite(new URL('/not-found', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
