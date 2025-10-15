import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Simple password protection middleware
 * 
 * To enable password protection:
 * 1. Set APP_ACCESS_PASSWORD environment variable in Vercel/Netlify
 * 2. This middleware will protect all routes except /api/auth-check
 * 
 * To disable:
 * - Simply don't set APP_ACCESS_PASSWORD environment variable
 */

export function middleware(request: NextRequest) {
  // Only enable if APP_ACCESS_PASSWORD is set
  const accessPassword = process.env.APP_ACCESS_PASSWORD;
  
  // If no password is configured, allow all access
  if (!accessPassword) {
    return NextResponse.next();
  }

  // Allow access to auth check endpoint
  if (request.nextUrl.pathname === '/api/auth-check') {
    return NextResponse.next();
  }

  // Allow access to static files
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if user has valid auth cookie
  const authCookie = request.cookies.get('app-auth');
  
  if (authCookie?.value === accessPassword) {
    return NextResponse.next();
  }

  // Redirect to login page if not on it already
  if (request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
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
};

