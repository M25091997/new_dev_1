import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  RefreshCw, 
  Search, 
  Edit3, 
  Check, 
  X,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getStockManagement, updateStock } from '../../../api/api';
import { useToast } from '../../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

const StockManagement = () => {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [editStockValue, setEditStockValue] = useState('');
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  
  const { showError, showSuccess } = useToast();
  const { token } = useSelector((state) => state.user);

  const navigate = useNavigate();

  const fetchStockData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Always fetch all data for client-side filtering and pagination
      const params = {
        page: 1,
        per_page: 999999
      };

      const response = await getStockManagement(token, params);
      
      if (response.status === 1) {
        setStockData(response.data);
        // Store total items count for "all" option
        if (Array.isArray(response.data)) {
          setTotalItems(response.data.length);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch stock data');
      }
    } catch (error) {
      console.error('Stock fetch error:', error);
      showError('Stock Error', error.message || 'Failed to load stock data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStock = async (variantId, newStock) => {
    try {
      setUpdating(true);
      
      const payload = {
        id: variantId,
        stock: parseInt(newStock)
      };

      const response = await updateStock(token, payload);
      
      if (response.status === 1) {
        showSuccess('Success', 'Stock updated successfully');
        setEditingStock(null);
        setEditStockValue('');
        fetchStockData(true); // Refresh data
      } else {
        throw new Error(response.message || 'Failed to update stock');
      }
    } catch (error) {
      console.error('Update stock error:', error);
      showError('Update Error', error.message || 'Failed to update stock');
    } finally {
      setUpdating(false);
    }
  };

  const handleEditClick = (variant) => {
    setEditingStock(variant.product_variant_id);
    setEditStockValue(variant.stock.toString());
  };

  const handleSaveClick = () => {
    if (editStockValue && editingStock) {
      handleUpdateStock(editingStock, editStockValue);
    }
  };

  const handleCancelEdit = () => {
    setEditingStock(null);
    setEditStockValue('');
  };

  const getStatusBadge = (stock, pvStatus) => {
    if (pvStatus === 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Sold Out
        </span>
      );
    }
    
    if (stock === 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Sold Out
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Available
      </span>
    );
  };

  useEffect(() => {
    if (token) {
      fetchStockData();
    }
  }, [token, currentPage, itemsPerPage]);

  const filteredData = stockData ? stockData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.measurement.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];
  
  // Calculate total pages based on filtered data length
  const totalPages = itemsPerPage === 'all' ? 1 : (filteredData.length > 0 ? Math.ceil(filteredData.length / itemsPerPage) : 0);
  
  // When "all" is selected, show all filtered data; otherwise paginate
  const paginatedData = itemsPerPage === 'all' 
    ? filteredData 
    : filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h1 className="text-lg font-bold text-gray-800 mb-3">Stock Management</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div 
            onClick={() => navigate("/products/all-products", { state: { products: stockData } })}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200 active:scale-95 transition-transform"
          >
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Total Products</h3>
            <p className="text-sm font-bold text-green-600">{stockData?.length || 0}</p>
          </div>
          <div 
            onClick={() => navigate("/products/available-products", { state: { products: stockData?.filter(item => item.stock > 0 && item.pv_status === 1) } })}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 active:scale-95 transition-transform"
          >
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Available</h3>
            <p className="text-sm font-bold text-blue-600">{stockData?.filter(item => item.stock > 0 && item.pv_status === 1).length || 0}</p>
          </div>
          <div onClick={() => navigate("/products/sold-out")} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Out of Stock</h3>
            <p className="text-sm font-bold text-purple-600">{stockData?.filter(item => item.stock === 0 || item.pv_status === 0).length || 0}</p>
          </div>
          <div onClick={() => navigate("/products/low-stock")} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Low Stock</h3>
            <p className="text-sm font-bold text-orange-600">{stockData?.filter(item => item.stock > 0 && item.stock <= 5).length || 0}</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-3 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="space-y-3">
            {/* Search Filter */}
            <div>
              <label className="block text-xs font-semibold text-red-600 mb-1">
                Search
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-2 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button
                  onClick={() => fetchStockData(true)}
                  disabled={refreshing}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Cards */}
        <div className="space-y-3">
          {paginatedData.map((variant, index) => (
            <div key={variant.product_variant_id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-xs">#{variant.product_variant_id}</h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{variant.name}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate" title={variant.name}>
                    {variant.measurement} • {variant.type}
                  </p>
                </div>
                {getStatusBadge(variant.stock, variant.pv_status)}
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={variant.image_url}
                      alt={variant.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yNCAyOEMyNi4yMDkxIDI4IDI4IDI2LjIwOTEgMjggMjRDMjggMjEuNzkwOSAyNi4yMDkxIDIwIDI0IDIwQzIxLjc5MDkgMjAgMjAgMjEuNzkwOSAyMCAyNEMyMCAyNi4yMDkxIDIxLjc5MDkgMjggMjQgMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Current Stock</p>
                    {editingStock === variant.product_variant_id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={editStockValue}
                          onChange={(e) => setEditStockValue(e.target.value)}
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          min="0"
                        />
                        <button
                          onClick={handleSaveClick}
                          disabled={updating}
                          className="p-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-gray-900">{variant.stock}</span>
                    )}
                  </div>
                </div>
                {editingStock !== variant.product_variant_id && (
                  <button
                    onClick={() => handleEditClick(variant)}
                    className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-4 space-y-3">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-700">Per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  const value = e.target.value;
                  setItemsPerPage(value === 'all' ? 'all' : Number(value));
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
          
          {itemsPerPage === 'all' ? (
            <div className="flex flex-col items-center space-y-2">
              <span className="text-xs text-gray-700">Showing all {filteredData.length} items</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <span className="text-xs text-gray-700">Total Records: {filteredData.length}</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ‹
                </button>
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 1) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2 py-1 text-xs border rounded ${
                        pageNum === currentPage
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
