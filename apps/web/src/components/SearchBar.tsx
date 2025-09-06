'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [beds, setBeds] = useState('');
  const router = useRouter();
  const params = useSearchParams();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams(params);
    
    if (city) q.set('city', city); else q.delete('city');
    if (minPrice) q.set('minPrice', minPrice); else q.delete('minPrice');
    if (maxPrice) q.set('maxPrice', maxPrice); else q.delete('maxPrice');
    if (beds) q.set('beds', beds); else q.delete('beds');
    
    router.push(`/?${q.toString()}`);
  };

  const handleReset = () => {
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setBeds('');
    router.push('/');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 -mt-8 relative z-10 mx-4 lg:mx-0">
      <form onSubmit={handleSearch} className="space-y-4 lg:space-y-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Location */}
          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <div className="relative">
              <input
                id="city"
                type="text"
                placeholder="Enter city..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Min Price */}
          <div className="space-y-2">
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">
              Min Price
            </label>
            <select
              id="minPrice"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">Any</option>
              <option value="100000">LKR100,000</option>
              <option value="200000">LKR200,000</option>
              <option value="300000">LKR300,000</option>
              <option value="500000">LKR500,000</option>
              <option value="750000">LKR750,000</option>
              <option value="1000000">LKR1,000,000</option>
            </select>
          </div>

          {/* Max Price */}
          <div className="space-y-2">
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">
              Max Price
            </label>
            <select
              id="maxPrice"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">Any</option>
              <option value="200000">LKR200,000</option>
              <option value="300000">LKR300,000</option>
              <option value="500000">LKR500,000</option>
              <option value="750000">LKR750,000</option>
              <option value="1000000">LKR1,000,000</option>
              <option value="2000000">LKR2,000,000+</option>
            </select>
          </div>

          {/* Bedrooms */}
          <div className="space-y-2">
            <label htmlFor="beds" className="block text-sm font-medium text-gray-700">
              Bedrooms
            </label>
            <select
              id="beds"
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>

          {/* Search Buttons */}
          <div className="flex flex-col justify-end space-y-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-colors text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}