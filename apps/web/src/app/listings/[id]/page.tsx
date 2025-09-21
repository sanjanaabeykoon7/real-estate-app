import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Prisma } from '@prisma/client';
import PropertyImage from '@/components/PropertyImage';
import FavoriteButton from '@/components/FavoriteButton';
import { MapPin, Bed, Bath, Square, Calendar, User, Phone, Mail, ArrowLeft, CheckCircle, AlertCircle, Clock, XCircle, Share2, Camera } from 'lucide-react';

type ListingWithOwner = Prisma.ListingGetPayload<{
  include: { owner: { select: { name: true; email: true; phone: true } } };
}>;

interface PropertyPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;

  const listing: ListingWithOwner | null = await prisma.listing.findUnique({
    where: { id },
    include: { 
      owner: { 
        select: { 
          name: true, 
          email: true, 
          phone: true 
        } 
      } 
    },
  });

  if (!listing) {
    notFound();
  }

  const address = listing.address as { street?: string; city?: string; state?: string; zipCode?: string };
  const fullAddress = [address.street, address.city, address.state, address.zipCode].filter(Boolean).join(', ');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SOLD':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'SOLD':
        return <XCircle className="w-4 h-4" />;
      case 'INACTIVE':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Back Navigation */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Properties
          </Link>
        </div>
      </section>

      {/* Hero Section with Images */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Image */}
            <div className="lg:col-span-2">
              <div className="relative aspect-[16/9] bg-gray-200 rounded-2xl overflow-hidden">
                <PropertyImage
                  src={listing.images[0] || '/placeholder-house.jpg'}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  width={800}
                  height={500}
                />
                
                {/* Favorite Button */}
                <div className="absolute top-4 right-4">
                  <FavoriteButton listingId={listing.id} />
                </div>

                {/* Share Button */}
                <div className="absolute top-4 left-4">
                  <button>
                    <Share2 className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Image Count */}
                {listing.images.length > 1 && (
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Camera className="w-4 h-4 mr-1" />
                      {listing.images.length} Photos
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Side Images */}
            <div className="space-y-6">
              {listing.images.slice(1, 3).map((image, index) => (
                <div key={index} className="aspect-[16/10] bg-gray-200 rounded-2xl overflow-hidden">
                  <PropertyImage
                    src={image}
                    alt={`${listing.title} - Image ${index + 2}`}
                    className="w-full h-full object-cover"
                    width={400}
                    height={250}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Property Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Property Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                    <div className="flex items-center text-gray-600 text-lg mb-4">
                      <MapPin className="w-5 h-5 mr-2" />
                      {fullAddress}
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(listing.status)}`}>
                    {getStatusIcon(listing.status)}
                    <span className="ml-1">{listing.status}</span>
                  </div>
                </div>

                <div className="text-3xl font-bold text-blue-600 mb-6">
                  LKR {listing.price.toLocaleString()}
                </div>

                {/* Property Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border border-blue-200">
                    <Bed className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900">{listing.beds}</div>
                    <div className="text-sm text-gray-600">Bedroom{listing.beds !== 1 ? 's' : ''}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center border border-green-200">
                    <Bath className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900">{listing.baths}</div>
                    <div className="text-sm text-gray-600">Bathroom{listing.baths !== 1 ? 's' : ''}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center border border-purple-200">
                    <Square className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900">
                      {listing.sqft ? `${listing.sqft.toLocaleString()}` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Sq ft</div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Agent</h3>
                  
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{listing.owner.name}</div>
                      <div className="text-sm text-gray-600">Property Agent</div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {listing.owner.phone && (
                      <div className="flex items-center text-gray-700">
                        <Phone className="w-5 h-5 mr-3 text-gray-500" />
                        <span>{listing.owner.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-700">
                      <Mail className="w-5 h-5 mr-3 text-gray-500" />
                      <span>{listing.owner.email}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors hover:bg-blue-700 flex items-center justify-center">
                      <Phone className="w-5 h-5 mr-2" />
                      Call Now
                    </button>
                    
                    <button className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-xl font-semibold transition-colors hover:bg-gray-200 flex items-center justify-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Send Message
                    </button>
                  </div>
                </div>

                {/* Property Details Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg mt-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Property Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property Type</span>
                      <span className="font-semibold text-gray-900">Residential</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className={`font-semibold ${
                        listing.status === 'ACTIVE' ? 'text-green-600' :
                        listing.status === 'PENDING' ? 'text-yellow-600' :
                        listing.status === 'SOLD' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Listed On</span>
                      <span className="font-semibold text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {listing.sqft && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price per sq ft</span>
                        <span className="font-semibold text-gray-900">
                          LKR {Math.round(listing.price / listing.sqft).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Images Section */}
      {listing.images.length > 3 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">More Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {listing.images.slice(3).map((image, index) => (
                <div key={index} className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
                  <PropertyImage
                    src={image}
                    alt={`${listing.title} - Image ${index + 4}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    width={300}
                    height={300}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Interested in This Property?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Contact our agent today to schedule a viewing or get more information
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl">
              <Phone className="w-5 h-5 mr-2" />
              Schedule Viewing
            </button>
            <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold transition-all hover:bg-white/10 backdrop-blur-sm">
              <Mail className="w-5 h-5 mr-2" />
              Request Info
            </button>
          </div>
        </div>
      </section>

      {/* Similar Properties Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Similar Properties</h2>
            <p className="text-xl text-gray-600">Discover other properties that might interest you</p>
          </div>
          
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:bg-blue-700"
            >
              Browse All Properties
              <ArrowLeft className="ml-2 w-5 h-5 rotate-180" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}