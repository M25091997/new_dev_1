import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getSellerBrands } from '../../../../api/api';
import { Search, RefreshCw, Tag } from 'lucide-react';

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
        <span className="inline-flex items-center px-2 py-1 text-[11px] font-semibold rounded-md bg-green-100 text-green-700">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 text-[11px] font-semibold rounded-md bg-red-100 text-red-700">
        Inactive
      </span>
    );
  };

  if (loading && brands.length === 0) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm text-gray-600">Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mt-7">Brands</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product brands</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 mt-5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
        
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Brands</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(brands) ? brands.length : 0}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Active</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(brands) ? brands.filter(brand => brand.status === '1').length : 0}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-green-600">✓</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-red-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-600 uppercase mb-1">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(brands) ? brands.filter(brand => brand.status !== '1').length : 0}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-red-600">✕</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Search className="w-3 h-3 inline mr-1" />
              Search Brands
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        {filteredBrands.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Showing {filteredBrands.length} of {brands.length} brands
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm font-semibold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Brands Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">
                    {loading ? 'Loading brands...' : 'No brands found'}
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                        #{brand.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {brand.image_url ? (
                          <img
                            src={brand.image_url}
                            alt={brand.name}
                            className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ${brand.image_url ? 'hidden' : 'flex'}`}
                        >
                          <span className="text-gray-500 text-xs font-medium">
                            {brand.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {brand.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(brand.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                      {new Date(brand.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Brands;
