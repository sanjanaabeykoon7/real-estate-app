import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const { pathname } = req.nextUrl;

  // Allow access to login page and API routes
  if (pathname.startsWith('/login') || 
      pathname.startsWith('/api/auth') || 
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Redirect to login if no token
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Check if user has admin role
  const userRole = token.role as string;
  if (userRole !== 'SUPER_ADMIN' && userRole !== 'MODERATOR') {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('error', 'AccessDenied');
    return NextResponse.redirect(url);
  }

  // Allow access to admin routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};