'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Users, LogOut, User2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user && 
        ((session.user as any).role !== 'SUPER_ADMIN' && 
        (session.user as any).role !== 'MODERATOR')) {
      signOut({ callbackUrl: '/login' });
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  // Show loading spinner while checking authentication
  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if no session (will redirect in useEffect)
  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 text-white flex flex-col fixed left-0 top-0 bottom-0 z-30">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
          {/* User info */}
          <div className="mt-4 pt-4 pb-5 border-t border-b border-slate-700">
            <div className="flex items-center gap-3">
              <User2 className="w-7 h-7 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 truncate">
                  {session.user.name || session.user.email}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-slate-700 text-slate-200 rounded">
                  {(session.user as any).role}
                </span>
              </div>
            </div>
          </div>
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
            onClick={handleSignOut}
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