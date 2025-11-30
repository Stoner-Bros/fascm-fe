import { NextRequest, NextResponse } from 'next/server';
import { RoleEnum } from './constants/enums';
import {
  ServerCookieGetter,
  getUserRole,
  isAuthenticated
} from './lib/auth-utils';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookieGetter = new ServerCookieGetter(req);
  const isAuth = isAuthenticated(cookieGetter);

  if (
    (pathname.startsWith('/auth') && !isAuth) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (isAuth && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/consignee', req.url));
  }

  // Check if user is authenticated
  if (!isAuth) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Get user role
  const userRole = getUserRole(cookieGetter);

  if (!userRole) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    // Role-based route protection
    if (pathname.startsWith('/consignee')) {
      if (userRole !== RoleEnum.CONSIGNEE) {
        // Redirect to appropriate dashboard based on role
        if (userRole === RoleEnum.SUPPLIER) {
          return NextResponse.redirect(new URL('/supplier', req.url));
        }
        // If unknown role, redirect to home
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    if (pathname.startsWith('/supplier')) {
      if (userRole !== RoleEnum.SUPPLIER) {
        // Redirect to appropriate dashboard based on role
        if (userRole === RoleEnum.CONSIGNEE) {
          return NextResponse.redirect(new URL('/consignee', req.url));
        }
        // If unknown role, redirect to home
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // If any error occurs in processing, redirect to sign-in
    // eslint-disable-next-line no-console
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
