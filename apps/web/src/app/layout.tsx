import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import Providers from '@/components/Providers'

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Real Estate Hub - Find Your Perfect Property",
  description: "Discover your dream property with our extensive collection of premium Listings. Professional real estate services you can trust.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}