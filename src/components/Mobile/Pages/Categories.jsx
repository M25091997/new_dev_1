import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { getSellerCategoriesAuth } from '../../../api/api';

const Categories = () => {
  const { token } = useSelector((state) => state.user);
  
  // State management
  const [categoriesData, setCategoriesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch categories data
  const fetchCategories = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = {
        search: searchTerm || undefined,
        page: currentPage,
        limit: itemsPerPage,
      };

      const response = await getSellerCategoriesAuth(token, params);
      
      if (response.status === 1) {
        setCategoriesData(response);
        setTotalPages(Math.ceil(response.total / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token, currentPage, itemsPerPage]);

  // Search handler
  const handleSearch = () => {
    setCurrentPage(1);
    fetchCategories();
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    if (status === 1) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Activated
        </span>
      );
    } else {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Inactive
        </span>
      );
    }
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Categories</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Total Categories</h3>
            <p className="text-lg font-bold text-green-600">{categoriesData?.total || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Active</h3>
            <p className="text-lg font-bold text-blue-600">{categoriesData?.data?.filter(cat => cat.status === 1).length || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Inactive</h3>
            <p className="text-lg font-bold text-purple-600">{categoriesData?.data?.filter(cat => cat.status === 0).length || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">With Images</h3>
            <p className="text-lg font-bold text-orange-600">{categoriesData?.data?.filter(cat => cat.image_url).length || 0}</p>
          </div>
        </div>

        {/* Search and Refresh */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-3 py-2 text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
          <button
            onClick={() => fetchCategories(true)}
            className="w-full bg-red-500 text-white py-2 text-sm rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="flex items-center justify-center">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" />
                <span className="text-gray-500">Loading categories...</span>
              </div>
            </div>
          ) : categoriesData?.data?.length > 0 ? (
            categoriesData.data.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">#{category.id}</h3>
                    <p className="text-xs text-gray-600 mt-1">Name: {category.name}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate" title={category.subtitle}>
                      Subtitle: {category.subtitle}
                    </p>
                  </div>
                  {getStatusBadge(category.status)}
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Parent ID</p>
                      <span className="text-sm font-semibold text-gray-900">{category.parent_id || 'None'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-gray-500">
                <Filter className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No categories found</p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 space-y-3">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-700">Per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <span className="text-xs text-gray-700">Total Records: {categoriesData?.total || 0}</span>
            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                «
              </button>
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-2 py-1 text-xs border rounded ${
                      pageNum === currentPage
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ›
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
