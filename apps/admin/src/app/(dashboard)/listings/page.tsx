'use client';
import { useQuery } from '@tanstack/react-query';

export default function ListingsPage() {
  const { data } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => fetch('http://localhost:3000/admin/listings').then(r => r.json()),
    staleTime: 30_000,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Listings</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Title</th>
            <th className="border px-2 py-1">Price</th>
            <th className="border px-2 py-1">Owner</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((l: any) => (
            <tr key={l.id}>
              <td className="border px-2 py-1">{l.title}</td>
              <td className="border px-2 py-1">${l.price}</td>
              <td className="border px-2 py-1">{l.owner.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}