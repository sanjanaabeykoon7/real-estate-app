'use client';

interface DataTableProps<T> {
  data?: T[];
  columns?: string[];
}

export function DataTable<T>({ data = [], columns = [] }: DataTableProps<T>) {
  if (!data.length) return <p>No data</p>;

  return (
    <table className="w-full border">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c} className="border px-2 py-1">{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((c) => (
              <td key={c} className="border px-2 py-1">
                {(row as any)[c] ?? '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}