import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getSellerUnits } from '../../../../api/api';
import { Search, RefreshCw, Package } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm text-gray-600">Loading units...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mt-7">Units</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product measurement units</p>
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
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Units</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(units) ? units.length : 0}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Base Units</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(units) ? units.filter(unit => unit.parent_id === 0).length : 0}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-green-600">⚡</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Child Units</p>
              <p className="text-2xl font-bold text-gray-900">{Array.isArray(units) ? units.filter(unit => unit.parent_id !== 0).length : 0}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-purple-600">🔗</span>
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
              Search Units
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, code, ID, parent ID, or conversion..."
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        {filteredUnits.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Showing {filteredUnits.length} of {units.length} units
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

      {/* Units Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase">
                  Short Code
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase">
                  Parent Id
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase">
                  Conversion
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">
                    {loading ? 'Loading units...' : 'No units found'}
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit) => (
                  <tr key={unit.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                        #{unit.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {unit.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {unit.short_code}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {unit.parent_id === 0 ? (
                        <span className="text-gray-400">-</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-xs font-medium">
                          #{unit.parent_id}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {unit.conversion}
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

export default Units;
