'use client';

import Link from "next/link";
import { useState } from "react";
import AuthModal from "./AuthModal";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <>
      <header className="bg-[#002b4c] shadow-sm border-b">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">Real Estate Hub</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-white hover:text-[#0dcaf0] font-medium transition-colors">
                Home
              </Link>
              <Link href="#listings" className="text-white hover:text-[#0dcaf0] font-medium transition-colors">
                All Properties
              </Link>
              <Link href="/about" className="text-white hover:text-[#0dcaf0] font-medium transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-white hover:text-[#0dcaf0] font-medium transition-colors">
                Contact Us
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Profile Icon and Add Listing Button */}
              <button 
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="hidden md:inline-flex items-center px-1.5 py-1.5 rounded-2xl text-[#002b4c] bg-white hover:bg-[#0dcaf0] font-medium transition-colors cursor-pointer" 
                aria-label="User Profile"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.822 18.096c-3.439-.794-6.64-1.49-5.09-4.418 4.72-8.912 1.251-13.678-3.732-13.678-5.082 0-8.464 4.949-3.732 13.678 1.597 2.945-1.725 3.641-5.09 4.418-3.073.71-3.188 2.236-3.178 4.904l.004 1h23.99l.004-.969c.012-2.688-.092-4.222-3.176-4.935z"/>
                </svg>
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-2xl font-medium transition-colors cursor-pointer">
                Add Listing
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4.5 -mt-1">
                <span className="text-xl font-bold">Real Estate Hub</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your trusted partner in finding the perfect property. We make real estate simple, transparent and rewarding.
              </p>
            </div>
            
            <div className="ml-14">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="#listings" className="text-gray-400 hover:text-white text-sm transition-colors">Browse Properties</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-400 text-sm">Property Sales</span></li>
                <li><span className="text-gray-400 text-sm">Property Management</span></li>
                <li><span className="text-gray-400 text-sm">Real Estate Consultation</span></li>
              </ul>
            </div>
            
            <div className="-ml-6">
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2">
                {/* Phone */}
                <p className="flex items-center text-gray-400 text-sm">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 22.621l-3.521-6.795c-.008.004-1.974.97-2.064 1.011-2.24 1.086-6.799-7.82-4.609-8.994l2.083-1.026-3.493-6.817-2.106 1.039c-7.202 3.755 4.233 25.982 11.6 22.615.121-.055 2.102-1.029 2.11-1.033z" />
                  </svg>
                  (+94) 12 345 6789
                </p>

                {/* Email */}
                <p className="flex items-center text-gray-400 text-sm">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12.713l-11.985-9.713h23.971l-11.986 9.713zm-5.425-1.822l-6.575-5.329v12.501l6.575-7.172zm10.85 0l6.575 7.172v-12.501l-6.575 5.329zm-1.557 1.261l-3.868 3.135-3.868-3.135-8.11 8.848h23.956l-8.11-8.848z"/>
                  </svg>
                  enquiry@realestate.com
                </p>

                {/* Address */}
                <p className="flex items-center text-gray-400 text-sm">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" clipRule="evenodd">
                    <path d="M6 7v-7h13v10h5v14h-23v-17h5zm0 16v-4h-1v4h1zm8-4h-3v4h3v-4zm6 0h-1v4h1v-4zm2-7h-3v6h2v4h1v-10zm-5-10h-9v20h1v-5h7v5h1v-20zm-13 20v-4h2v-9h-3v13h1zm17-6h-1v-2h1v2zm-17-2h1v2h-1v-2zm8 1h-2v-2h2v2zm3 0h-2v-2h2v2zm-10-4v2h-1v-2h1zm7 1h-2v-2h2v2zm3 0h-2v-2h2v2zm-3-3h-2v-2h2v2zm3 0h-2v-2h2v2zm-3-3h-2v-2h2v2zm3 0h-2v-2h2v2z"/>
                  </svg>
                  Office 001, The Twin Towers, Real Estate Road, Colombo, Sri Lanka
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm -mb-2">
              © 2025 Real Estate Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}