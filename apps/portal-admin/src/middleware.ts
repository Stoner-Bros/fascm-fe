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
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (isAuth && !pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/dashboard/overview', req.url));
  }

  // Check if user is authenticated
  if (!isAuth) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }

  // Get user role
  const userRole = getUserRole(cookieGetter);

  if (
    !userRole ||
    userRole === RoleEnum.CONSIGNEE ||
    userRole === RoleEnum.SUPPLIER
  ) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
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
