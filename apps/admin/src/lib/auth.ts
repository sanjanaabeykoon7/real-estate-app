import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Mock',
      credentials: { email: {}, password: {} },
      async authorize() {
        return { id: '1', email: 'admin@demo.com', role: 'SUPER_ADMIN' };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};