import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getSellerUnits } from '../../../../api/api';
import { Search, RefreshCw } from 'lucide-react';

const Units = () => {
  const { token } = useSelector((state) => state.user);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUnits, setFilteredUnits] = useState([]);

  useEffect(() => {
    if (token) {
      fetchUnits();
    }
  }, [token]);

  useEffect(() => {
    // Filter units based on search term
    if (!Array.isArray(units)) {
      setFilteredUnits([]);
      return;
    }
    
    if (searchTerm.trim() === '') {
      setFilteredUnits(units);
    } else {
      const filtered = units.filter(unit => 
        unit.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.short_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.id.toString().includes(searchTerm) ||
        unit.parent_id.toString().includes(searchTerm) ||
        unit.conversion.toString().includes(searchTerm)
      );
      setFilteredUnits(filtered);
    }
  }, [searchTerm, units]);

  const fetchUnits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSellerUnits(token);
      console.log('Units API Response:', response);
      
      if (response.status === 1) {
        const unitsData = Array.isArray(response.data) ? response.data : [];
        setUnits(unitsData);
        setFilteredUnits(unitsData);
      } else {
        setError(response.message || 'Failed to fetch units');
        setUnits([]);
        setFilteredUnits([]);
      }
    } catch (err) {
      console.error('Error fetching units:', err);
      setError('Failed to fetch units. Please try again.');
      setUnits([]);
      setFilteredUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Search is handled by useEffect
  };

  const handleRefresh = () => {
    fetchUnits();
  };

  if (loading && units.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm">Loading units...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Units</h1>
        
        {/* Summary Cards - Mobile */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Total Units</h3>
            <p className="text-xl font-bold text-blue-600">{Array.isArray(units) ? units.length : 0}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <h3 className="text-xs font-semibold text-gray-800 mb-1">Base Units</h3>
              <p className="text-lg font-bold text-green-600">{Array.isArray(units) ? units.filter(unit => unit.parent_id === 0).length : 0}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <h3 className="text-xs font-semibold text-gray-800 mb-1">Child Units</h3>
              <p className="text-lg font-bold text-purple-600">{Array.isArray(units) ? units.filter(unit => unit.parent_id !== 0).length : 0}</p>
            </div>
          </div>
        </div>

        {/* Search and Refresh - Mobile */}
        <div className="mb-4 space-y-3">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Search:</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search units..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
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

        {/* Mobile Units Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conv.
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-3 py-4 text-center text-gray-500 text-sm">
                    {loading ? 'Loading units...' : 'No units found'}
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit) => (
                  <tr key={unit.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {unit.id}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {unit.name}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {unit.short_code}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {unit.parent_id}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {unit.conversion}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Results Info */}
        {filteredUnits.length > 0 && (
          <div className="mt-3 text-xs text-gray-500">
            Showing {filteredUnits.length} of {units.length} units
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>
    </div>
  );
};

export default Units;
