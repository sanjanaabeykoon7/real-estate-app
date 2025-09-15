import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import SearchBar from '@/components/SearchBar';
import PropertyImage from '@/components/PropertyImage';
import { twMerge } from 'tailwind-merge';

type ListingWithOwner = Prisma.ListingGetPayload<{
  include: { owner: { select: { name: true } } };
}>;

interface HomeProps {
  searchParams: {
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  // Build filter conditions
  const whereCondition: any = {
    published: true,
  };

  if (resolvedSearchParams.city) {
    whereCondition.address = {
      path: ['city'],
      string_contains: resolvedSearchParams.city,
    };
  }

  if (resolvedSearchParams.minPrice) {
    whereCondition.price = {
      ...whereCondition.price,
      gte: parseInt(resolvedSearchParams.minPrice),
    };
  }

  if (resolvedSearchParams.maxPrice) {
    whereCondition.price = {
      ...whereCondition.price,
      lte: parseInt(resolvedSearchParams.maxPrice),
    };
  }

  if (resolvedSearchParams.beds) {
    whereCondition.beds = {
      gte: parseInt(resolvedSearchParams.beds),
    };
  }

  const listings: ListingWithOwner[] = await prisma.listing.findMany({
    where: whereCondition,
    include: { owner: { select: { name: true } } },
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' }
    ],
    take: 12,
  });

  const featuredListings = listings.filter(l => l.featured).slice(0, 3);
  const hasFilters = Object.keys(resolvedSearchParams).length > 0;

