import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy (Middleware) for route protection
 *
 * Protected routes (require authentication):
 * - / (root)
 * - /[tournament] (tournament pages)
 * - /users
 *
 * Public routes (redirect to / if authenticated):
 * - /login
 * - /accept-invitation
 */

// Define route patterns
const protectedRoutes = ['/', '/users'];
const publicRoutes = ['/login', '/accept-invitation'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session cookie (set by Firebase Auth)
  const sessionCookie = request.cookies.get('session')?.value;
  const hasSession = !!sessionCookie;

  // Check if current path is a protected route or tournament route
  const isProtectedRoute =
    protectedRoutes.some((route) => pathname === route) ||
    // Match tournament routes like /tournament-id but not /login or /accept-invitation
    (pathname.startsWith('/') &&
      pathname.split('/').length === 2 &&
      pathname !== '/' &&
      !publicRoutes.includes(pathname) &&
      !pathname.startsWith('/api') &&
      !pathname.startsWith('/_next'));

  // Check if current path is a public auth route
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from public auth routes to home
  if (isPublicRoute && hasSession) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - images and other static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp)).*)',
  ],
};
