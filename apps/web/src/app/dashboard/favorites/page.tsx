'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Search, Grid, List, DollarSign, Bed, Bath, Square, MapPin, Calendar, Filter, Eye, Trash2, Home, ExternalLink } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';

interface SavedListing {
  id: string;
  listingId: string;
  savedAt: string;
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    beds: number;
    baths: number;
    sqft?: number;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode?: string;
      country: string;
    };
    location?: string;
    status: 'ACTIVE' | 'PENDING' | 'SOLD' | 'INACTIVE';
    images: string[];
    published: boolean;
    featured: boolean;
    createdAt: string;
    updatedAt: string;
    owner: {
      id: string;
      name: string;
      email: string;
    };
  };
}

type FilterType = 'all' | 'active' | 'sold' | 'pending';
type ViewType = 'grid' | 'list';
type SortType = 'newest' | 'oldest' | 'price-low' | 'price-high';

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session?.user?.id) {
      fetchSavedListings();
    }
  }, [session]);

  const fetchSavedListings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/favorites/saved-listings');
      if (response.ok) {
        const data = await response.json();
        setSavedListings(data);
      }
    } catch (error) {
      console.error('Error fetching saved listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (listingId: string) => {
    if (!confirm('Remove this property from your favorites?')) {
      return;
    }

    try {
      setRemovingIds(prev => new Set(prev).add(listingId));
      
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId }),
      });

      if (response.ok) {
        setSavedListings(prev => 
          prev.filter(saved => saved.listing.id !== listingId)
        );
      } else {
        throw new Error('Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('Failed to remove property from favorites');
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    }
  };

  const getFilteredAndSortedListings = () => {
    let filtered = savedListings.filter(saved => {
      const listing = saved.listing;
      const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           listing.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           listing.address.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           listing.owner.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = (() => {
        switch (filter) {
          case 'active':
            return listing.status === 'ACTIVE' && listing.published;
          case 'sold':
            return listing.status === 'SOLD';
          case 'pending':
            return listing.status === 'PENDING';
          default:
            return true;
        }
      })();

      return matchesSearch && matchesFilter;
    });

    // Sort listings
    filtered.sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
        case 'price-low':
          return a.listing.price - b.listing.price;
        case 'price-high':
          return b.listing.price - a.listing.price;
        case 'newest':
        default:
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      }
    });

    return filtered;
  };

  const getFilterStats = () => {
    return {
      all: savedListings.length,
      active: savedListings.filter(s => s.listing.status === 'ACTIVE' && s.listing.published).length,
      sold: savedListings.filter(s => s.listing.status === 'SOLD').length,
      pending: savedListings.filter(s => s.listing.status === 'PENDING').length,
    };
  };

  const getStatusConfig = (status: string, published: boolean) => {
    if (!published) {
      return {
        label: 'Unlisted',
        color: 'bg-gray-100 text-gray-800 border-gray-200'
      };
    }

    switch (status) {
      case 'ACTIVE':
        return {
          label: 'Available',
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'PENDING':
        return {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'SOLD':
        return {
          label: 'Sold',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'INACTIVE':
        return {
          label: 'Inactive',
          color: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-pulse text-gray-600">Loading favorites...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your favorite properties.</p>
        </div>
      </div>
    );
  }

  const filteredListings = getFilteredAndSortedListings();
  const stats = getFilterStats();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Heart size={32} className="mr-3 text-red-500" />
            My Favorites
          </h1>
          <p className="text-gray-600 mt-1">Properties you've saved for later</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-[#002b4c] text-white rounded-lg hover:bg-[#003d6b] transition-colors cursor-pointer"
        >
          <Search size={18} className="mr-2" />
          Browse More Properties
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.all}</div>
          <div className="text-sm text-gray-600">Total Saved</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.sold}</div>
          <div className="text-sm text-gray-600">Sold</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors"
            />
          </div>

          {/* Filters and Controls */}
          <div className="flex items-center gap-4">
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors"
              >
                <option value="all">All ({stats.all})</option>
                <option value="active">Available ({stats.active})</option>
                <option value="sold">Sold ({stats.sold})</option>
                <option value="pending">Pending ({stats.pending})</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors"
            >
              <option value="newest">Recently Saved</option>
              <option value="oldest">Oldest Saved</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewType('grid')}
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  viewType === 'grid' ? 'bg-white shadow-sm text-[#002b4c]' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-2 rounded-md transition-colors cursor-pointer ${
                  viewType === 'list' ? 'bg-white shadow-sm text-[#002b4c]' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Heart size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {savedListings.length === 0 ? 'No favorites yet' : 'No properties match your criteria'}
          </h3>
          <p className="text-gray-600 mb-6">
            {savedListings.length === 0 
              ? "Start browsing properties and save the ones you love!"
              : "Try adjusting your search or filter settings."
            }
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-[#002b4c] text-white rounded-lg hover:bg-[#003d6b] transition-colors cursor-pointer"
          >
            <Search size={18} className="mr-2" />
            {savedListings.length === 0 ? 'Browse Properties' : 'Clear Filters & Browse'}
          </Link>
        </div>
      ) : (
        <div className={
          viewType === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredListings.map((saved) => {
            const { listing } = saved;
            const statusConfig = getStatusConfig(listing.status, listing.published);
            const isRemoving = removingIds.has(listing.id);

            if (viewType === 'list') {
              return (
                <div key={saved.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start space-x-4">
                    {/* Image */}
                    <div className="flex-shrink-0 relative">
                      <img
                        src={listing.images[0] || '/api/placeholder/120/120'}
                        alt={listing.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <div className="absolute top-0.5 right-0.5">
                        <FavoriteButton listingId={listing.id} className="scale-75" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {listing.title}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-[#002b4c] mb-2">
                            {formatPrice(listing.price)}
                          </p>
                          <div className="flex items-center space-x-4 text-gray-600 text-sm mb-2">
                            <span className="flex items-center">
                              <Bed size={16} className="mr-1" />
                              {listing.beds}
                            </span>
                            <span className="flex items-center">
                              <Bath size={16} className="mr-1" />
                              {listing.baths}
                            </span>
                            {listing.sqft && (
                              <span className="flex items-center">
                                <Square size={16} className="mr-1" />
                                {listing.sqft.toLocaleString()} sq ft
                              </span>
                            )}
                          </div>
                          <p className="flex items-center text-gray-600 text-sm mb-2">
                            <MapPin size={16} className="mr-1 flex-shrink-0" />
                            {listing.address.city}, {listing.address.state}
                          </p>
                          <p className="text-sm text-gray-500">
                            Listed by {listing.owner.name}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            href={`/listings/${listing.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <ExternalLink size={18} />
                          </Link>
                          <button
                            onClick={() => handleRemoveFromFavorites(listing.id)}
                            disabled={isRemoving}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                            title="Remove from Favorites"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      Saved {new Date(saved.savedAt).toLocaleDateString()}
                    </span>
                    <span>
                      Listed {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            }

            // Grid view
            return (
              <div key={saved.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Image */}
                <div className="relative h-48">
                  <img
                    src={listing.images[0] || '/api/placeholder/300/200'}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <FavoriteButton listingId={listing.id} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {listing.title}
                  </h3>
                  <p className="text-2xl font-bold text-[#002b4c] mb-4">
                    {formatPrice(listing.price)}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-gray-600 text-sm mb-4">
                    <span className="flex items-center">
                      <Bed size={16} className="mr-1" />
                      {listing.beds}
                    </span>
                    <span className="flex items-center">
                      <Bath size={16} className="mr-1" />
                      {listing.baths}
                    </span>
                    {listing.sqft && (
                      <span className="flex items-center">
                        <Square size={16} className="mr-1" />
                        {listing.sqft.toLocaleString()} sq ft
                      </span>
                    )}
                  </div>
                  
                  <p className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin size={16} className="mr-1 flex-shrink-0" />
                    {listing.address.city}, {listing.address.state}
                  </p>

                  <p className="text-sm text-gray-500 mb-4">
                    Listed by {listing.owner.name}
                  </p>

                  <div className="flex items-center justify-between">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="inline-flex items-center px-3 py-2 bg-[#002b4c] text-white rounded-lg hover:bg-[#003d6b] transition-colors cursor-pointer"
                    >
                      <Eye size={16} className="mr-2" />
                      View Details
                    </Link>
                    <button
                      onClick={() => handleRemoveFromFavorites(listing.id)}
                      disabled={isRemoving}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                      title="Remove from Favorites"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500 text-center">
                    Saved {new Date(saved.savedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}