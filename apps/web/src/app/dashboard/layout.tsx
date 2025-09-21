'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { SessionProvider } from 'next-auth/react';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </SessionProvider>
  );
}