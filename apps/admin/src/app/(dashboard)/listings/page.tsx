'use client';
import { ImageUpload } from '@repo/ui/ImageUpload';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Upload, Edit, Trash2, Eye, Plus, Filter, Download } from 'lucide-react';

export default function ListingsPage() {
  const [images, setImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListings, setSelectedListings] = useState<number[]>([]);

  const { data = [], refetch } = useQuery({
    queryKey: ['admin-listings'],
     // 👇 fetch from the admin app’s API
    queryFn: () => fetch('/api/listings').then((r) => r.json()),
  });

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let filtered = data.filter((listing: any) => {
      const matchesSearch = 
        listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort listings
    filtered.sort((a: any, b: any) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'owner') {
        aVal = a.owner?.name;
        bVal = b.owner?.name;
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [data, searchQuery, statusFilter, sortBy, sortOrder]);

  const handleImageUpload = (url: string) => {
    setImages((prev) => [...prev, url]);
    alert(`Uploaded: ${url}`);
  };

  const handleSelectListing = (id: number) => {
    setSelectedListings(prev => 
      prev.includes(id) 
        ? prev.filter(listingId => listingId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedListings.length === filteredListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(filteredListings.map((l: any) => l.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      sold: 'bg-blue-100 text-blue-800 border-blue-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Manage Listings</h1>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Add Listing
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title, location, or agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-gray-500"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-900 rounded-lg hover:bg-gray-50 transition-colors text-gray-900"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <button 
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="title">Title</option>
                    <option value="price">Price</option>
                    <option value="location">Location</option>
                    <option value="owner">Agent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Upload className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Upload Images</span>
            </div>
            <div className="[&_input]:text-black [&_*]:text-black">
              <ImageUpload onUploaded={handleImageUpload} />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredListings.length} of {data.length} listings
              {searchQuery && (
                <span className="ml-2 text-blue-600">
                  for "{searchQuery}"
                </span>
              )}
            </div>
            {selectedListings.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedListings.length} selected
                </span>
                <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors">
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredListings.map((listing: any) => (
                  <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedListings.includes(listing.id)}
                        onChange={() => handleSelectListing(listing.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                        <div className="text-sm text-gray-500">{listing.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        ${listing.price?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(listing.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {listing.bedrooms} bed • {listing.bathrooms} bath • {listing.area} sqft
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{listing.owner?.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No listings found</div>
              <div className="text-gray-400 text-sm">
                {searchQuery ? 'Try adjusting your search criteria' : 'Start by adding your first listing'}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredListings.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing 1 to {filteredListings.length} of {filteredListings.length} results
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors text-black">
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors text-black">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}