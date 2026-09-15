'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Home, MapPin, DollarSign, Bed, Bath, Square, FileText, Image, Save, ArrowLeft, Upload, X, Eye, EyeOff } from 'lucide-react';
import { ImageUpload } from '@repo/ui/ImageUpload';

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  location: string;
  images: string[];
  published: boolean;
}

export default function AddPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: '',
    beds: '',
    baths: '',
    sqft: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Sri Lanka'
    },
    location: '',
    images: [],
    published: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to add a new property.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1] as keyof PropertyFormData['address'];
      if (addressField) {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [addressField]: value
          }
        }));
      }
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseInt(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.beds || parseInt(formData.beds) <= 0) newErrors.beds = 'Number of bedrooms is required';
    if (!formData.baths || parseInt(formData.baths) <= 0) newErrors.baths = 'Number of bathrooms is required';
    if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!formData.address.state.trim()) newErrors['address.state'] = 'State/Province is required';
    if (formData.images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, url]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    
    if (!asDraft && !validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Generate location string from address
      const locationString = `${formData.address.city}, ${formData.address.state}, ${formData.address.country}`;
      
      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price) || 0,
        beds: parseInt(formData.beds) || 0,
        baths: parseInt(formData.baths) || 0,
        sqft: formData.sqft ? parseInt(formData.sqft) : null,
        address: formData.address,
        location: formData.location || locationString,
        images: formData.images,
        published: asDraft ? false : formData.published,
        ownerId: session.user.id
      };

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (response.ok) {
        const newProperty = await response.json();
        router.push('/dashboard/properties');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create property');
      }
    } catch (error) {
      console.error('Error creating property:', error);
      alert(error instanceof Error ? error.message : 'Failed to create property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
            <p className="text-gray-600 mt-1">List your property for sale or rent</p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Home size={20} className="mr-2" />
                Property Details
              </h3>
              
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Beautiful 3BR House with Garden"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe your property in detail..."
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Price and Property Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign size={16} className="inline mr-1" />
                      Price (LKR) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Square size={16} className="inline mr-1" />
                      Area (sq ft)
                    </label>
                    <input
                      type="number"
                      name="sqft"
                      value={formData.sqft}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Bed size={16} className="inline mr-1" />
                      Bedrooms *
                    </label>
                    <input
                      type="number"
                      name="beds"
                      value={formData.beds}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors ${
                        errors.beds ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {errors.beds && <p className="text-red-500 text-sm mt-1">{errors.beds}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Bath size={16} className="inline mr-1" />
                      Bathrooms *
                    </label>
                    <input
                      type="number"
                      name="baths"
                      value={formData.baths}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors ${
                        errors.baths ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {errors.baths && <p className="text-red-500 text-sm mt-1">{errors.baths}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin size={20} className="mr-2" />
                Address Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors ${
                      errors['address.street'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors['address.street'] && <p className="text-red-500 text-sm mt-1">{errors['address.street']}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors ${
                        errors['address.city'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Colombo"
                    />
                    {errors['address.city'] && <p className="text-red-500 text-sm mt-1">{errors['address.city']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors ${
                        errors['address.state'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Western Province"
                    />
                    {errors['address.state'] && <p className="text-red-500 text-sm mt-1">{errors['address.state']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors"
                      placeholder="00100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors"
                      placeholder="Sri Lanka"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Description
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002b4c] focus:border-transparent outline-none transition-colors"
                    placeholder="Near shopping mall, close to schools..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional: Describe nearby landmarks or amenities
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Images and Publishing */}
          <div className="space-y-6">
            {/* Property Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Image size={20} className="mr-2" />
                Property Images *
              </h3>
              
              <div className="space-y-4">
                <ImageUpload onUploaded={handleImageUpload} />
                {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
                
                {formData.images.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Uploaded Images ({formData.images.length})
                    </h4>
                    <div className="space-y-2">
                      {formData.images.map((url, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={url}
                              alt={`Property image ${index + 1}`}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <span className="text-sm text-gray-600">
                              Image {index + 1}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Publishing Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FileText size={20} className="mr-2" />
                Publishing Options
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    checked={formData.published}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-[#002b4c] border-gray-300 rounded focus:ring-[#002b4c]"
                  />
                  <div className="flex-1">
                    <label htmlFor="published" className="text-sm font-medium text-gray-700 cursor-pointer">
                      {formData.published ? (
                        <span className="flex items-center">
                          <Eye size={16} className="mr-1" />
                          Publish immediately
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <EyeOff size={16} className="mr-1" />
                          Save as draft
                        </span>
                      )}
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.published 
                        ? 'Your property will be visible to buyers immediately'
                        : 'Save your property as a draft. You can publish it later.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-[#002b4c] text-white rounded-lg hover:bg-[#003d6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Save size={18} className="mr-2" />
                  {loading ? 'Saving...' : (formData.published ? 'Publish Property' : 'Save Property')}
                </button>
                
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FileText size={18} className="mr-2" />
                  {loading ? 'Saving...' : 'Save as Draft'}
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mt-4 text-center">
                * Required fields must be completed
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}