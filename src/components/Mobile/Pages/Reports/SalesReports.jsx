import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Search, 
  RefreshCw, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';
import { getSellerSalesReport } from '../../../../api/api';
import { useToast } from '../../../../contexts/ToastContext';

const SalesReports = () => {
  const { token } = useSelector((state) => state.user);
  const { showError, showSuccess } = useToast();
  
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [seller, setSeller] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const response = await getSellerSalesReport(token, '', '', '', '');
      if (response.status === 1 && response.data?.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Flatten categories for dropdown
  const flattenCategories = (cats, level = 0) => {
    let result = [];
    cats.forEach(cat => {
      result.push({ ...cat, level, displayName: '  '.repeat(level) + cat.name });
      if (cat.cat_active_childs && cat.cat_active_childs.length > 0) {
        result = result.concat(flattenCategories(cat.cat_active_childs, level + 1));
      }
    });
    return result;
  };

  // Fetch sales reports
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

      const response = await getSellerSalesReport(token, startDate, endDate, seller, category);

      console.log('Mobile Sales Report Response:', response); // Debug log

      if (response.status === 1) {
        // The API returns salesReports data
        const salesData = response.data?.salesReports || [];
        setSalesData(salesData);
        setTotalItems(response.total || salesData.length);
        
        // Calculate total amount by summing all final_total values
        const calculatedTotalAmount = salesData.reduce((sum, sale) => {
          const amount = parseFloat(sale.final_total) || parseFloat(sale.total) || 0;
          return sum + amount;
        }, 0);
        setTotalAmount(calculatedTotalAmount);
        
        console.log('Mobile Sales Data Set:', salesData); // Debug log
        console.log('Mobile Calculated Total Amount:', calculatedTotalAmount); // Debug log
      } else {
        throw new Error(response.message || 'Failed to fetch sales reports');
      }
    } catch (error) {
      console.error('Error fetching sales reports:', error);
      showError('Error', error.message || 'Failed to load sales reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [token]);

  useEffect(() => {
    if (token && startDate && endDate) {
      fetchReports();
    } else if (token && (!startDate || !endDate)) {
      // Clear sales data when dates are not selected
      setSalesData([]);
      setTotalItems(0);
      setTotalAmount(0);
      setLoading(false);
    }
  }, [token, startDate, endDate, seller, category]);

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
    setSeller('');
    setCategory('');
    setCurrentPage(1);
  };

  // Filter data
  console.log('Mobile Current salesData:', salesData); // Debug log
  console.log('Mobile Current searchTerm:', searchTerm); // Debug log
  
  const filteredSales = salesData.filter(sale => {
    // Use the correct field names from the API response
    const userName = sale.user_name || '';
    const productName = sale.product_name || '';
    const mobile = sale.mobile || '';
    const orderId = sale.id || '';
    
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
           orderId.toString().includes(searchTerm.toLowerCase());
  });
  
  console.log('Mobile Filtered sales:', filteredSales); // Debug log

  // Pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, endIndex);

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
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center">
            <RefreshCw className="w-5 h-5 animate-spin text-red-500 mr-2" />
            <span className="text-gray-500 text-sm">Loading sales reports...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">Sales Reports</h1>
        <p className="text-xs text-gray-500 mt-1">Dashboard / Sales Reports</p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">Sales Reports</h2>
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

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-red-600 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                {flattenCategories(categories).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
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

          {/* Content */}
          {!startDate || !endDate ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">Please select date range to view sales reports</div>
            </div>
          ) : paginatedSales.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">No sales reports available for the selected date range</div>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedSales.map((sale) => {
                // Use the correct field names from the API response
                const orderId = sale.id;
                const userName = sale.user_name || 'N/A';
                const productName = sale.product_name || 'N/A';
                const mobile = sale.mobile || 'N/A';
                const totalQuantity = sale.final_total || sale.total || 'N/A';
                const date = sale.added_date || 'N/A';
                
                return (
                  <div key={orderId} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          Order Item ID: {orderId}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">User:</span>
                          <span className="ml-1 text-gray-900">{userName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Product:</span>
                          <div className="ml-1 text-gray-900 text-xs mt-1 line-clamp-2">
                            {productName}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Mobile:</span>
                          <span className="ml-1 text-gray-900">{mobile}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Total:</span>
                          <span className="ml-1 text-gray-900">{totalQuantity}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <span className="ml-1 text-gray-900">{date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Total Amount and Pagination */}
          {startDate && endDate && paginatedSales.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="text-center">
                <div className="text-sm font-medium text-green-600">
                  Total Amount :- {totalAmount}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-700">Per page</span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReports;
