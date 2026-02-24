import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getSellerTaxes } from '../../../../api/api.js';
import { Search, RefreshCw } from 'lucide-react';

const Taxes = () => {
  const { token } = useSelector((state) => state.user);
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTaxes, setFilteredTaxes] = useState([]);

  useEffect(() => {
    if (token) {
      fetchTaxes();
    }
  }, [token]);

  useEffect(() => {
    // Filter taxes based on search term
    if (!Array.isArray(taxes)) {
      setFilteredTaxes([]);
      return;
    }
    
    if (searchTerm.trim() === '') {
      setFilteredTaxes(taxes);
    } else {
      const filtered = taxes.filter(tax => 
        tax.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tax.id.toString().includes(searchTerm) ||
        tax.percentage.toString().includes(searchTerm)
      );
      setFilteredTaxes(filtered);
    }
  }, [searchTerm, taxes]);

  const fetchTaxes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSellerTaxes(token);
      console.log('Taxes API Response:', response);
      
      if (response.status === 1) {
        const taxesData = Array.isArray(response.data) ? response.data : [];
        setTaxes(taxesData);
        setFilteredTaxes(taxesData);
      } else {
        setError(response.message || 'Failed to fetch taxes');
        setTaxes([]);
        setFilteredTaxes([]);
      }
    } catch (err) {
      console.error('Error fetching taxes:', err);
      setError('Failed to fetch taxes. Please try again.');
      setTaxes([]);
      setFilteredTaxes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Search is handled by useEffect
  };

  const handleRefresh = () => {
    fetchTaxes();
  };

  const getStatusBadge = (status) => {
    if (status === 1) {
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

  if (loading && taxes.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">Loading taxes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Taxes</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Total</h3>
            <p className="text-lg font-bold text-blue-600">{Array.isArray(taxes) ? taxes.length : 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Active</h3>
            <p className="text-lg font-bold text-green-600">{Array.isArray(taxes) ? taxes.filter(tax => tax.status === 1).length : 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Inactive</h3>
            <p className="text-lg font-bold text-purple-600">{Array.isArray(taxes) ? taxes.filter(tax => tax.status !== 1).length : 0}</p>
          </div>
        </div>

        {/* Search and Refresh */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search taxes..."
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

        {/* Taxes Grid */}
        {filteredTaxes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              {loading ? 'Loading taxes...' : 'No taxes found'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTaxes.map((tax) => (
              <div key={tax.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{tax.title}</h3>
                    <p className="text-xs text-gray-500">ID: {tax.id}</p>
                  </div>
                  {getStatusBadge(tax.status)}
                </div>
                <p className="text-lg font-bold text-gray-900 mb-2">{tax.percentage}%</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Tax Rate</span>
                  <span className="text-xs text-gray-500">Status: {tax.status === 1 ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Info */}
        {filteredTaxes.length > 0 && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            Showing {filteredTaxes.length} of {taxes.length} taxes
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </div>
  );
};

export default Taxes;
