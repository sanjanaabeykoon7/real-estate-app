import { NextRequest, NextResponse } from 'next/server';
import { ApiError, errorResponse } from '@/lib/api/errors';
import { requireAuthenticatedUser } from '@/lib/api/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();

    const { listingId } = await request.json();

    if (!listingId) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Listing ID is required');
    }

    // Check if already saved
    const existing = await prisma.savedProperty.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: listingId
        }
      }
    });

    if (existing) {
      // Remove from favorites
      await prisma.savedProperty.delete({
        where: {
          userId_listingId: {
            userId: user.id,
            listingId: listingId
          }
        }
      });
      return NextResponse.json({ saved: false });
    } else {
      // Add to favorites
      await prisma.savedProperty.create({
        data: {
          userId: user.id,
          listingId: listingId
        }
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Listing ID is required');
    }

    const saved = await prisma.savedProperty.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: listingId
        }
      }
    });

    return NextResponse.json({ saved: !!saved });
  } catch (error) {
    return errorResponse(error);
  }
}