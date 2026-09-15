import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { ApiError } from '@/lib/api/errors';

export async function createListingForOwner(ownerId: string, data: {
  title: string;
  description: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number | null;
  address: Record<string, unknown>;
  location: string | null;
  images: string[];
  published: boolean;
}) {
  return prisma.listing.create({
    data: {
      ...data,
      address: data.address as Prisma.InputJsonValue,
      ownerId,
    },
  });
}

export async function getListingsForOwner(ownerId: string) {
  return prisma.listing.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateOwnedListing(listingId: string, ownerId: string, data: Record<string, unknown>) {
  const existing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, 'NOT_FOUND', 'Listing not found or not authorized');
  }

  return prisma.listing.update({
    where: { id: listingId },
    data,
  });
}

export async function deleteOwnedListing(listingId: string, ownerId: string) {
  const existing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, 'NOT_FOUND', 'Listing not found or not authorized');
  }

  await prisma.listing.delete({ where: { id: listingId } });
}

export type ListingSearchFilters = {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
};

export async function getPublishedListings(filters: ListingSearchFilters, limit = 12) {
  const where: Prisma.ListingWhereInput = { published: true };

  if (filters.city) {
    where.address = { path: ['city'], string_contains: filters.city };
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = { gte: filters.minPrice, lte: filters.maxPrice };
  }
  if (filters.beds !== undefined) {
    where.beds = { gte: filters.beds };
  }

  return prisma.listing.findMany({
    where,
    include: { owner: { select: { name: true } } },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });
}

/**
 * Public listing detail. Unpublished listings are only visible to their owner.
 */
export async function getListingForPublicView(listingId: string, viewerId?: string) {
  return prisma.listing.findFirst({
    where: {
      id: listingId,
      OR: [{ published: true }, ...(viewerId ? [{ ownerId: viewerId }] : [])],
    },
    include: { owner: { select: { name: true, email: true, phone: true } } },
  });
}
