import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Real Estate Hub - Find Your Perfect Property",
  description: "Discover your dream property with our extensive collection of premium properties. Professional real estate services you can trust.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <header className="bg-white shadow-sm border-b">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">Real Estate Hub</span>
              </Link>
              
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Home
                </Link>
                <Link href="/listings" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Properties
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  About
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Contact
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <button className="hidden md:inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                  Sign In
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  List Property
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>{children}</main>

        <footer className="bg-gray-900 text-white mt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  
                  <span className="text-xl font-bold">Real Estate Hub</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Your trusted partner in finding the perfect property. We make real estate simple, transparent and rewarding.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link href="/listings" className="text-gray-400 hover:text-white text-sm transition-colors">Browse Properties</Link></li>
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
              
              <div>
                <h3 className="font-semibold mb-4">Contact Info</h3>
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">📞 (555) 123-4567</p>
                  <p className="text-gray-400 text-sm">📧 info@dreamhome.com</p>
                  <p className="text-gray-400 text-sm">📍 123 Real Estate St, City</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center">
              <p className="text-gray-400 text-sm">
                © 2025 Real Estate Hub. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}