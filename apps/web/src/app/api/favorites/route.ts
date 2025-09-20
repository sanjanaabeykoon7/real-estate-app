import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listingId } = await request.json();

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    // Check if already saved
    const existing = await prisma.savedProperty.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId: listingId
        }
      }
    });

    if (existing) {
      // Remove from favorites
      await prisma.savedProperty.delete({
        where: {
          userId_listingId: {
            userId: session.user.id,
            listingId: listingId
          }
        }
      });
      return NextResponse.json({ saved: false });
    } else {
      // Add to favorites
      await prisma.savedProperty.create({
        data: {
          userId: session.user.id,
          listingId: listingId
        }
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error('Favorites error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const saved = await prisma.savedProperty.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId: listingId
        }
      }
    });

    return NextResponse.json({ saved: !!saved });
  } catch (error) {
    console.error('Favorites check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}