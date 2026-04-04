import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApiError, errorResponse } from '@/lib/api/errors';
import { deleteOwnedListing, updateOwnedListing } from '@/server/listings/service';
import { validateUpdateListingInput } from '@/server/listings/validators';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
    }

    const listingId = params.id;
    const updateData = validateUpdateListingInput(await request.json());
    const updatedListing = await updateOwnedListing(listingId, session.user.id, updateData);

    return NextResponse.json(updatedListing);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Unauthorized');
    }

    const listingId = params.id;
    await deleteOwnedListing(listingId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}