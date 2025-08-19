import { NextResponse } from 'next/server';
import { prisma } from '@repo/database/lib/prisma';

export async function GET() {
  const listings = await prisma.listing.findMany({
    where: { published: true },
    include: { owner: true },
  });

  return NextResponse.json(listings);
}
