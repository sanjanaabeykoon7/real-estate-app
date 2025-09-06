import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import SearchBar from '@/components/SearchBar';
import PropertyImage from '@/components/PropertyImage';

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
      <section style={{ position: 'relative', background: 'linear-gradient(to bottom right, #2563eb, #1d4ed8, #1e40af)', color: 'white', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: '0', backgroundColor: 'black', opacity: '0.1' }}></div>
        <div style={{ position: 'absolute', inset: '0', backgroundImage: `url('data:image/svg+xml,%3Csvg%20width=\'60\'%20height=\'60\'%20viewBox=\'0 0%2060%2060\'%20xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg%20fill=\'none\'%20fill-rule=\'evenodd\'%3E%3Cg%20fill=\'%23ffffff\'%20fill-opacity=\'0.03\'%3E%3Ccircle%20cx=\'30\'%20cy=\'30\'%20r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`, opacity: '0.4' }}></div>
        
        <div style={{ position: 'relative', maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '7rem', paddingBottom: '7rem' }}>
          <div style={{ maxWidth: '64rem', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
            <div>
              <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1.5rem', lineHeight: '1.2' }}>
                Find Your Dream Property
                <span style={{ display: 'block', color: '#bfdbfe', marginTop: '0.5rem' }}>With Confidence</span>
              </h1>
              <p style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#dbeafe', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.75' }}>
                Discover exceptional properties, connect with trusted agents and make your homeownership dreams a reality
              </p>
            </div>
            
            <div style={{ flexGrow: '1', display: 'flex', flexDirection: 'row', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
              <Link 
                href="#listings"
                style={{ display: 'inline-flex', alignItems: 'center', paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1rem', paddingBottom: '1rem', color: '#2563eb', borderRadius: '0.5rem', fontWeight: '600', backgroundColor: '#e5e7eb', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', transition: 'all 0.3s' }}
              >
                Browse Properties
                
              </Link>
              <Link 
                href="/contact"
                style={{ display: 'inline-flex', alignItems: 'center', paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1rem', paddingBottom: '1rem', border: '2px solid white', color: 'white', borderRadius: '0.5rem', fontWeight: '600', transition: 'all 0.3s' }}
              >
                Contact Us
              </Link>
            </div>

            {/* Trust Indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1.5rem', marginTop: '4rem', textAlign: 'center' }}>
              <div style={{ color: '#dbeafe' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>500+</div>
                <div style={{ fontSize: '0.875rem' }}>Properties Available</div>
              </div>
              <div style={{ color: '#dbeafe' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>1000+</div>
                <div style={{ fontSize: '0.875rem' }}>Happy Customers</div>
              </div>
              <div style={{ color: '#dbeafe' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>5+</div>
                <div style={{ fontSize: '0.875rem' }}>Years Experience</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0' }}>
          <svg style={{ width: '100%', height: '4rem', fill: 'white' }} viewBox="0 0 1440 74" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,53.3C1248,53,1344,43,1392,37.3L1440,32L1440,74L1392,74C1344,74,1248,74,1152,74C1056,74,960,74,864,74C768,74,672,74,576,74C480,74,384,74,288,74C192,74,96,74,48,74L0,74Z"/>
          </svg>
        </div>
      </section>

      {/* Search Bar */}
      <section style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem', position: 'relative', zIndex: '10' }}>
        <SearchBar />
      </section>

      {/* Featured Properties Section */}
      {!hasFilters && featuredListings.length > 0 && (
        <section style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ display: 'inline-block', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', background: 'linear-gradient(to right, #dbeafe, #bfdbfe)', color: '#1d4ed8', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem', border: '1px solid #bfdbfe' }}>
              Featured Properties
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              Exclusive Real Estate Collection
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#4b5563', maxWidth: '52rem', marginLeft: 'auto', marginRight: 'auto' }}>
              Explore our selected collection of exceptional properties that offer the perfect blend of luxury, comfort and value
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {featuredListings.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} featured={true} />
            ))}
          </div>
        </section>
      )}

      {/* All Listings Section */}
      <section id="listings" style={{ background: 'linear-gradient(to bottom right, #f9fafb, #eff6ff)', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              {hasFilters ? 'Search Results' : 'Latest Properties'}
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#4b5563', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto' }}>
              {hasFilters 
                ? `Found ${listings.length} ${listings.length === 1 ? 'property' : 'properties'} matching your criteria`
                : 'Discover your perfect property from our collection of premium and versatile listings'
              }
            </p>
          </div>

          {listings.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1.5rem' }}>
              {listings.map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
              <div style={{ width: '8rem', height: '8rem', background: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto', marginBottom: '2rem', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)' }}>
                <svg style={{ width: '4rem', height: '4rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>No Properties Found</h3>
              <p style={{ color: '#4b5563', marginBottom: '2rem', fontSize: '1.125rem', maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto' }}>
                We couldn't find any properties matching your search criteria. Try adjusting your filters or browse all available properties.
              </p>
              <div style={{ marginTop: '1rem' }}>
                <Link
                  href="/"
                  style={{ display: 'inline-flex', alignItems: 'center', paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1rem', paddingBottom: '1rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.5rem', fontWeight: '600', transition: 'all 0.3s', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                >
                  <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset All Filters
                </Link>
              </div>
            </div>
          )}

          {!hasFilters && listings.length >= 12 && (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <Link
                href="/listings"
                style={{ display: 'inline-flex', alignItems: 'center', paddingLeft: '2.5rem', paddingRight: '2.5rem', paddingTop: '1rem', paddingBottom: '1rem', background: 'linear-gradient(to right, #2563eb, #1d4ed8)', color: 'white', borderRadius: '0.75rem', fontWeight: '600', transition: 'all 0.3s', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
              >
                View All Properties
                <svg style={{ marginLeft: '0.5rem', width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      {!hasFilters && (
        <section style={{ paddingTop: '4rem', paddingBottom: '4rem', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span style={{ display: 'inline-block', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', background: 'linear-gradient(to right, #f0fdf4, #ecfdf5)', color: '#15803d', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem', border: '1px solid #dcfce7' }}>
                Why Choose Real Estate Hub
              </span>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
                Your Trusted Real Estate Partner
              </h2>
              <p style={{ fontSize: '1.25rem', color: '#4b5563', maxWidth: '48rem', marginLeft: 'auto', marginRight: 'auto' }}>
                With years of experience and thousands of successful transactions, we're committed to making your real estate journey seamless and rewarding
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '2rem' }}>
              <div style={{ textAlign: 'center', padding: '2rem', borderRadius: '1rem', background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe' }}>
                <div style={{ width: '4rem', height: '4rem', backgroundColor: '#2563eb', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto', marginBottom: '1.5rem' }}>
                  <svg style={{ width: '2rem', height: '2rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>Verified Properties</h3>
                <p style={{ color: '#4b5563' }}>All our listings are thoroughly verified and authenticated to ensure quality and legitimacy.</p>
              </div>

              <div style={{ textAlign: 'center', padding: '2rem', borderRadius: '1rem', background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)', border: '1px solid #f0fdf4' }}>
                <div style={{ width: '4rem', height: '4rem', backgroundColor: '#16a34a', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto', marginBottom: '1.5rem' }}>
                  <svg style={{ width: '2rem', height: '2rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>Expert Agents</h3>
                <p style={{ color: '#4b5563' }}>Work with experienced professionals who specialize in the local market and your needs.</p>
              </div>

              <div style={{ textAlign: 'center', padding: '2rem', borderRadius: '1rem', background: 'linear-gradient(to bottom right, #faf5ff, #fdf2f8)', border: '1px solid #f3e8ff' }}>
                <div style={{ width: '4rem', height: '4rem', backgroundColor: '#9333ea', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto', marginBottom: '1.5rem' }}>
                  <svg style={{ width: '2rem', height: '2rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>Quick Process</h3>
                <p style={{ color: '#4b5563' }}>Streamlined procedures and digital tools make buying or selling faster and more efficient.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final Stats Section */}
      {!hasFilters && (
        <section style={{ background: 'linear-gradient(to right, #2563eb, #1d4ed8, #1e40af)', color: 'white', paddingTop: '4rem', paddingBottom: '4rem', position: 'relative', overflow: 'hidden' }}>
          <>
            <div style={{ position: 'absolute', inset: '0', backgroundColor: 'black', opacity: '0.2' }}></div>
            <div style={{ position: 'absolute', inset: '0', backgroundImage: `url('data:image/svg+xml,%3Csvg%20width=\'60\'%20height=\'60\'%20viewBox=\'0%200%2060%2060\'%20xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg%20fill=\'none\'%20fill-rule=\'evenodd\'%3E%3Cg%20fill=\'%23ffffff\'%20fill-opacity=\'0.1\'%3E%3Cpath%20d=\'M30%2030m-2%200a2%202%200%20104%200a2%202%200%2010-4%200\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`, opacity: '0.5' }}></div>
            
            <div style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem', position: 'relative' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Join Thousands of Satisfied Customers</h2>
                <p style={{ fontSize: '1.25rem', color: '#dbeafe', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto' }}>
                  Experience the difference with Real Estate Hub - where your property dreams become reality
                </p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '2rem', textAlign: 'center' }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)', borderRadius: '1rem', padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>500+</div>
                  <div style={{ color: '#dbeafe', fontSize: '1.125rem', fontWeight: '500' }}>Properties Listed</div>
                  <div style={{ color: '#bfdbfe', fontSize: '0.875rem', marginTop: '0.5rem' }}>Verified & Updated Daily</div>
                </div>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)', borderRadius: '1rem', padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>1000+</div>
                  <div style={{ color: '#dbeafe', fontSize: '1.125rem', fontWeight: '500' }}>Happy Clients</div>
                  <div style={{ color: '#bfdbfe', fontSize: '0.875rem', marginTop: '0.5rem' }}>5-Star Reviews</div>
                </div>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)', borderRadius: '1rem', padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>50+</div>
                  <div style={{ color: '#dbeafe', fontSize: '1.125rem', fontWeight: '500' }}>Expert Agents</div>
                  <div style={{ color: '#bfdbfe', fontSize: '0.875rem', marginTop: '0.5rem' }}>Licensed Professionals</div>
                </div>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)', borderRadius: '1rem', padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>5+</div>
                  <div style={{ color: '#dbeafe', fontSize: '1.125rem', fontWeight: '500' }}>Years Experience</div>
                  <div style={{ color: '#bfdbfe', fontSize: '0.875rem', marginTop: '0.5rem' }}>Market Leaders</div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <Link
                  href="/contact"
                  style={{ display: 'inline-flex', alignItems: 'center', paddingLeft: '2.5rem', paddingRight: '2.5rem', paddingTop: '1rem', paddingBottom: '1rem', backgroundColor: 'white', color: '#2563eb', borderRadius: '0.75rem', fontWeight: 'bold', transition: 'all 0.3s', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
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
    <div style={{ backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)', border: '1px solid #f3f4f6', overflow: 'hidden', transition: 'all 0.3s', ...(featured ? { boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', ring: '2px solid #bfdbfe' } : {}) }}>
      {featured && (
        <div style={{ background: 'linear-gradient(to right, #2563eb, #1d4ed8)', color: 'white', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Featured Property
          </span>
        </div>
      )}
      
      <div style={{ position: 'relative' }}>
        <div style={{ aspectRatio: '16/10', backgroundColor: '#e5e7eb' }}>
          <div style={{ width: '100%', height: '13rem', overflow: 'hidden' }}>
            <PropertyImage
              src={listing.images[0] || '/placeholder-house.jpg'}
              alt={listing.title}
              width={400}
              height={250}
            />
          </div>
        </div>
        
        <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
          <span style={{ paddingLeft: '0.75rem', paddingRight: '0.75rem', paddingTop: '0.25rem', paddingBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '9999px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', ...(listing.status === 'ACTIVE' ? { backgroundColor: '#22c55e', color: 'white' } : listing.status === 'PENDING' ? { backgroundColor: '#eab308', color: 'white' } : listing.status === 'SOLD' ? { backgroundColor: '#ef4444', color: 'white' } : { backgroundColor: '#6b7280', color: 'white' }) }}>
            {listing.status}
          </span>
        </div>

        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <button style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)', borderRadius: '0.5rem', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
              LKR{listing.price.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ flex: '1' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', transition: 'color 0.3s' }}>
              {listing.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', color: '#4b5563', marginBottom: '0.75rem' }}>
              <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', flexShrink: '0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical' }} title={fullAddress}>
                {shortAddress}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem' }}>
              <svg style={{ width: '1rem', height: '1rem', color: '#4b5563' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6" />
              </svg>
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>{listing.beds}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Bed{listing.beds !== 1 ? 's' : ''}</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem' }}>
              <svg style={{ width: '1rem', height: '1rem', color: '#4b5563' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>{listing.baths}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Bath{listing.baths !== 1 ? 's' : ''}</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.25rem' }}>
              <svg style={{ width: '1rem', height: '1rem', color: '#4b5563' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>
              {listing.sqft ? `${Math.round(listing.sqft / 1000)}k` : 'N/A'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Sq ft</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Listed by</div>
            <div style={{ fontWeight: '600', color: '#111827' }}>{listing.owner.name}</div>
          </div>
          <Link
            href={`/listings/${listing.id}`}
            style={{ display: 'inline-flex', alignItems: 'center', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', backgroundColor: '#2563eb', color: 'white', fontSize: '0.875rem', fontWeight: '600', borderRadius: '0.5rem', transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
          >
            View Details
            <svg style={{ marginLeft: '0.5rem', width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}