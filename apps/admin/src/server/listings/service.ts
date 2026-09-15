import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api/errors';
import type {
  validateAdminCreateListingInput,
  validateAdminUpdateListingInput,
} from './validators';

type CreateListingInput = ReturnType<typeof validateAdminCreateListingInput>;
type UpdateListingInput = ReturnType<typeof validateAdminUpdateListingInput>;

const withOwner = { owner: true } satisfies Prisma.ListingInclude;

export async function listAllListings() {
  return prisma.listing.findMany({
    include: withOwner,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getListingById(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: withOwner,
  });

  if (!listing) {
    throw new ApiError(404, 'NOT_FOUND', 'Listing not found');
  }

  return listing;
}

export async function createListing(actorId: string, input: CreateListingInput) {
  const { ownerId, address, ...rest } = input;

  return prisma.listing.create({
    data: {
      ...rest,
      address: address as Prisma.InputJsonValue,
      ownerId: ownerId ?? actorId,
    },
    include: withOwner,
  });
}

export async function updateListing(id: string, input: UpdateListingInput) {
  const { address, ...rest } = input;

  try {
    return await prisma.listing.update({
      where: { id },
      data: {
        ...rest,
        ...(address !== undefined ? { address: address as Prisma.InputJsonValue } : {}),
      },
      include: withOwner,
    });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      throw new ApiError(404, 'NOT_FOUND', 'Listing not found');
    }
    throw error;
  }
}

export async function deleteListing(id: string) {
  try {
    await prisma.listing.delete({ where: { id } });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      throw new ApiError(404, 'NOT_FOUND', 'Listing not found');
    }
    throw error;
  }
}
