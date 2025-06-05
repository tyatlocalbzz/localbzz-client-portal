import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // Skip middleware for API routes, static files, and special Next.js routes
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Extract subdomain
  const parts = hostname.split('.')
  
  // Handle subdomain routing for production
  if (parts.length >= 3 && !hostname.includes('localhost') && !hostname.includes('vercel.app')) {
    const subdomain = parts[0]
    
    // Add subdomain info to headers for the app to access
    const response = NextResponse.next()
    response.headers.set('x-subdomain', subdomain)
    response.headers.set('x-hostname', hostname)
    
    return response
  }

  // For localhost and Vercel preview deployments, pass through normally
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