import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database/lib/prisma';

// GET - Get single listing (optional)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params in Next.js 15
    
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { owner: true }
    });
    
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
  }
}

// PUT - Update listing
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params in Next.js 15
    const data = await request.json();
    
    // Map frontend status values to Prisma enum values
    const statusMap: { [key: string]: string } = {
      'active': 'ACTIVE',
      'pending': 'PENDING', 
      'sold': 'SOLD',
      'inactive': 'INACTIVE'
    };
    
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        beds: data.beds,
        baths: data.baths,
        sqft: data.sqft,
        location: data.location,
        status: statusMap[data.status] || data.status, // Map to enum value
        published: data.published
      },
      include: { owner: true }
    });
    
    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

// DELETE - Delete listing  
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params in Next.js 15
    
    await prisma.listing.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}