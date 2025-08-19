'use client';
import { useState } from 'react';

export function ImageUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const { url } = await res.json();
    onUploaded(url);
    setUploading(false);
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      disabled={uploading}
      className="block w-full text-sm"
    />
  );
}