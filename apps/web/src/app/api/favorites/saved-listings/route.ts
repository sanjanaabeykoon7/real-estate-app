import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api/errors';
import { requireAuthenticatedUser } from '@/lib/api/auth';
import { getSavedListingsForUser } from '@/server/favorites/service';

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();

    const savedListings = await getSavedListingsForUser(user.id);

    return NextResponse.json(savedListings);
  } catch (error) {
    return errorResponse(error);
  }
}
