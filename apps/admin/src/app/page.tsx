export default function AdminHome() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-4">Navigate to <a href="/listings" className="text-blue-600 underline">/listings</a> to manage properties.</p>
    </main>
  );
}