import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email;
        const password = credentials.password;

        const user = db
          .prepare('SELECT id, email, name, password_hash, role, company_id FROM users WHERE email = ? AND is_active = 1')
          .get(email) as {
          id: string;
          email: string;
          name: string;
          password_hash: string;
          role: string;
          company_id: string | null;
        } | undefined;

        if (!user) return null;

        const valid = bcrypt.compareSync(password, user.password_hash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.company_id,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.companyId = user.companyId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
