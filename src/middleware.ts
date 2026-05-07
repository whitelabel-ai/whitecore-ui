import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const secret = process.env.NEXTAUTH_SECRET || 'dev-secret-local-change-in-production';

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
    secret,
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
