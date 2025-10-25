import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // حماية صفحات تتطلب تسجيل دخول عادي
  const protectedRoutes = ['/dashboard', '/profile', '/consultations', '/appointments'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const regularToken = request.cookies.get('auth_token')?.value;
    
    if (!regularToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // إعادة توجيه المستخدمين المسجلين من صفحات التسجيل
  if (pathname === '/login' || pathname === '/register') {
    const regularToken = request.cookies.get('auth_token')?.value;
    
    if (regularToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
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
