import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Search, 
  RefreshCw, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { getSellerProductSalesReport } from '../../../../api/api';
import { useToast } from '../../../../contexts/ToastContext';

const ProductSalesReport = () => {
  const { token } = useSelector((state) => state.user);
  const { showError, showSuccess } = useToast();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch product sales reports
  const fetchReports = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await getSellerProductSalesReport(token, startDate, endDate);

      if (response.status === 1) {
        setReports(response.data || []);
        setTotalItems(response.total || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch product sales reports');
      }
    } catch (error) {
      console.error('Error fetching product sales reports:', error);
      showError('Error', error.message || 'Failed to load product sales reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token && startDate && endDate) {
      fetchReports();
    } else if (token && (!startDate || !endDate)) {
      // Clear reports when dates are not selected
      setReports([]);
      setTotalItems(0);
      setLoading(false);
    }
  }, [token, startDate, endDate]);

  const handleRefresh = () => {
    fetchReports(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);
  };

  const clearDateRange = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Filter data
  const filteredReports = reports.filter(report =>
    report.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.product_variant_id?.toString().includes(searchTerm)
  );

  // Pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 3;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2 py-1 text-xs rounded-md ${
            i === currentPage
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsLeft className="w-3 h-3" />
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsRight className="w-3 h-3" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center">
            <RefreshCw className="w-6 h-6 animate-spin text-red-500 mr-2" />
            <span className="text-gray-500">Loading product sales reports...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-800">Product Sales Reports</h1>
        </div>
        <p className="text-xs text-gray-500">Dashboard / Product Sales Reports</p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-4">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Product Sales Reports</h2>
        </div>
        
        <div className="p-4">
          {/* Filters and Search */}
          <div className="space-y-4 mb-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-red-600 mb-2">From & To Date</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateRangeChange(e.target.value, endDate)}
                    className="flex-1 border border-gray-300 rounded-md px-2 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <span className="text-gray-500 flex-shrink-0">-</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateRangeChange(startDate, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-2 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={clearDateRange}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-xs"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-red-600 mb-2">Search</label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Card Layout */}
          {!startDate || !endDate ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Please select date range to view sales reports</div>
            </div>
          ) : paginatedReports.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No sales reports available for the selected date range</div>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedReports.map((report) => (
                <div key={`${report.product_id}-${report.product_variant_id}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Product Name</h4>
                      <p className="text-xs text-gray-700 leading-tight">{report.product_name}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <h4 className="text-xs font-medium text-gray-600 mb-1">Product Variant ID</h4>
                        <p className="text-sm text-gray-900">{report.product_variant_id}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-600 mb-1">Unit Of Measure</h4>
                        <p className="text-sm text-gray-900">{report.unit_name}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <h4 className="text-xs font-medium text-gray-600 mb-1">Total Units Sold</h4>
                        <p className="text-sm text-gray-900">{report.total_sales}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-600 mb-1">Total Sales</h4>
                        <p className="text-sm text-gray-900">₹{report.total_price}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {startDate && endDate && paginatedReports.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-700">Per page</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="border border-gray-300 rounded-md px-1 py-1 text-xs focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </div>
              <div className="flex items-center space-x-1">
                {renderPagination()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSalesReport;
