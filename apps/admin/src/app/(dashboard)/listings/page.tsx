'use client';
import { ImageUpload } from '@repo/ui/ImageUpload';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Upload, Edit, Trash2, Eye, Plus, Filter, Download, X } from 'lucide-react';

export default function ListingsPage() {
  const [images, setImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListings, setSelectedListings] = useState<number[]>([]);

  // Modal states
  const [viewModal, setViewModal] = useState<any>(null);
  const [editModal, setEditModal] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<any>(null);
  const [addModal, setAddModal] = useState(false);
  
  const queryClient = useQueryClient();

  const { data = [], refetch } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => fetch('/api/listings').then((r) => r.json()),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => 
      fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      setAddModal(false);
      setImages([]); // Reset images after successful creation
      alert('Listing created successfully!');
    },
    onError: (error) => {
      console.error('Create error:', error);
      alert('Failed to create listing');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/listings/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      setDeleteModal(null);
      alert('Listing deleted successfully!');
    },
    onError: () => {
      alert('Failed to delete listing');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      setEditModal(null);
      alert('Listing updated successfully!');
    },
    onError: () => {
      alert('Failed to update listing');
    }
  });

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }
    
    let filtered = data.filter((listing: any) => {
      const matchesSearch = 
        listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

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

  const handleImageUpload = async (url: string) => {
    if (url && url !== null) {
      setImages((prev) => [...prev, url]);
      alert(`Image uploaded successfully!`);
    } else {
      alert('Failed to upload image. Please try again.');
    }
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

  const handleDelete = (listing: any) => {
    setDeleteModal(listing);
  };

  const confirmDelete = () => {
    if (deleteModal) {
      deleteMutation.mutate(deleteModal.id);
    }
  };

  const handleEdit = (listing: any) => {
    setEditModal({ ...listing });
  };

  const handleView = (listing: any) => {
    setViewModal(listing);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Parse address into JSON format
    const addressData = {
      street: formData.get('street'),
      city: formData.get('city'),
      state: formData.get('state'),
      zipCode: formData.get('zipCode'),
      country: formData.get('country') || 'Sri Lanka'
    };
    
    const newData = {
      title: formData.get('title'),
      description: formData.get('description'),
      price: formData.get('price'),
      beds: formData.get('beds'),
      baths: formData.get('baths'),
      sqft: formData.get('sqft'),
      address: addressData,
      location: formData.get('location'),
      status: formData.get('status') || 'active',
      published: formData.get('published') === 'on',
      featured: formData.get('featured') === 'on',
      images: images,
      ownerId: 'cme7fsaua00003dehf0kwadnd' // TODO: Get from authenticated user
    };
    
    createMutation.mutate(newData);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editModal) {
      const formData = new FormData(e.target as HTMLFormElement);
      const updatedData = {
        title: formData.get('title'),
        description: formData.get('description'),
        price: parseInt(formData.get('price') as string),
        beds: parseInt(formData.get('beds') as string),
        baths: parseInt(formData.get('baths') as string),
        sqft: parseInt(formData.get('sqft') as string),
        location: formData.get('location'),
        status: formData.get('status'),
        published: formData.get('published') === 'on'
      };
      updateMutation.mutate({ id: editModal.id, data: updatedData });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SOLD: 'bg-blue-100 text-blue-800 border-blue-200',
      INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase()}
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
              <button 
                onClick={() => setAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
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
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="SOLD">Sold</option>
                    <option value="INACTIVE">Inactive</option>
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

          
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredListings.length} of {Array.isArray(data) ? data.length : 0} listings
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
                        <div className="text-sm text-gray-500">
                          {listing.address && typeof listing.address === 'object' ? 
                            `${listing.address.street || ''} ${listing.address.city || ''}`.trim() || 'Address not available'
                            : listing.location || 'Address not available'
                          }
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        LKR{listing.price?.toLocaleString()}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {getStatusBadge(listing.status)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {listing.beds} beds • {listing.baths} baths • {listing.sqft} sqft
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{listing.owner?.name}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleView(listing)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(listing)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Edit Listing"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(listing)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Listing"
                        >
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

      {/* Add Listing Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Listing</h2>
              <button 
                onClick={() => {
                  setAddModal(false);
                  setImages([]); // Reset images when closing
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Title*</label>
                  <input
                    name="title"
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    required
                    placeholder="e.g. Beautiful 3BR House in Colombo"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Describe the property features, amenities, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (LKR)*</label>
                  <input
                    name="price"
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    required
                    placeholder="3000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms*</label>
                  <input
                    name="beds"
                    type="number"
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    required
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms*</label>
                  <input
                    name="baths"
                    type="number"
                    min="0"
                    step="0.5"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    required
                    placeholder="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                  <input
                    name="sqft"
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="1800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location/Area</label>
                  <input
                    name="location"
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="e.g. Colombo 03"
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Address Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      name="street"
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      name="city"
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Colombo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                    <input
                      name="state"
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Western Province"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip/Postal Code</label>
                    <input
                      name="zipCode"
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="00100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      name="country"
                      type="text"
                      defaultValue="Sri Lanka"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Publishing Options</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      name="published"
                      type="checkbox"
                      className="mr-3 rounded border-gray-300"
                      defaultChecked
                    />
                    <label className="text-sm font-medium text-gray-700">Publish immediately</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      name="featured"
                      type="checkbox"
                      className="mr-3 rounded border-gray-300"
                    />
                    <label className="text-sm font-medium text-gray-700">Mark as featured</label>
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Property Images</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
                    <div className="[&_input]:text-black [&_*]:text-black">
                      <ImageUpload onUploaded={handleImageUpload} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Upload multiple images to showcase your property</p>
                  </div>
                  
                  {images.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Images ({images.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img 
                              src={img} 
                              alt={`Upload ${idx + 1}`} 
                              className="w-full h-24 object-cover rounded border" 
                            />
                            <button
                              type="button"
                              onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Listing'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddModal(false);
                    setImages([]); // Reset images when canceling
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Listing Details</h2>
              <button 
                onClick={() => setViewModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4 text-gray-800">
              <div>
                <h3 className="font-semibold">Title</h3>
                <p>{viewModal.title}</p>
              </div>
              <div>
                <h3 className="font-semibold">Description</h3>
                <p>{viewModal.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Price</h3>
                  <p>LKR{viewModal.price?.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Status</h3>
                  <p>{viewModal.status}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Bedrooms</h3>
                  <p>{viewModal.beds}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Bathrooms</h3>
                  <p>{viewModal.baths}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Square Feet</h3>
                <p>{viewModal.sqft}</p>
              </div>
              <div>
                <h3 className="font-semibold">Location</h3>
                <p>{viewModal.location}</p>
              </div>
              <div>
                <h3 className="font-semibold">Address</h3>
                <p>{viewModal.address && typeof viewModal.address === 'object' ? 
                  `${viewModal.address.street || ''} ${viewModal.address.city || ''} ${viewModal.address.state || ''}`.trim() || 'Not specified'
                  : 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Agent</h3>
                <p>{viewModal.owner?.name}</p>
              </div>
              {viewModal.images && viewModal.images.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Images</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {viewModal.images.map((img: string, idx: number) => (
                      <img key={idx} src={img} alt={`Property ${idx + 1}`} className="w-full h-32 object-cover rounded border" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Listing</h2>
              <button 
                onClick={() => setEditModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  name="title"
                  type="text"
                  defaultValue={editModal.title}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editModal.description}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    name="price"
                    type="number"
                    defaultValue={editModal.price}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editModal.status}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <input
                    name="beds"
                    type="number"
                    defaultValue={editModal.beds}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <input
                    name="baths"
                    type="number"
                    defaultValue={editModal.baths}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                  <input
                    name="sqft"
                    type="number"
                    defaultValue={editModal.sqft}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  name="location"
                  type="text"
                  defaultValue={editModal.location}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              <div className="flex items-center">
                <input
                  name="published"
                  type="checkbox"
                  defaultChecked={editModal.published}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Published</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {updateMutation.isPending ? 'Updating...' : 'Update Listing'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
              <button 
                onClick={() => setDeleteModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteModal.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}