import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Mock',
      credentials: { email: {}, password: {} },
      async authorize() {
        return { id: '1', email: 'admin@demo.com', role: 'SUPER_ADMIN' };
      },
    }),
  ],
  
  pages: {
    signIn: '/api/auth/signin',  // use built-in page
  },

  callbacks: {
    async jwt({ token, user }) {
      if ((user as any)?.role) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (token?.role && session.user) {
        session.user.role = (token as any).role;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      return baseUrl; // → http://localhost:3003/
    },
  },  
};