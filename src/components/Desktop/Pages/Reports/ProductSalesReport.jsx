import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Search, 
  RefreshCw, 
  Calendar,
  ArrowUpDown,
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
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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

  // Filter and sort data
  const filteredReports = reports.filter(report =>
    report.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.product_variant_id?.toString().includes(searchTerm)
  );

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = sortedReports.slice(startIndex, endIndex);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
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
          className={`px-3 py-1 text-sm rounded-md ${
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
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl mt-5 font-bold text-gray-800">Product Sales Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard / Product Sales Reports</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Product Sales Reports</h2>
        </div>
        
        <div className="p-6">
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Date Range Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-red-600 mb-2">From & To Date</label>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 flex-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateRangeChange(e.target.value, endDate)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateRangeChange(startDate, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={clearDateRange}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-red-600 mb-2">Search</label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
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

          {/* Table */}
          {!startDate || !endDate ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Please select date range to view sales reports</div>
            </div>
          ) : paginatedReports.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No sales reports available for the selected date range</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('product_name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Product Name</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('product_variant_id')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Product Variant ID</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('unit_name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Unit Of Measure</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total_sales')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Total Units Sold</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total_price')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Total Sales</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedReports.map((report) => (
                    <tr key={`${report.product_id}-${report.product_variant_id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {report.product_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.product_variant_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.unit_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.total_sales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{report.total_price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {startDate && endDate && paginatedReports.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Per page</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
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
