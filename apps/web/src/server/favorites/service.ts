import { prisma } from '@/lib/prisma';

export async function toggleSavedListing(userId: string, listingId: string) {
  const where = { userId_listingId: { userId, listingId } };

  const existing = await prisma.savedProperty.findUnique({ where });

  if (existing) {
    await prisma.savedProperty.delete({ where });
    return { saved: false };
  }

  await prisma.savedProperty.create({ data: { userId, listingId } });
  return { saved: true };
}

export async function isListingSaved(userId: string, listingId: string) {
  const saved = await prisma.savedProperty.findUnique({
    where: { userId_listingId: { userId, listingId } },
    select: { userId: true },
  });

  return !!saved;
}

export async function getSavedListingsForUser(userId: string) {
  const savedProperties = await prisma.savedProperty.findMany({
    where: { userId },
    include: {
      listing: {
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: { listing: { createdAt: 'desc' } },
  });

  return savedProperties.map((saved) => ({
    id: `${saved.userId}-${saved.listingId}`,
    listingId: saved.listingId,
    savedAt: saved.createdAt,
    listing: saved.listing,
  }));
}
