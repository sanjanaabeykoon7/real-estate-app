import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api/errors';
import { requireAuthenticatedUser } from '@/lib/api/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();

    const savedProperties = await prisma.savedProperty.findMany({
      where: {
        userId: user.id
      },
      include: {
        listing: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        // This will order by when the property was saved
        listing: {
          createdAt: 'desc'
        }
      }
    });

    // Transform the data to match our expected structure
    const transformedData = savedProperties.map(saved => ({
      id: `${saved.userId}-${saved.listingId}`, // Composite ID for the saved property
      listingId: saved.listingId,
      savedAt: saved.createdAt,
      listing: saved.listing
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    return errorResponse(error);
  }
}