import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getSellerBrands } from '../../../../api/api.js';
import { Search, RefreshCw } from 'lucide-react';

const Brands = () => {
  const { token } = useSelector((state) => state.user);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBrands, setFilteredBrands] = useState([]);

  useEffect(() => {
    if (token) {
      fetchBrands();
    }
  }, [token]);

  useEffect(() => {
    // Filter brands based on search term
    if (!Array.isArray(brands)) {
      setFilteredBrands([]);
      return;
    }
    
    if (searchTerm.trim() === '') {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter(brand => 
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.id.toString().includes(searchTerm)
      );
      setFilteredBrands(filtered);
    }
  }, [searchTerm, brands]);

  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSellerBrands(token);
      console.log('Brands API Response:', response);
      
      if (response.status === 1) {
        const brandsData = Array.isArray(response.data) ? response.data : [];
        setBrands(brandsData);
        setFilteredBrands(brandsData);
      } else {
        setError(response.message || 'Failed to fetch brands');
        setBrands([]);
        setFilteredBrands([]);
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Failed to fetch brands. Please try again.');
      setBrands([]);
      setFilteredBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Search is handled by useEffect
  };

  const handleRefresh = () => {
    fetchBrands();
  };

  const getStatusBadge = (status) => {
    if (status === '1') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  if (loading && brands.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Loading brands...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Brands</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Total</h3>
            <p className="text-lg font-bold text-blue-600">{Array.isArray(brands) ? brands.length : 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Active</h3>
            <p className="text-lg font-bold text-green-600">{Array.isArray(brands) ? brands.filter(brand => brand.status === '1').length : 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Inactive</h3>
            <p className="text-lg font-bold text-purple-600">{Array.isArray(brands) ? brands.filter(brand => brand.status !== '1').length : 0}</p>
          </div>
        </div>

        {/* Search and Refresh */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search brands..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={handleRefresh}
              className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex justify-between items-center">
              <p className="text-red-800 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 font-semibold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Brands Grid */}
        {filteredBrands.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              {loading ? 'Loading brands...' : 'No brands found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredBrands.map((brand) => (
              <div key={brand.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  {brand.image_url ? (
                    <img
                      src={brand.image_url}
                      alt={brand.name}
                      className="h-8 w-8 rounded-full object-cover mr-2"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 ${brand.image_url ? 'hidden' : 'flex'}`}
                  >
                    <span className="text-gray-500 text-xs font-medium">
                      {brand.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{brand.name}</h3>
                    <p className="text-xs text-gray-500">ID: {brand.id}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  {getStatusBadge(brand.status)}
                  <span className="text-xs text-gray-500">
                    {new Date(brand.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Info */}
        {filteredBrands.length > 0 && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            Showing {filteredBrands.length} of {brands.length} brands
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </div>
  );
};

export default Brands;
