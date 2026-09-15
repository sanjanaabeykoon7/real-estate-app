import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api/errors';
import { requireAuthenticatedUser } from '@/lib/api/auth';
import { parseJsonBody, requireQueryParam } from '@/lib/api/request';
import { isListingSaved, toggleSavedListing } from '@/server/favorites/service';
import { validateToggleFavoriteInput } from '@/server/favorites/validators';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();

    const body = await parseJsonBody<unknown>(request);
    const { listingId } = validateToggleFavoriteInput(body);
    const result = await toggleSavedListing(user.id, listingId);

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const listingId = requireQueryParam(request, 'listingId');

    const saved = await isListingSaved(user.id, listingId);

    return NextResponse.json({ saved });
  } catch (error) {
    return errorResponse(error);
  }
}
