'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Plus, Eye, EyeOff, Edit3, Trash2, DollarSign, Bed, Bath, Square, MapPin, Calendar, Filter, Search, Grid, List, MoreVertical, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';


interface Listing {
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
}

type FilterType = 'all' | 'published' | 'draft' | 'sold' | 'pending';
type ViewType = 'grid' | 'list';

export default function MyPropertiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchListings();
    }
  }, [session]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/listings');
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublishStatus = async (listingId: string, currentStatus: boolean) => {
    try {
      setActionLoading(listingId);
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          published: !currentStatus,
        }),
      });

      if (response.ok) {
        const updatedListing = await response.json();
        setListings(prev => 
          prev.map(listing => 
            listing.id === listingId 
              ? { ...listing, published: updatedListing.published }
              : listing
          )
        );
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Failed to update listing status');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(listingId);
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setListings(prev => prev.filter(listing => listing.id !== listingId));
      } else {
        throw new Error('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete property');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusConfig = (status: string, published: boolean) => {
    if (!published) {
      return {
        label: 'Draft',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Clock
      };
    }

    switch (status) {
      case 'ACTIVE':
        return {
          label: 'Active',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle2
        };
      case 'PENDING':
        return {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock
        };
      case 'SOLD':
        return {
          label: 'Sold',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CheckCircle2
        };
      case 'INACTIVE':
        return {
          label: 'Inactive',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle
        };
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.address.state.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = (() => {
      switch (filter) {
        case 'published':
          return listing.published;
        case 'draft':
          return !listing.published;
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

  const getFilterStats = () => {
    return {
      all: listings.length,
      published: listings.filter(l => l.published).length,
      draft: listings.filter(l => !l.published).length,
      sold: listings.filter(l => l.status === 'SOLD').length,
      pending: listings.filter(l => l.status === 'PENDING').length,
    };
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
        <div className="animate-pulse text-gray-600">Loading properties...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your properties.</p>
        </div>
      </div>
    );
  }

  const stats = getFilterStats();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-1">Manage your property listings</p>
        </div>
        <Link
          href="/dashboard/add-property"
          className="inline-flex items-center px-4 py-2 bg-[#002b4c] text-white rounded-lg hover:bg-[#003d6b] transition-colors cursor-pointer"
        >
          <Plus size={18} className="mr-2" />
          Add New Property
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.all}</div>
          <div className="text-sm text-gray-600">Total Properties</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          <div className="text-sm text-gray-600">Published</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          <div className="text-sm text-gray-600">Drafts</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.sold}</div>
          <div className="text-sm text-gray-600">Sold</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
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
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors"
              >
                <option value="all">All ({stats.all})</option>
                <option value="published">Published ({stats.published})</option>
                <option value="draft">Drafts ({stats.draft})</option>
                <option value="sold">Sold ({stats.sold})</option>
                <option value="pending">Pending ({stats.pending})</option>
              </select>
            </div>

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

      {/* Properties Grid/List */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Home size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : "You haven't listed any properties yet."
            }
          </p>
          <Link
            href="/dashboard/add-property"
            className="inline-flex items-center px-4 py-2 bg-[#002b4c] text-white rounded-lg hover:bg-[#003d6b] transition-colors cursor-pointer"
          >
            <Plus size={18} className="mr-2" />
            Add Your First Property
          </Link>
        </div>
      ) : (
        <div className={
          viewType === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredListings.map((listing) => {
            const statusConfig = getStatusConfig(listing.status, listing.published);
            const StatusIcon = statusConfig.icon;

            if (viewType === 'list') {
              return (
                <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4 flex-1">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={listing.images[0] || '/api/placeholder/120/120'}
                          alt={listing.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
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
                                <StatusIcon size={12} className="mr-1" />
                                {statusConfig.label}
                              </span>
                            </div>
                            <p className="text-2xl font-bold text-[#002b4c] mb-2">
                              {formatPrice(listing.price)}
                            </p>
                            <div className="flex items-center space-x-4 text-gray-600 text-sm mb-2">
                              <span className="flex items-center">
                                <Bed size={16} className="mr-1" />
                                {listing.beds} bed{listing.beds !== 1 ? 's' : ''}
                              </span>
                              <span className="flex items-center">
                                <Bath size={16} className="mr-1" />
                                {listing.baths} bath{listing.baths !== 1 ? 's' : ''}
                              </span>
                              {listing.sqft && (
                                <span className="flex items-center">
                                  <Square size={16} className="mr-1" />
                                  {listing.sqft.toLocaleString()} sq ft
                                </span>
                              )}
                            </div>
                            <p className="flex items-center text-gray-600 text-sm">
                              <MapPin size={16} className="mr-1 flex-shrink-0" />
                              {listing.address.city}, {listing.address.state}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => togglePublishStatus(listing.id, listing.published)}
                              disabled={actionLoading === listing.id}
                              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                                listing.published 
                                  ? 'text-green-600 hover:bg-green-50' 
                                  : 'text-gray-600 hover:bg-gray-50'
                              } disabled:opacity-50`}
                              title={listing.published ? 'Unpublish' : 'Publish'}
                            >
                              {listing.published ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                            <Link
                              href={`/dashboard/properties/${listing.id}/edit`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 size={18} />
                            </Link>
                            <button
                              onClick={() => deleteListing(listing.id)}
                              disabled={actionLoading === listing.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      Listed {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                    {listing.updatedAt !== listing.createdAt && (
                      <span>
                        Updated {new Date(listing.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // Grid view
            return (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Image */}
                <div className="relative h-48">
                  <img
                    src={listing.images[0] || '/api/placeholder/300/200'}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      <StatusIcon size={12} className="mr-1" />
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="relative">
                      <button
                        onClick={() => setSelectedListing(selectedListing === listing.id ? null : listing.id)}
                        className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all cursor-pointer"
                      >
                        <MoreVertical size={16} className="text-gray-600" />
                      </button>
                      {selectedListing === listing.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                          <button
                            onClick={() => {
                              togglePublishStatus(listing.id, listing.published);
                              setSelectedListing(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer flex items-center"
                          >
                            {listing.published ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
                            {listing.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <Link
                            href={`/dashboard/properties/${listing.id}/edit`}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer flex items-center"
                            onClick={() => setSelectedListing(null)}
                          >
                            <Edit3 size={16} className="mr-2" />
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              deleteListing(listing.id);
                              setSelectedListing(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer flex items-center text-red-600"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
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
                  
                  <p className="flex items-center text-gray-600 text-sm mb-4">
                    <MapPin size={16} className="mr-1 flex-shrink-0" />
                    {listing.address.city}, {listing.address.state}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                    <span className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => togglePublishStatus(listing.id, listing.published)}
                        disabled={actionLoading === listing.id}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          listing.published 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-gray-600 hover:bg-gray-50'
                        } disabled:opacity-50`}
                      >
                        {listing.published ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <Link
                        href={`/dashboard/properties/${listing.id}/edit`}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      >
                        <Edit3 size={16} />
                      </Link>
                    </div>
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