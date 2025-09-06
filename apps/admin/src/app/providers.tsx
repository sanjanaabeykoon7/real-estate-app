'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NextAuthSessionProvider>
        {children}
      </NextAuthSessionProvider>
    </QueryClientProvider>
  );
}

// Keep this for backward compatibility if you're importing SessionProvider elsewhere
export function SessionProvider({ children }: { children: ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}