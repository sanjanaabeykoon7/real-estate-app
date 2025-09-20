import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedProperties = await prisma.savedProperty.findMany({
      where: {
        userId: session.user.id
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
    console.error('Error fetching saved listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved listings' },
      { status: 500 }
    );
  }
}