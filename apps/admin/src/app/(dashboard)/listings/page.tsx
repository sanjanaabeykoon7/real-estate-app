'use client';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/DataTable';

export default function ListingsPage() {
  const { data } = useQuery({
    queryKey: ['listings'],
    queryFn: () => fetch('/api/admin/listings').then(r => r.json()),
  });

  return <DataTable data={data} />;
}