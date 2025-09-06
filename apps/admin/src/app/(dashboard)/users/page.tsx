'use client';
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Edit, Trash2, Eye, Plus, Filter, Download, X, Shield, UserCheck, UserX, Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'AGENT' | 'MODERATOR' | 'SUPER_ADMIN';
  createdAt: string;
  updatedAt: string;
  _count?: {
    listings: number;
    saved: number;
  };
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { data: session } = useSession();

  // Modal states
  const [viewModal, setViewModal] = useState<User | null>(null);
  const [editModal, setEditModal] = useState<User | null>(null);
  const [deleteModal, setDeleteModal] = useState<User | null>(null);
  const [addModal, setAddModal] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: users = [], refetch, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => fetch('/api/users').then((r) => r.json()),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => 
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create user');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setAddModal(false);
      alert('User created successfully!');
    },
    onError: (error) => {
      console.error('Create error:', error);
      alert('Failed to create user. Email might already exist.');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      fetch(`/api/users/${id}`, { method: 'DELETE' }).then(res => {
        if (!res.ok) throw new Error('Failed to delete user');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDeleteModal(null);
      alert('User deleted successfully!');
    },
    onError: () => {
      alert('Failed to delete user. User might have associated listings.');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update user');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditModal(null);
      alert('User updated successfully!');
    },
    onError: () => {
      alert('Failed to update user.');
    }
  });

  // Filter, sort, and paginate users
  const { paginatedUsers, totalPages, startIndex, endIndex, totalFiltered } = useMemo(() => {
    if (!Array.isArray(users)) {
      return { paginatedUsers: [], totalPages: 0, startIndex: 0, endIndex: 0, totalFiltered: 0 };
    }
    
    let filtered = users.filter((user: User) => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });

    filtered.sort((a: User, b: User) => {
      let aVal: any = a[sortBy as keyof User];
      let bVal: any = b[sortBy as keyof User];
      
      if (sortBy === 'listings') {
        aVal = a._count?.listings || 0;
        bVal = b._count?.listings || 0;
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal?.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalFiltered);
    const paginatedUsers = filtered.slice(startIndex, endIndex);

    return { paginatedUsers, totalPages, startIndex, endIndex, totalFiltered };
  }, [users, searchQuery, roleFilter, sortBy, sortOrder, currentPage, itemsPerPage]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  const handleSelectUser = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) 
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((u: User) => u.id));
    }
  };

  const handleDelete = (user: User) => {
    // Prevent deleting your own account
    if (user.id === (session?.user as any)?.id) {
      alert("You cannot delete your own account!");
      return;
    }
    setDeleteModal(user);
  };

  const confirmDelete = () => {
    if (deleteModal) {
      deleteMutation.mutate(deleteModal.id);
    }
  };

  const handleEdit = (user: User) => {
    setEditModal({ ...user });
  };

  const handleView = (user: User) => {
    setViewModal(user);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const newData = {
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      role: formData.get('role') || 'USER'
    };
    
    createMutation.mutate(newData);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editModal) {
      const formData = new FormData(e.target as HTMLFormElement);
      const updatedData: any = {
        email: formData.get('email'),
        name: formData.get('name'),
        role: formData.get('role')
      };
      
      // Only include password if it's being changed
      const newPassword = formData.get('password') as string;
      if (newPassword && newPassword.trim() !== '') {
        updatedData.password = newPassword;
      }
      
      updateMutation.mutate({ id: editModal.id, data: updatedData });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
      MODERATOR: 'bg-blue-100 text-blue-800 border-blue-200',
      AGENT: 'bg-green-100 text-green-800 border-green-200',
      USER: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const roleIcons = {
      SUPER_ADMIN: <Shield className="w-3 h-3" />,
      MODERATOR: <UserCheck className="w-3 h-3" />,
      AGENT: <UserCheck className="w-3 h-3" />,
      USER: null
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${roleConfig[role as keyof typeof roleConfig] || roleConfig.USER}`}>
        {roleIcons[role as keyof typeof roleIcons]}
        {role.replace('_', ' ')}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-none">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900">Manage Users</h1>
            <div className="flex gap-4">
              <button 
                onClick={() => setAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add User
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
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
              Refresh
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="all">All Roles</option>
                    <option value="USER">User</option>
                    <option value="AGENT">Agent</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="role">Role</option>
                    <option value="createdAt">Date Joined</option>
                    <option value="listings">Listings Count</option>
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
              Showing {startIndex + 1} to {endIndex} of {totalFiltered} users
              {searchQuery && (
                <span className="ml-2 text-blue-600">
                  for "{searchQuery}"
                </span>
              )}
            </div>
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} selected
                </span>
                <button 
                  onClick={() => {
                    if (confirm(`Delete ${selectedUsers.length} users?`)) {
                      // Implement bulk delete
                    }
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-500">Loading users...</p>
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500 text-lg mb-2">No users found</div>
                      <div className="text-gray-400 text-sm">
                        {searchQuery ? 'Try adjusting your search criteria' : 'Start by adding your first user'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user: User) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-600 font-medium text-sm">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            {user.id === (session?.user as any)?.id && (
                              <span className="text-xs text-blue-600">You</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          <div>{user._count?.listings || 0} listings</div>
                          <div>{user._count?.saved || 0} saved</div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleView(user)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(user)}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(user)}
                            disabled={user.id === (session?.user as any)?.id}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={user.id === (session?.user as any)?.id ? "Cannot delete your own account" : "Delete User"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevious}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  onClick={handleNext}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
              <button 
                onClick={() => setAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                <input
                  name="name"
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  required
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                <input
                  name="email"
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  required
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                <input
                  name="password"
                  type="password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role*</label>
                <select
                  name="role"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  required
                >
                  <option value="USER">User</option>
                  <option value="AGENT">Agent</option>
                  <option value="MODERATOR">Moderator</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Super Admins and Moderators can access the admin panel
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
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
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button 
                onClick={() => setViewModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4 text-gray-800">
              <div className="flex items-center justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-2xl">
                    {viewModal.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Name</h3>
                <p className="text-lg">{viewModal.name}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Email</h3>
                <p className="text-lg">{viewModal.email}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Role</h3>
                <div className="mt-1">{getRoleBadge(viewModal.role)}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Listings</h3>
                  <p className="text-lg">{viewModal._count?.listings || 0}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Saved Properties</h3>
                  <p className="text-lg">{viewModal._count?.saved || 0}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Joined</h3>
                  <p>{formatDate(viewModal.createdAt)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500">Last Updated</h3>
                  <p>{formatDate(viewModal.updatedAt)}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    setViewModal(null);
                    setEditModal(viewModal);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
              <button 
                onClick={() => setEditModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={editModal.name}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editModal.email}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  name="password"
                  type="password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  minLength={6}
                  placeholder="Enter new password or leave blank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  defaultValue={editModal.role}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  disabled={editModal.id === (session?.user as any)?.id}
                >
                  <option value="USER">User</option>
                  <option value="AGENT">Agent</option>
                  <option value="MODERATOR">Moderator</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
                {editModal.id === (session?.user as any)?.id && (
                  <p className="text-xs text-red-500 mt-1">
                    You cannot change your own role
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                >
                  {updateMutation.isPending ? 'Updating...' : 'Update User'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
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
              Are you sure you want to delete user <strong>"{deleteModal.name}"</strong>? 
              {deleteModal._count?.listings && deleteModal._count.listings > 0 && (
                <span className="block mt-2 text-red-600">
                  Warning: This user has {deleteModal._count.listings} listings that will need to be reassigned.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete User'}
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