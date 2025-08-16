import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-2">
        <Link href="/listings" className="text-blue-600 underline">
          Manage Listings →
        </Link>
      </p>
      <p>
        <Link href="/users" className="text-blue-600 underline">
          Manage Users →
        </Link>
      </p>
    </div>
  );
}