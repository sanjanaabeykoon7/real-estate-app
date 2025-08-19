'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const [city, setCity] = useState('');
  const router = useRouter();
  const params = useSearchParams();

  const handleSearch = () => {
    const q = new URLSearchParams(params);
    if (city) q.set('city', city); else q.delete('city');
    router.push(`/?${q.toString()}`);
  };

  return (
    <div className="flex gap-2 mb-4">
      <input
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="border px-2 py-1"
      />
      <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-1 rounded">
        Search
      </button>
    </div>
  );
}