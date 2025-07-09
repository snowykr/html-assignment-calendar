import NextAuth from "next-auth"
import authConfig from "./auth.config"
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './routing';

const intlMiddleware = createIntlMiddleware(routing);

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Skip intl middleware for API routes
  if (pathname.startsWith('/api/')) {
    return;
  }
  
  // Require authentication for protected routes
  const protectedRoutes = ['/calendar', '/subjects', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.includes(route)
  );
  
  if (isProtectedRoute && !req.auth) {
    const landingUrl = new URL('/', req.nextUrl.origin);
    return Response.redirect(landingUrl);
  }
  
  // Redirect authenticated users from root to calendar
  if (pathname === '/' && req.auth) {
    const calendarUrl = new URL('/calendar', req.nextUrl.origin);
    return Response.redirect(calendarUrl);
  }
  
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};