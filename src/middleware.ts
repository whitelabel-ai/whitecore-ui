import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith('/admin') && token?.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        if (token) return true;

        const pathname = req.nextUrl.pathname;
        const isPublic = pathname === '/login' || pathname === '/register' || pathname === '/';
        return isPublic;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next|api/auth|.*\\..*).*)'],
};
