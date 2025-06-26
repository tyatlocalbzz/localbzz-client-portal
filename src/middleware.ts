import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // Skip middleware for API routes and static files
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Extract subdomain and redirect to portal if on subdomain
  const parts = hostname.split('.')
  
  if (parts.length >= 3 && !hostname.includes('localhost') && !hostname.includes('vercel.app')) {
    const subdomain = parts[0]
    
    // If not already on portal route, redirect to portal
    if (!url.pathname.startsWith('/portal/')) {
      url.pathname = `/portal/${subdomain}`
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 