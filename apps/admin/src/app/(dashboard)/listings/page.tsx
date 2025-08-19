'use client';
import { ImageUpload } from '@repo/ui/ImageUpload';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function ListingsPage() {
  const [images, setImages] = useState<string[]>([]);

  const { data = [], refetch } = useQuery({
    queryKey: ['admin-listings'],
    // 👇 fetch from the admin app’s API
    queryFn: () => fetch('/api/listings').then((r) => r.json()),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Listings</h1>
      <ImageUpload onUploaded={(url) => setImages([...images, url])} />
      <table className="w-full border mt-4">
        <thead>
          <tr>
            <th className="border px-2 py-1">Title</th>
            <th className="border px-2 py-1">Price</th>
            <th className="border px-2 py-1">Owner</th>
          </tr>
        </thead>
        <tbody>
          {data.map((l: any) => (
            <tr key={l.id}>
              <td className="border px-2 py-1">{l.title}</td>
              <td className="border px-2 py-1">${l.price}</td>
              <td className="border px-2 py-1">{l.owner?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
