import { ApiError } from '@/lib/api/errors';

export function validateToggleFavoriteInput(body: unknown) {
  const listingId =
    typeof body === 'object' && body !== null ? (body as Record<string, unknown>).listingId : undefined;

  if (typeof listingId !== 'string' || listingId.trim().length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Listing ID is required');
  }

  return { listingId };
}
