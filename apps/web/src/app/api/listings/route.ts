import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api/errors';
import { requireAuthenticatedUser } from '@/lib/api/auth';
import { createListingForOwner, getListingsForOwner } from '@/server/listings/service';
import { validateCreateListingInput } from '@/server/listings/validators';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();

    const input = validateCreateListingInput(await request.json());
    const listing = await createListingForOwner(user.id, input);

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();

    const listings = await getListingsForOwner(user.id);

    return NextResponse.json(listings);
  } catch (error) {
    return errorResponse(error);
  }
}