  return (
    <>
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden bg-cover bg-center bg-no-repeat" 
              style={{
                backgroundImage: "url('/images/hero-bg.webp')"  // Replace with your image path
              }}>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-blue-700/45 to-blue-800/50"></div>
        
        {/* Additional dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/15"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-28">
          <div className="max-w-5xl mx-auto text-center">
            <div>
              <h1 className="text-[4rem] font-bold mb-6 leading-tight">
                Find Your Dream Property
                <span className="block text-blue-200 mt-2">With Confidence</span>
              </h1>
              <p className="text-2xl mb-8 text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Discover exceptional properties, connect with trusted agents and make your homeownership dreams a reality
              </p>
            </div>
            
            <div className="flex-grow flex flex-row gap-4 justify-center mb-12">
              <Link 
                href="#listings"
                className="inline-flex items-center px-8 py-4 text-blue-600 rounded-lg font-semibold bg-white/95 hover:bg-white shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Browse Properties
              </Link>
              <Link 
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
              >
                Contact Us
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-6 mt-16 text-center">
              <div className="text-blue-100">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm">Properties Available</div>
              </div>
              <div className="text-blue-100">
                <div className="text-2xl font-bold">1000+</div>
                <div className="text-sm">Happy Customers</div>
              </div>
              <div className="text-blue-100">
                <div className="text-2xl font-bold">5+</div>
                <div className="text-sm">Years Experience</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16" fill="white" viewBox="0 0 1440 74" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,53.3C1248,53,1344,43,1392,37.3L1440,32L1440,74L1392,74C1344,74,1248,74,1152,74C1056,74,960,74,864,74C768,74,672,74,576,74C480,74,384,74,288,74C192,74,96,74,48,74L0,74Z"/>
          </svg>
        </div>
      </section>

      {/* Search Bar */}
      <section className="max-w-7xl mx-auto px-4 relative z-10">
        <SearchBar />
      </section>

      {/* Featured Properties Section */}
      {!hasFilters && featuredListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-sm font-semibold mb-6 border border-blue-200">
              Featured Properties
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Exclusive Real Estate Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Explore our selected collection of exceptional properties that offer the perfect blend of luxury, comfort and value
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-8 mb-8">
            {featuredListings.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} featured={true} />
            ))}
          </div>
        </section>
      )}

      {/* All Listings Section */}
      <section id="listings" className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {hasFilters ? 'Search Results' : 'Latest Properties'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {hasFilters 
                ? `Found ${listings.length} ${listings.length === 1 ? 'property' : 'properties'} matching your criteria`
                : 'Discover your perfect property from our collection of premium and versatile listings'
              }
            </p>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-4 gap-6">
              {listings.map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No Properties Found</h3>
              <p className="text-gray-600 mb-8 text-lg max-w-xl mx-auto">
                We couldn't find any properties matching your search criteria. Try adjusting filters or browse all available properties.
              </p>
              <div className="mt-4">
                <Link
                  href="/"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold transition-all shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset All Filters
                </Link>
              </div>
            </div>
          )}

          {!hasFilters && listings.length >= 12 && (
            <div className="text-center mt-16">
              <Link
                href="/listings"
                className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg"
              >
                View All Properties
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      {!hasFilters && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-6 py-3 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-full text-sm font-semibold mb-6 border border-green-100">
                Why Choose Real Estate Hub
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Your Trusted Real Estate Partner
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                With years of experience and thousands of successful transactions, we're committed to making your real estate journey seamless and rewarding
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <div className="w-18 h-18 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5.48 10.089l1.583-1.464c1.854.896 3.028 1.578 5.11 3.063 3.916-4.442 6.503-6.696 11.311-9.688l.516 1.186c-3.965 3.46-6.87 7.314-11.051 14.814-2.579-3.038-4.301-4.974-7.469-7.911zm14.407.557c.067.443.113.893.113 1.354 0 4.962-4.038 9-9 9s-9-4.038-9-9 4.038-9 9-9c1.971 0 3.79.644 5.274 1.723.521-.446 1.052-.881 1.6-1.303-1.884-1.511-4.271-2.42-6.874-2.42-6.075 0-11 4.925-11 11s4.925 11 11 11 11-4.925 11-11c0-1.179-.19-2.313-.534-3.378-.528.633-1.052 1.305-1.579 2.024z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Properties</h3>
                <p className="text-gray-600">All our listings are thoroughly verified and authenticated to ensure quality and legitimacy.</p>
              </div>

              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-50">
                <div className="w-18 h-18 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-14 h-14 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 61.03" fill="currentColor">
                    <path fillRule="evenodd" d="M12.07,35.86l2.28-.06,1.07,0,1.64,1.9c.38.44.78.89,1.21,1.32a26,26,0,0,1-2.88,2.64c-.54.45-1,.88-1.44,1.23C10.4,44.26,4,46.52,2.13,50.07.32,53.45.62,57.5,0,61H21.16a4.93,4.93,0,0,1,0-.55,27.36,27.36,0,0,1,2.4-9.57,18.55,18.55,0,0,1,2.88-4.33c-4.18,1.19-9.57-.53-10.46-3.82a25.66,25.66,0,0,0,3.2-2.94c.25.2.5.39.77.57a6.92,6.92,0,0,0,4.17,1.15,7,7,0,0,0,4.35-1.17l0,0A22.25,22.25,0,0,0,31,42.71l-.1.24.49-.28a8.45,8.45,0,0,1,1-.49L32.22,42a27.14,27.14,0,0,1-2.63-2.47,18.38,18.38,0,0,0,1.95-2.1l1-1.24.2-.24c.06-.07.13-.14.19-.22h2.25c3.31-7.08,1.21-17.6-5.56-22.06-2.09-1.38-3.58-1.32-6-1.32-2.8,0-4.22.09-6.61,1.67-3.53,2.33-5.69,6.36-6.6,12-.19,2.79-.31,7.61,1.64,9.86ZM47.54,22a2.93,2.93,0,0,0-1.51.4,1.24,1.24,0,0,0-.44.5,1.79,1.79,0,0,0-.14.8,7.27,7.27,0,0,0,1.43,3.48v0h0l3,4.76a25.29,25.29,0,0,0,4,5.29,8.22,8.22,0,0,0,5.74,2.32,8.5,8.5,0,0,0,6.08-2.42,26.45,26.45,0,0,0,4.15-5.65L73.26,26A5.32,5.32,0,0,0,74,23c-.08-.33-.45-.5-1.08-.53h-.41l-.48,0a1.18,1.18,0,0,1-.26,0,5.74,5.74,0,0,1-.92-.05L72,17.33c-8.58,1.35-15-5-24.06-1.27l.65,6a4.94,4.94,0,0,1-1-.05Zm4,21.27a.7.7,0,0,1-.21.21c.59,4.68,1.65,12,2.82,17.51H25.73c.48-5.73,2.13-11.17,7.9-14.38,3.24-1.81,12.94-2.42,16.73-4.82a29,29,0,0,0,1.53-4l0-.12a31.2,31.2,0,0,1-3.47-4.8l-3-4.76a8.61,8.61,0,0,1-1.7-4.35,3.43,3.43,0,0,1,.29-1.56,3,3,0,0,1,1-1.2,3.84,3.84,0,0,1,.73-.37,75.86,75.86,0,0,1-.14-8.56A10.88,10.88,0,0,1,46,10.16c1.1-3.92,4.46-6.75,8.31-8.08,1.87-.64,1.15-2.18,3-2.08,4.48.25,11.38,3.13,14,6.19C75.12,10.47,74.16,15.74,74,21h0a2.17,2.17,0,0,1,1.58,1.63c.24.95,0,2.28-.82,4.1h0l0,.1-3.42,5.63a27.89,27.89,0,0,1-4.43,6l-.09.08.55.8c.58.86,1.25,1.83,1.87,2.6,3.87,2.33,13.41,3,16.61,4.74,5.27,2.93,6.87,8.6,7.5,14.38H65.85a141.65,141.65,0,0,0,2.48-17.46,32.6,32.6,0,0,1-2.42-3.27l-.49-.7a9.92,9.92,0,0,1-5.76,1.7A9.7,9.7,0,0,1,53.35,39a19.18,19.18,0,0,1-1.84,4.28Zm2.05,3.86a3.71,3.71,0,0,1,0-5.43,16,16,0,0,1,5.23,2.41A2.45,2.45,0,0,1,59.93,44c1.66-1.18,3.79-1.66,5.64-2.54,2.21,2.15,2,4.13-.2,6a15.1,15.1,0,0,1-3.48-1.27,3.36,3.36,0,0,1-.24.93l1.68,14H56.59l1.68-14a2.8,2.8,0,0,1-.47-1.53,14.39,14.39,0,0,1-4.24,1.63Zm41.19,2.25c4,2,9.34,1,11.31-2.53a11.14,11.14,0,0,1-1.57-2.08l-.28-.41A8.07,8.07,0,0,1,99,46.17,7.93,7.93,0,0,1,93.48,44c-.09-.07-.17-.16-.26-.24-.2.58-.47,1.27-.75,1.9L92.3,46c-.26-.28-.53-.56-.81-.83.36-.83.69-1.74.9-2.36A28.53,28.53,0,0,1,90,39.43L87.6,35.59a6.89,6.89,0,0,1-1.36-3.49,2.7,2.7,0,0,1,.23-1.26,2.39,2.39,0,0,1,.83-1,2.65,2.65,0,0,1,.58-.3,60.52,60.52,0,0,1-.11-6.89,8.92,8.92,0,0,1,.3-1.56A9.23,9.23,0,0,1,92.14,16a12.74,12.74,0,0,1,3.41-1.52c.76-.22-.11-1.94.68-2,3.82-.39,9.46,2.38,12.13,5.26a9.35,9.35,0,0,1,2.36,5.91l-.15,6.25h0a1.73,1.73,0,0,1,1.27,1.32,5.38,5.38,0,0,1-.66,3.28h0l0,.08L108.39,39A23.31,23.31,0,0,1,105,43.68l.35.52a16.5,16.5,0,0,0,1.8,2.31s0,0,.06.07h0c3.17,2.23,7.81,2.77,10.76,4.42a8.14,8.14,0,0,1,2.58,2.18,16.1,16.1,0,0,1,2.3,7.85h-25a4.15,4.15,0,0,0,0-.49,31.64,31.64,0,0,0-2.38-9.64c-.23-.51-.48-1-.74-1.48ZM89.27,30.69a2.51,2.51,0,0,0-1.22.32.87.87,0,0,0-.34.4,1.33,1.33,0,0,0-.12.65,5.66,5.66,0,0,0,1.15,2.79v0h0l2.41,3.83A20.12,20.12,0,0,0,94.4,43,6.58,6.58,0,0,0,99,44.81a6.77,6.77,0,0,0,4.89-1.94,21.21,21.21,0,0,0,3.33-4.54l2.71-4.47a4.36,4.36,0,0,0,.58-2.38c-.07-.27-.37-.4-.87-.43h-.33l-.39,0h-.21a4.65,4.65,0,0,1-.74,0l.93-4.12c-6.9,1.09-12-4-19.34-1l.52,4.85a4.33,4.33,0,0,1-.82,0Zm-73,4.13C14.4,28.38,15,22.5,20.07,17.44a11.88,11.88,0,0,0,6.35,7.08,33.29,33.29,0,0,1,4.77,4.38c.27-1.12-.77-2.48-2-3.89a6.14,6.14,0,0,1,3,2.93,8.17,8.17,0,0,1,.58,5.27,10,10,0,0,1-.48,1.49.65.65,0,0,0-.25.17l-.4.49s-.08.08-.22.25l-1,1.24a11.37,11.37,0,0,1-2.46,2.39,6.35,6.35,0,0,1-3.75,1.09,6.16,6.16,0,0,1-3.54-1,10.35,10.35,0,0,1-2.21-2.12L16.52,35a.5.5,0,0,0-.27-.17Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Agents</h3>
                <p className="text-gray-600">Work with experienced professionals who specialize in the local market and your needs.</p>
              </div>

              <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                <div className="w-18 h-18 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 120.36 122.88">
                    <path d="M60.18,2.39l1.57,0-8.1,13.53A47.08,47.08,0,0,0,34.52,102l-3.6,13.12A60.18,60.18,0,0,1,60.18,2.39Zm10,47.71H83.66a3.54,3.54,0,0,1,3.54,3.54,3.49,3.49,0,0,1-.61,2l-40,67.26-6.49-2.53L52.73,74.26l-16,.27a3.52,3.52,0,0,1-3.09-5.31L75.12,0l6.54,2.29L70.17,50.1Zm20-39.69a60.19,60.19,0,0,1-30,112.34l-1.59,0,8-13.53A47.08,47.08,0,0,0,87,23.87l3.24-13.46Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Process</h3>
                <p className="text-gray-600">Streamlined procedures and digital tools make buying or selling faster and more efficient.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final Stats Section */}
      {!hasFilters && (
        <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-16 relative overflow-hidden">
          <>
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2760%27%20height%3D%2760%27%20viewBox%3D%270%200%2060%2060%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%3E%3Cg%20fill%3D%27%23ffffff%27%20fill-opacity%3D%270.1%27%3E%3Cpath%20d%3D%27M30%2030m-2%200a2%202%200%20104%200a2%202%200%2010-4%200%27%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
            
            <div className="max-w-7xl mx-auto px-4 relative">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Join Thousands of Satisfied Customers</h2>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                  Experience the difference with Real Estate Hub - where your property dreams become reality
                </p>
              </div>
              
              <div className="grid grid-cols-4 gap-8 text-center">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                  <div className="text-5xl font-bold mb-3">500+</div>
                  <div className="text-blue-100 text-lg font-medium">Properties Listed</div>
                  <div className="text-blue-200 text-sm mt-2">Verified & Updated Daily</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                  <div className="text-5xl font-bold mb-3">1000+</div>
                  <div className="text-blue-100 text-lg font-medium">Happy Clients</div>
                  <div className="text-blue-200 text-sm mt-2">5-Star Reviews</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                  <div className="text-5xl font-bold mb-3">50+</div>
                  <div className="text-blue-100 text-lg font-medium">Expert Agents</div>
                  <div className="text-blue-200 text-sm mt-2">Licensed Professionals</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                  <div className="text-5xl font-bold mb-3">5+</div>
                  <div className="text-blue-100 text-lg font-medium">Years Experience</div>
                  <div className="text-blue-200 text-sm mt-2">Market Leaders</div>
                </div>
              </div>

              <div className="text-center mt-12">
                <Link
                  href="/contact"
                  className="inline-flex items-center px-10 py-4 bg-white text-blue-600 rounded-xl font-bold transition-all shadow-lg"
                >
                  Start Your Journey Today
                </Link>
              </div>
            </div>
          </>
        </section>
      )}
    </>
  );
}

