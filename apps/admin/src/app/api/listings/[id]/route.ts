import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api/errors';
import { requireAdminUser } from '@/lib/api/auth';
import { parseJsonBody, resolveParams } from '@/lib/api/request';
import { deleteListing, getListingById, updateListing } from '@/server/listings/service';
import { validateAdminUpdateListingInput } from '@/server/listings/validators';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminUser();

    const { id } = await resolveParams(params);
    const listing = await getListingById(id);

    return NextResponse.json(listing);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminUser();

    const { id } = await resolveParams(params);
    const body = await parseJsonBody<unknown>(request);
    const input = validateAdminUpdateListingInput(body);
    const listing = await updateListing(id, input);

    return NextResponse.json(listing);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdminUser();

    const { id } = await resolveParams(params);
    await deleteListing(id);

    return NextResponse.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}
