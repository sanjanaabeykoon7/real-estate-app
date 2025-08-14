import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { owner: { select: { name: true, email: true } } },
  });

  if (!listing) notFound();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Image
          src={listing.images[0]}
          alt={listing.title}
          width={800}
          height={450}
          className="rounded"
        />
        <div>
          <p className="text-2xl font-bold mb-2">${listing.price.toLocaleString()}</p>
          <p>{listing.beds} bed • {listing.baths} bath • {listing.sqft} sqft</p>
          <p className="mt-2 text-gray-600">{listing.description}</p>
          <p className="mt-4 text-sm">Listed by {listing.owner.name}</p>
        </div>
      </div>
    </main>
  );
}