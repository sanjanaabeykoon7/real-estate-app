import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database/lib/prisma'; // Adjust path to your prisma instance

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

