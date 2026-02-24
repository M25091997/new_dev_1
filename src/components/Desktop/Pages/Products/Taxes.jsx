import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getSellerTaxes } from '../../../../api/api';
import { Search, RefreshCw, Receipt } from 'lucide-react';

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

  if (loading && taxes.length === 0) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm text-gray-600">Loading taxes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mt-7">Taxes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product tax rates</p>
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
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Taxes</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(taxes) ? taxes.length : 0}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Active</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(taxes) ? taxes.filter(tax => tax.status === 1).length : 0}</p>
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
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(taxes) ? taxes.filter(tax => tax.status !== 1).length : 0}</p>
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
              Search Taxes
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, ID, or percentage..."
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        {filteredTaxes.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Showing {filteredTaxes.length} of {taxes.length} taxes
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

      {/* Taxes Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase">
                  Percentage
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTaxes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-sm text-gray-500">
                    {loading ? 'Loading taxes...' : 'No taxes found'}
                  </td>
                </tr>
              ) : (
                filteredTaxes.map((tax) => (
                  <tr key={tax.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                        #{tax.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tax.title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                        {tax.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(tax.status)}
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

export default Taxes;
