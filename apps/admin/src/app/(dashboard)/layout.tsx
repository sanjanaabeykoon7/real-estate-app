'use client';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Home, Users, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 text-white flex flex-col fixed left-0 top-0 bottom-0 z-30">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Link 
            href="/listings" 
            className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg hover:bg-slate-800 transition-colors group"
          >
            <Home className="w-5 h-5 text-slate-400 group-hover:text-white" />
            <span>Listings</span>
          </Link>
          <Link 
            href="/users" 
            className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg hover:bg-slate-800 transition-colors group"
          >
            <Users className="w-5 h-5 text-slate-400 group-hover:text-white" />
            <span>Users</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-900/60 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}