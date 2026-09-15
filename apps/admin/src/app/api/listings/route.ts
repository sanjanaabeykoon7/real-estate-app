import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api/errors';
import { requireAdminUser } from '@/lib/api/auth';
import { parseJsonBody } from '@/lib/api/request';
import { createListing, listAllListings } from '@/server/listings/service';
import { validateAdminCreateListingInput } from '@/server/listings/validators';

export async function GET() {
  try {
    await requireAdminUser();

    const listings = await listAllListings();

    return NextResponse.json(listings);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminUser();

    const body = await parseJsonBody<unknown>(request);
    const input = validateAdminCreateListingInput(body);
    const listing = await createListing(user.id, input);

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
