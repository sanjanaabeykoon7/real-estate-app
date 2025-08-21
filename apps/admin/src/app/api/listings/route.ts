import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database/lib/prisma'; // Adjust path to your prisma instance
import { ListingStatus } from '@prisma/client';

// GET - Get all listings
export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      include: { owner: true },
      orderBy: { createdAt: 'desc' } // Optional: order by creation date
    });
    
    return NextResponse.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

// POST - Create new listing
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Map frontend status values to Prisma enum values
    const statusMap: { [key: string]: string } = {
      'active': 'ACTIVE',
      'pending': 'PENDING', 
      'sold': 'SOLD',
      'inactive': 'INACTIVE'
    };

    // Filter out null/undefined images
    const validImages = (data.images || []).filter((img: any) => img && img !== null && typeof img === 'string');

    const newListing = await prisma.listing.create({
      data: {
        title: data.title,
        description: data.description,
        price: parseInt(data.price),
        beds: parseInt(data.beds),
        baths: parseInt(data.baths),
        sqft: data.sqft ? parseInt(data.sqft) : null,
        address: data.address || {},
        location: data.location,
        status: (statusMap[data.status] || 'ACTIVE') as ListingStatus,
        images: validImages, // Use filtered images
        published: data.published === true || data.published === 'true',
        featured: data.featured === true || data.featured === 'true',
        ownerId: data.ownerId
      },
      include: { owner: true }
    });
    
    return NextResponse.json(newListing);
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json({ 
      error: 'Failed to create listing', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}