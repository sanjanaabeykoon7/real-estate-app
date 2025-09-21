'use client';

import { usePathname } from 'next/navigation';
import ClientLayout from './ClientLayout';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return <>{children}</>;
  }

  return <ClientLayout>{children}</ClientLayout>;
}