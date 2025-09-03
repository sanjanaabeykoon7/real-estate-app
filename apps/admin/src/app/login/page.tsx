'use client';
import type { Session } from "next-auth";
import { signIn, getSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Building2, Shield, Mail, Lock, ArrowRight, AlertCircle, Home } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for URL error parameter
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      switch (urlError) {
        case 'CredentialsSignin':
          setError('Invalid email or password');
          break;
        case 'AccessDenied':
          setError('Access denied. Admin privileges required.');
          break;
        default:
          setError('An error occurred during sign in');
      }
    }
  }, [searchParams]);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if ((session?.user as any)?.role === 'SUPER_ADMIN' || (session?.user as any)?.role === 'MODERATOR') {
        router.push('/listings');
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        switch (result.error) {
          case 'CredentialsSignin':
            setError('Invalid email or password');
            break;
          case 'AccessDenied':
            setError('Access denied. Admin privileges required.');
            break;
          default:
            setError('An error occurred during sign in');
        }
      } else if (result?.ok) {
        router.push('/listings');
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration issues
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle geometric background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e2e8f0\' fill-opacity=\'0.3\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        {/* Floating architectural elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-100 opacity-30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-slate-200 opacity-40 rounded-full blur-3xl animate-pulse animation-delay-2s"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-200 opacity-20 rounded-full blur-2xl animate-pulse animation-delay-4s"></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-center gap-12">
        
        {/* Left side - Branding and illustration */}
        <div className="hidden lg:flex flex-col items-start justify-center flex-1 max-w-lg">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">PropAdmin</h1>
                <p className="text-slate-600">Real Estate Management</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-slate-800 mb-4 leading-tight">
              Manage Your
              <span className="text-blue-600"> Real Estate</span>
              <br />Portfolio
            </h2>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Streamline property management, track listings, and monitor your real estate investments from one comprehensive dashboard.
            </p>
            
            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-slate-700">Property Portfolio Management</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-slate-700">Advanced Analytics & Reporting</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-slate-700">Secure Administrative Controls</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200/50 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
            {/* Mobile header (visible on small screens) */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Admin Portal
              </h1>
              <p className="text-slate-600">
                Sign in to your dashboard
              </p>
            </div>

            {/* Desktop header */}
            <div className="hidden lg:block text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-4 hover:bg-blue-700 hover:scale-105 transition-all duration-300">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-600">
                Sign in to access your admin dashboard
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative bg-blue-600 hover:bg-blue-700 py-3 px-4 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-blue-600"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                <Building2 className="w-4 h-4" />
                <span>Secure Real Estate Administration</span>
              </div>
            </div>
          </div>

          {/* Security notice */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Protected by enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}