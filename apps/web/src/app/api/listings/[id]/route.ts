import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api/errors';
import { requireAuthenticatedUser } from '@/lib/api/auth';
import { deleteOwnedListing, updateOwnedListing } from '@/server/listings/service';
import { validateUpdateListingInput } from '@/server/listings/validators';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthenticatedUser();

    const listingId = params.id;
    const updateData = validateUpdateListingInput(await request.json());
    const updatedListing = await updateOwnedListing(listingId, user.id, updateData);

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
    const user = await requireAuthenticatedUser();

    const listingId = params.id;
    await deleteOwnedListing(listingId, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}