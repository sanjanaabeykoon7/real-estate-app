import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApiError, errorResponse } from '@/lib/api/errors';
import { createListingForOwner, getListingsForOwner } from '@/server/listings/service';
import { validateCreateListingInput } from '@/server/listings/validators';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
    }

    const input = validateCreateListingInput(await request.json());
    const listing = await createListingForOwner(session.user.id, input);

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
    }

    const listings = await getListingsForOwner(session.user.id);

    return NextResponse.json(listings);
  } catch (error) {
    return errorResponse(error);
  }
}