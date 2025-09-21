import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const listingId = params.id;

    // Check if user owns the listing
    const existingListing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        ownerId: session.user.id
      }
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found or not authorized' },
        { status: 404 }
      );
    }

    const updatedListing = await prisma.listing.update({
      where: {
        id: listingId
      },
      data: body
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const listingId = params.id;

    // Check if user owns the listing
    const existingListing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        ownerId: session.user.id
      }
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: 'Listing not found or not authorized' },
        { status: 404 }
      );
    }

    await prisma.listing.delete({
      where: {
        id: listingId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}