import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/admin'];

// Routes that should redirect authenticated users away
const authRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route (login)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists, validate it for protected routes
  if (isProtectedRoute && token) {
    try {
      // Decode JWT payload (without verification - verification happens on API)
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Check token expiration
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        // Token expired, clear it and redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
      }

      // Check if user has admin role
      const role = payload.role;
      if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      // Invalid token format, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // If authenticated user tries to access login page, redirect to admin
  if (isAuthRoute && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Check if token is not expired and has admin role
      if (
        (!payload.exp || Date.now() < payload.exp * 1000) &&
        ['SUPER_ADMIN', 'ADMIN'].includes(payload.role)
      ) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } catch {
      // Invalid token, let them proceed to login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all admin routes
    '/admin/:path*',
    // Match login page
    '/login',
    // Don't match API routes, static files, etc.
  ],
};
