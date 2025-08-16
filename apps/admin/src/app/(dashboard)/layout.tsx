'use client';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* 🔷 Sidebar */}
      <aside className="w-64 bg-slate-800 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-6">Admin</h2>
        <nav className="space-y-2 text-sm">
          <Link href="/listings" className="block hover:text-blue-300">
            🏠 Listings
          </Link>
          <Link href="/users" className="block hover:text-blue-300">
            👥 Users
          </Link>
        </nav>
        <button
          onClick={() => signOut()}
          className="mt-auto text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
        >
          Logout
        </button>
      </aside>

      {/* 🔷 Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}