// Enhanced Property Card Component
function PropertyCard({ listing, featured = false }: { listing: ListingWithOwner, featured?: boolean }) {
  const address = listing.address as { street?: string; city?: string; state?: string; zipCode?: string };
  const fullAddress = [address.street, address.city, address.state].filter(Boolean).join(', ');
  const shortAddress = address.city || 'Location not specified';

  return (
    <div className={twMerge(
      "bg-white rounded-2xl shadow-[0_4px_20px_rgba(13,202,240,0.15)] border border-gray-100 overflow-hidden transition-all",
      featured && "shadow-md ring-2 ring-blue-200"
    )}>
      {featured && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3">
          <span className="text-sm font-bold flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Featured Property
          </span>
        </div>
      )}
      
      <div className="relative">
        {/* Image */}
        <div className="aspect-[18/10] bg-gray-200 overflow-hidden">
          <PropertyImage
            src={listing.images[0] || '/placeholder-house.jpg'}
            alt={listing.title}
            className="w-full h-full object-cover"
            width={400}
            height={250}
          />

          {/* Gradient overlay (bottom fade) */}
          <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={twMerge(
            "px-1.5 py-0.5 text-xs font-semibold rounded-full shadow-lg",
            listing.status === 'ACTIVE' && "bg-green-500 text-white",
            listing.status === 'PENDING' && "bg-yellow-500 text-white",
            listing.status === 'SOLD' && "bg-red-500 text-white",
            !['ACTIVE', 'PENDING', 'SOLD'].includes(listing.status) && "bg-gray-500 text-white"
          )}>
            {listing.status}
          </span>
        </div>

        {/* Favorite/Save Button */}
        <div className="absolute top-2 right-2">
          <button className="transition-all hover:scale-110 focus:outline-none cursor-pointer" title="Add to favorites">
            <svg className="w-7 h-7 transition-all text-white/90 hover:text-red-500 drop-shadow-lg" fill="currentColor" stroke="none" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Location */}
        <div className="absolute bottom-1 left-2 text-white flex items-center drop-shadow-sm">
          <svg className="w-3.5 h-3.5 mr-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
          </svg>
          <span className="text-sm line-clamp-1" title={fullAddress}>
            {shortAddress}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Price */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 transition-colors">
              {listing.title}
            </h3>
            <div className="flex items-center mb-3">
                <div className="text-xl font-bold text-[#868b96]">
                  LKR {listing.price.toLocaleString()}
                </div>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center justify-center text-center p-3 bg-gray-100 rounded-lg">
            <div className="text-lg">🛏️</div>
            <div className="text-lg font-bold text-gray-900 mt-1">{listing.beds}</div>
            <div className="text-xs text-gray-500">Bedroom{listing.beds !== 1 ? 's' : ''}</div>
          </div>
          
          <div className="flex flex-col items-center justify-center text-center p-3 bg-gray-100 rounded-lg">
            <div className="text-lg">🛁</div>
            <div className="text-lg font-bold text-gray-900 mt-1">{listing.baths}</div>
            <div className="text-xs text-gray-500">Bathroom{listing.baths !== 1 ? 's' : ''}</div>
          </div>
          
          <div className="text-center p-3 bg-gray-100 rounded-lg">
            <div className="flex items-center justify-center mb-2.5 mt-1.5">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {listing.sqft ? `${Math.round(listing.sqft / 1000)}k` : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">Sq ft</div>
          </div>
        </div>

        {/* Owner and Details Link */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-1">Listed by</div>
            <div className="font-semibold text-gray-900">{listing.owner.name}</div>
          </div>
          <Link
            href={`/listings/${listing.id}`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all shadow-lg"
          >
            View Details
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}