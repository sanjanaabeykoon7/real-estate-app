'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NextAuthSessionProvider>
        {children}
      </NextAuthSessionProvider>
    </QueryClientProvider>
  );
}

// Keep this for backward compatibility if you're importing SessionProvider elsewhere
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}