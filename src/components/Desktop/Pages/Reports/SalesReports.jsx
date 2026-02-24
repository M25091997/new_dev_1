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
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
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

      console.log('Sales Report Response:', response); // Debug log

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
        
        console.log('Sales Data Set:', salesData); // Debug log
        console.log('Calculated Total Amount:', calculatedTotalAmount); // Debug log
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
    setSeller('');
    setCategory('');
    setCurrentPage(1);
  };

  // Filter and sort data
  console.log('Current salesData:', salesData); // Debug log
  console.log('Current searchTerm:', searchTerm); // Debug log
  
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
  
  console.log('Filtered sales:', filteredSales); // Debug log

  const sortedSales = [...filteredSales].sort((a, b) => {
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
  const paginatedSales = sortedSales.slice(startIndex, endIndex);

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
            <span className="text-gray-500">Loading sales reports...</span>
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
          <h1 className="text-xl mt-5 font-bold text-gray-800">Sales Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard / Sales Reports</p>
          </div>
          </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Sales Reports</h2>
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

            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-red-600 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
          ) : paginatedSales.length === 0 ? (
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
                      onClick={() => handleSort('order_item_id')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Order Item ID</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('user_name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>User</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('product_name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Product</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('mobile')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Mob.</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total_quantity')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Total()</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Date</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedSales.map((sale) => {
                    // Use the correct field names from the API response
                    const orderId = sale.id;
                    const userName = sale.user_name || 'N/A';
                    const productName = sale.product_name || 'N/A';
                    const mobile = sale.mobile || 'N/A';
                    const totalQuantity = sale.final_total || sale.total || 'N/A';
                    const date = sale.added_date || 'N/A';
                    
                    return (
                      <tr key={orderId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {orderId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                          <div className="truncate" title={productName}>
                            {productName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {mobile}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {totalQuantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Total Amount and Pagination */}
          {startDate && endDate && paginatedSales.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-green-600">
                  Total Amount :- {totalAmount}
                </div>
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

export default SalesReports;
