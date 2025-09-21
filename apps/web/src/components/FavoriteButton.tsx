'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface FavoriteButtonProps {
  listingId: string;
  className?: string;
}

export default function FavoriteButton({ listingId, className = "" }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if property is already saved on component mount
  useEffect(() => {
    if (session?.user) {
      checkSavedStatus();
    }
  }, [session, listingId]);

  const checkSavedStatus = async () => {
    try {
      const response = await fetch(`/api/favorites?listingId=${listingId}`);
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.saved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      // You could show a login modal here or redirect to login
      alert('Please log in to save properties to favorites');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.saved);
      } else {
        console.error('Failed to toggle favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`transition-all hover:scale-110 focus:outline-none cursor-pointer ${className}`}
      title={isSaved ? "Remove from favorites" : "Add to favorites"}
    >
      <svg 
        className={`w-7 h-7 transition-all drop-shadow-lg ${
          isSaved 
            ? 'text-red-500' 
            : 'text-white/90 hover:text-red-500'
        } ${isLoading ? 'opacity-50' : ''}`}
        fill="currentColor" 
        stroke="none" 
        viewBox="0 0 24 24"
      >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}