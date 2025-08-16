'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data } = useSession();
  return (
    <div className="flex h-screen">
      <aside className="w-60 bg-slate-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Admin</h2>
        <nav className="space-y-2">
          <Link href="/listings" className="block hover:underline">Listings</Link>
          <Link href="/users" className="block hover:underline">Users</Link>
        </nav>
        <button onClick={() => signOut()} className="mt-auto text-sm">
          Logout
        </button>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}