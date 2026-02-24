import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  RefreshCw,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  DollarSign,
  Edit3,
  X,
  Plus,
  Minus,
  AlertCircle
} from 'lucide-react';
import { getSellerOrders, getOrderStatuses } from '../../../api/api';
import { useToast } from '../../../contexts/ToastContext';

const Orders = () => {
  const navigate = useNavigate();
  const [ordersData, setOrdersData] = useState(null);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    startDeliveryDate: '',
    endDeliveryDate: '',
    status: '',
    search: '',
    offset: 0,
    limit: 5,
    item_offset: 0,
    item_limit: 5
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modifiedItems, setModifiedItems] = useState([]);
  const [modificationReason, setModificationReason] = useState('');

  const { showError, showInfo, showSuccess } = useToast();
  const { token } = useSelector((state) => state.user);

  // Ref to track if order statuses have been fetched
  const hasFeatchedStatuses = useRef(false);

  // Fetch order statuses
  const fetchOrderStatuses = async () => {
    if (hasFeatchedStatuses.current) return; // Prevent multiple calls

    try {
      console.log('Fetching order statuses with token:', token ? 'Token exists' : 'No token');
      hasFeatchedStatuses.current = true; // Mark as fetched

      const response = await getOrderStatuses(token);
      console.log('Order statuses response:', response);

      if (response.status === 1) {
        console.log('Setting order statuses:', response.data);
        setOrderStatuses(response.data);
      } else {
        console.error('Order statuses API returned error:', response.message);
      }
    } catch (error) {
      console.error('Error fetching order statuses:', error);
      hasFeatchedStatuses.current = false; // Reset on error to allow retry
    }
  };

  // Create status options from API data
  const statusOptions = [
    { id: '', name: 'All Orders' },
    ...(orderStatuses.length > 0 ? orderStatuses.map(status => ({
      id: status.id.toString(),
      name: status.status
    })) : [
      { id: '0', name: 'Payment Pending' },
      { id: '1', name: 'Received' },
      { id: '2', name: 'Processed' },
      { id: '3', name: 'Shipped' },
      { id: '4', name: 'Out For Delivery' },
      { id: '5', name: 'Delivered' },
      { id: '6', name: 'Cancelled' },
      { id: '7', name: 'Returned' }
    ])
  ];

  // Debug logging
  console.log('Order statuses state:', orderStatuses);
  console.log('Status options:', statusOptions);

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await getSellerOrders(token, filters);

      if (response.status === 1) {
        setOrdersData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch orders data');
      }
    } catch (error) {
      console.error('Orders fetch error:', error);
      showError('Orders Error', error.message || 'Failed to load orders data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch order statuses only once on mount
  useEffect(() => {
    if (token) {
      fetchOrderStatuses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Fetch orders when filters change (with debounce for search)
  useEffect(() => {
    if (!token) return;

    // Debounce search input
    const timeoutId = setTimeout(() => {
      fetchOrders();
    }, filters.search ? 500 : 0); // 500ms delay for search, immediate for other filters

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    token,
    filters.startDate,
    filters.endDate,
    filters.startDeliveryDate,
    filters.endDeliveryDate,
    filters.status,
    filters.search,
    filters.offset,
    filters.limit
  ]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset to first page when filters change
    }));
    setCurrentPage(1);
  };

  const handleClearFilter = (key) => {
    setFilters(prev => ({
      ...prev,
      [key]: '',
      offset: 0
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    const newOffset = (page - 1) * itemsPerPage;
    setFilters(prev => ({
      ...prev,
      offset: newOffset
    }));
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newLimit) => {
    // For "All" option, set limit to total orders count
    if (newLimit === 'all') {
      setItemsPerPage(ordersData?.total_order_item || 0);
      setFilters(prev => ({
        ...prev,
        limit: ordersData?.total_order_item || 0,
        offset: 0
      }));
    } else {
      setItemsPerPage(newLimit);
      setFilters(prev => ({
        ...prev,
        limit: newLimit,
        offset: 0
      }));
    }
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    // Find the status from the API data
    const statusData = orderStatuses.find(s => s.id.toString() === status.toString());

    if (!statusData) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Unknown
        </span>
      );
    }

    // Define color mapping based on status text
    const getStatusColor = (statusText) => {
      const text = statusText.toLowerCase();
      if (text.includes('pending')) return 'bg-red-100 text-red-800';
      if (text.includes('received')) return 'bg-blue-100 text-blue-800';
      if (text.includes('processed')) return 'bg-yellow-100 text-yellow-800';
      if (text.includes('shipped')) return 'bg-purple-100 text-purple-800';
      if (text.includes('delivery')) return 'bg-orange-100 text-orange-800';
      if (text.includes('delivered')) return 'bg-green-100 text-green-800';
      if (text.includes('cancelled')) return 'bg-gray-100 text-gray-800';
      if (text.includes('returned')) return 'bg-pink-100 text-pink-800';
      return 'bg-gray-100 text-gray-800';
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(statusData.status)}`}>
        {statusData.status}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Handle opening modify modal
  const handleModifyOrder = (order) => {
    setSelectedOrder(order);
    // Get order items for this order
    const orderItems = ordersData?.order_items?.filter(item => item.order_id === order.order_id) || [];
    // Initialize modified items with current order items
    setModifiedItems(orderItems.map(item => ({
      ...item,
      available: true,
      newQuantity: item.quantity,
      originalQuantity: item.quantity
    })));
    setModificationReason('');
    setShowModifyModal(true);
  };

  // Handle item availability toggle
  const handleToggleAvailability = (itemId) => {
    setModifiedItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, available: !item.available, newQuantity: item.available ? 0 : item.originalQuantity }
        : item
    ));
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, change) => {
    setModifiedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(0, item.newQuantity + change);
        return {
          ...item,
          newQuantity: newQty,
          available: newQty > 0
        };
      }
      return item;
    }));
  };

  // Calculate modified order totals
  const calculateModifiedTotals = () => {
    const subtotal = modifiedItems.reduce((sum, item) =>
      item.available ? sum + (item.price * item.newQuantity) : sum, 0
    );
    const deliveryCharge = selectedOrder?.delivery_charge || 0;
    const walletBalance = selectedOrder?.wallet_balance || 0;
    const finalTotal = subtotal + deliveryCharge - walletBalance;

    return {
      subtotal,
      deliveryCharge,
      walletBalance,
      finalTotal,
      originalTotal: selectedOrder?.final_total || 0,
      savings: (selectedOrder?.final_total || 0) - finalTotal
    };
  };

  // Handle submit modification
  const handleSubmitModification = () => {
    const totals = calculateModifiedTotals();
    const unavailableItems = modifiedItems.filter(item => !item.available);
    const modifiedQtyItems = modifiedItems.filter(item => item.available && item.newQuantity !== item.originalQuantity);

    if (unavailableItems.length === 0 && modifiedQtyItems.length === 0) {
      showInfo('No Changes', 'No modifications were made to the order.');
      return;
    }

    // TODO: Call API to submit modification
    console.log('Order Modification Data:', {
      orderId: selectedOrder.order_id,
      reason: modificationReason,
      unavailableItems: unavailableItems.map(item => item.id),
      modifiedQuantities: modifiedQtyItems.map(item => ({
        itemId: item.id,
        originalQty: item.originalQuantity,
        newQty: item.newQuantity
      })),
      totals
    });

    showInfo('API Not Implemented', 'Order modification API is not yet implemented. The modification data has been logged to console.');
    setShowModifyModal(false);
  };

  // Calculate total pages based on items per page
  const totalPages = itemsPerPage > 0 ? Math.ceil((ordersData?.total_order_item || 0) / itemsPerPage) : 1;

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
        <h1 className="text-lg font-bold text-gray-800 mb-3">Orders</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Total Orders</h3>
            <p className="text-sm font-bold text-green-600">{ordersData?.total_order_item || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Total Amount</h3>
            <p className="text-sm font-bold text-blue-600">{formatCurrency(ordersData?.orders?.reduce((sum, order) => sum + order.final_total, 0) || 0)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <h3 className="text-xs font-semibold text-gray-800 mb-1">Delivery Charges</h3>
            <p className="text-sm font-bold text-purple-600">{formatCurrency(ordersData?.orders?.reduce((sum, order) => sum + order.delivery_charge, 0) || 0)}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
            <h3 className="text-xs font-semibold text-gray-800 mb-1">COD Orders</h3>
            <p className="text-sm font-bold text-orange-600">{ordersData?.orders?.filter(order => order.payment_method === 'COD').length || 0}</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-3 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="space-y-3">
            {/* Date Range Filters */}
            <div className="grid grid-cols-1 gap-3">
              {/* Order Date Range */}
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <label className="block text-xs font-semibold text-red-600 mb-2">
                  Order Date Range
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="flex-1 px-2 py-2 text-xs border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                    <span className="text-red-600 text-xs">to</span>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="flex-1 px-2 py-2 text-xs border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                    />
                  </div>
                  <button
                    onClick={() => {
                      handleClearFilter('startDate');
                      handleClearFilter('endDate');
                    }}
                    className="w-full px-2 py-2 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700"
                  >
                    Clear Date Range
                  </button>
                </div>
              </div>

              {/* Delivery Date Range */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <label className="block text-xs font-semibold text-green-600 mb-2">
                  Delivery Date Range
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={filters.startDeliveryDate}
                      onChange={(e) => handleFilterChange('startDeliveryDate', e.target.value)}
                      className="flex-1 px-2 py-2 text-xs border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    />
                    <span className="text-green-600 text-xs">to</span>
                    <input
                      type="date"
                      value={filters.endDeliveryDate}
                      onChange={(e) => handleFilterChange('endDeliveryDate', e.target.value)}
                      className="flex-1 px-2 py-2 text-xs border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    />
                  </div>
                  <button
                    onClick={() => {
                      handleClearFilter('startDeliveryDate');
                      handleClearFilter('endDeliveryDate');
                    }}
                    className="w-full px-2 py-2 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"
                  >
                    Clear Delivery Range
                  </button>
                </div>
              </div>
            </div>

            {/* Status and Search Row */}
            <div className="grid grid-cols-1 gap-3">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-red-600 mb-1">
                  Filter by Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none bg-white"
                >
                  {statusOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Filter */}
              <div>
                <label className="block text-xs font-semibold text-red-600 mb-1">
                  Search Orders
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="flex-1 px-2 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <button
                    onClick={() => fetchOrders(true)}
                    disabled={refreshing}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2 px-3 font-medium text-xs rounded-lg transition-all duration-200 ${activeTab === 'orders'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              📦 Orders
            </button>
            <button
              onClick={() => setActiveTab('orderItems')}
              className={`flex-1 py-2 px-3 font-medium text-xs rounded-lg transition-all duration-200 ${activeTab === 'orderItems'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              🛍️ Items
            </button>
          </div>
        </div>

        {/* Order Cards */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {ordersData?.orders?.map((order, index) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-xs">#{order.order_id}</h3>
                    <p className="text-xs text-gray-600 mt-1">{order.user_name}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate" title={order.mobile}>
                      {order.mobile}
                    </p>
                  </div>
                  {getStatusBadge(order.active_status)}
                </div>

                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="text-xs text-gray-600">Final Amount</p>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.final_total)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Payment</p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.payment_method === 'COD'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                      }`}>
                      {order.payment_method}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    <span>Total: {formatCurrency(order.total)}</span>
                    <span className="mx-1">•</span>
                    <span>Delivery: {formatCurrency(order.delivery_charge)}</span>
                    {order.wallet_balance > 0 && (
                      <>
                        <span className="mx-1">•</span>
                        <span>Wallet: {formatCurrency(order.wallet_balance)}</span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{order.delivery_time}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/orders/view?id=${order.order_id}`)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleModifyOrder(order)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Modify</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Only show pagination controls if not showing all items */}
        {itemsPerPage !== 'all' && totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Pagination buttons... */}
          </div>
        )}

        {/* Order Items */}
        {activeTab === 'orderItems' && (
          <div className="space-y-3">
            {ordersData?.order_items?.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-xs">{item.product_name}</h3>
                    <p className="text-xs text-gray-600 mt-1">Quantity: {item.quantity}</p>
                    {item.variant_name && (
                      <p className="text-xs text-gray-500 mt-1 truncate" title={item.variant_name}>
                        Variant: {item.variant_name}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(item.active_status)}
                </div>

                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <div>
                      <p className="text-xs text-gray-600">Unit Price</p>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Sub Total</p>
                    <span className="text-sm font-semibold text-green-600">{formatCurrency(item.sub_total)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 space-y-3">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-700">Per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
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

          <div className="flex flex-col items-center space-y-2">
            <span className="text-xs text-gray-700">Total Records: {ordersData?.total_order_item || 0}</span>
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
                    className={`px-2 py-1 text-xs border rounded ${pageNum === currentPage
                      ? 'bg-red-500 text-white border-red-500'
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

      {/* Order Modification Modal - Mobile Bottom Sheet */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50 sticky top-0 z-10">
              <div>
                <h2 className="text-base font-bold text-gray-900">Modify Order</h2>
                <p className="text-xs text-gray-500">#{selectedOrder?.order_id}</p>
              </div>
              <button
                onClick={() => setShowModifyModal(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Customer Info */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedOrder?.user_name}</p>
                    <p className="text-xs text-gray-600 mt-1">{selectedOrder?.mobile}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${selectedOrder?.payment_method === 'COD'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'
                    }`}>
                    {selectedOrder?.payment_method}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Order Items</h3>
                <div className="space-y-2">
                  {modifiedItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 border-2 rounded-lg transition-all ${item.available
                        ? 'border-gray-200 bg-white'
                        : 'border-red-200 bg-red-50'
                        }`}
                    >
                      {/* Availability Checkbox and Item Name */}
                      <div className="flex items-start space-x-3 mb-2">
                        <input
                          type="checkbox"
                          checked={item.available}
                          onChange={() => handleToggleAvailability(item.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                        />
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${item.available ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                            {item.product_name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">{item.variant_name}</p>
                        </div>
                      </div>

                      {/* Price and Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs">
                          <span className="text-gray-600">Price: {formatCurrency(item.price)}</span>
                          <br />
                          <span className="font-semibold text-gray-900">Total: {formatCurrency(item.price * item.newQuantity)}</span>
                        </div>

                        {item.available ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={item.newQuantity <= 0}
                              className="p-1.5 bg-gray-200 rounded-md active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3 h-3 text-gray-700" />
                            </button>
                            <div className="text-center min-w-[50px]">
                              <p className="text-sm font-bold text-gray-900">{item.newQuantity}</p>
                              {item.newQuantity !== item.originalQuantity && (
                                <p className="text-xs text-orange-600">(was {item.originalQuantity})</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="p-1.5 bg-blue-600 rounded-md active:bg-blue-700"
                            >
                              <Plus className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ) : (
                          <div className="px-3 py-1.5 bg-red-100 rounded-md">
                            <p className="text-xs font-semibold text-red-700">Unavailable</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modification Reason */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Reason (Optional)
                </label>
                <textarea
                  value={modificationReason}
                  onChange={(e) => setModificationReason(e.target.value)}
                  placeholder="e.g., Some items are out of stock..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={2}
                />
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Order Summary</h3>
                <div className="space-y-1.5 bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Total:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(calculateModifiedTotals().originalTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Subtotal:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(calculateModifiedTotals().subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery:</span>
                    <span className="font-medium text-gray-900">+{formatCurrency(calculateModifiedTotals().deliveryCharge)}</span>
                  </div>
                  {calculateModifiedTotals().walletBalance > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wallet:</span>
                      <span className="font-medium text-green-600">-{formatCurrency(calculateModifiedTotals().walletBalance)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-1.5 mt-1.5">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">New Total:</span>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(calculateModifiedTotals().finalTotal)}</span>
                    </div>
                  </div>
                  {calculateModifiedTotals().savings > 0 && (
                    <div className="flex justify-between bg-green-50 p-2 rounded">
                      <span className="text-green-700 font-medium">Adjustment:</span>
                      <span className="text-green-700 font-bold">-{formatCurrency(calculateModifiedTotals().savings)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Change Summary */}
              {(modifiedItems.filter(item => !item.available).length > 0 ||
                modifiedItems.filter(item => item.available && item.newQuantity !== item.originalQuantity).length > 0) && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-yellow-900 mb-1">Changes:</h4>
                    <ul className="space-y-0.5 text-xs text-yellow-800">
                      {modifiedItems.filter(item => !item.available).length > 0 && (
                        <li>• {modifiedItems.filter(item => !item.available).length} item(s) unavailable</li>
                      )}
                      {modifiedItems.filter(item => item.available && item.newQuantity !== item.originalQuantity).length > 0 && (
                        <li>• {modifiedItems.filter(item => item.available && item.newQuantity !== item.originalQuantity).length} quantity modified</li>
                      )}
                    </ul>
                  </div>
                )}
            </div>

            {/* Modal Footer - Sticky */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center gap-2 sticky bottom-0">
              <button
                onClick={() => setShowModifyModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg active:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitModification}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-lg active:bg-orange-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;


