import { NextRequest, NextResponse } from 'next/server';
import { RoleEnum } from './constants/enums';
import {
  ServerCookieGetter,
  getUserRole,
  isAuthenticated
} from './lib/auth-utils';
import { checkRouteAccessServer, hasPermission } from './lib/permissions';
import { Permission } from './constants/permissions';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookieGetter = new ServerCookieGetter(req);
  const isAuth = isAuthenticated(cookieGetter);

  // Allow public routes and static files
  if (
    (pathname.startsWith('/auth') && !isAuth) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (isAuth && pathname.startsWith('/auth')) {
    const userRole = getUserRole(cookieGetter);
    // Check if user has access to overview, otherwise redirect to profile
    if (userRole && hasPermission(userRole, Permission.VIEW_OVERVIEW)) {
      return NextResponse.redirect(new URL('/dashboard/overview', req.url));
    } else {
      // Redirect to profile if they don't have overview access
      return NextResponse.redirect(new URL('/dashboard/profile', req.url));
    }
  }

  // Redirect non-authenticated users to sign-in
  if (!isAuth) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }

  // Get user role
  const userRole = getUserRole(cookieGetter);

  // Block unauthorized roles (CONSIGNEE and SUPPLIER should use portal, not admin)
  if (
    !userRole ||
    userRole === RoleEnum.CONSIGNEE ||
    userRole === RoleEnum.SUPPLIER ||
    userRole === RoleEnum.USER
  ) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }

  // Check route-level permissions for dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const hasAccess = checkRouteAccessServer(cookieGetter, pathname);

    if (!hasAccess) {
      // User doesn't have permission for this route
      // If trying to access overview, redirect to profile
      if (pathname === '/dashboard/overview' || pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/dashboard/profile', req.url));
      }
      // For other routes, redirect to profile (or first accessible route)
      return NextResponse.redirect(new URL('/dashboard/profile', req.url));
    }
  }

  // Redirect authenticated users to dashboard if they're on root
  if (pathname === '/') {
    const userRole = getUserRole(cookieGetter);
    // Check if user has access to overview, otherwise redirect to profile
    if (userRole && hasPermission(userRole, Permission.VIEW_OVERVIEW)) {
      return NextResponse.redirect(new URL('/dashboard/overview', req.url));
    } else {
      // Redirect to profile if they don't have overview access
      return NextResponse.redirect(new URL('/dashboard/profile', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
