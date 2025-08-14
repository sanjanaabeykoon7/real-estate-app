import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import type { Prisma } from '@prisma/client';

type ListingWithOwner = Prisma.ListingGetPayload<{
  include: { owner: { select: { name: true } } };
}>;

export default async function Home() {
  const listings: ListingWithOwner[] = await prisma.listing.findMany({
    where: { published: true },
    include: { owner: { select: { name: true } } },
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Latest Listings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((l) => (
          <div key={l.id} className="border rounded-md p-4">
            <Image
              src={l.images[0]}
              alt={l.title}
              width={400}
              height={225}
              className="w-full h-40 object-cover rounded"
            />
            <h2 className="text-xl font-semibold mt-2">{l.title}</h2>
            <p className="text-sm text-gray-600">
              {(l.address as { city?: string })?.city ?? 'N/A'}
            </p>
            <p className="text-lg font-bold">${l.price.toLocaleString()}</p>
            <Link
              href={`/listings/${l.id}`}
              className="inline-block mt-2 text-blue-600 hover:underline"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}