import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  ShoppingCart,
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
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl mt-5 font-bold text-gray-900">Orders Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all your orders</p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="inline-flex mt-5 items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
        
      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{ordersData?.total_order_item || 0}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total Amount</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(ordersData?.orders?.reduce((sum, order) => sum + order.final_total, 0) || 0)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">₹</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Delivery Charges</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(ordersData?.orders?.reduce((sum, order) => sum + order.delivery_charge, 0) || 0)}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-purple-600">🚚</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">COD Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{ordersData?.orders?.filter(order => order.payment_method === 'COD').length || 0}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-orange-600">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center">
            <Filter className="w-4 h-4 mr-2 text-gray-600" />
            Filters
          </h2>
          <button
            onClick={() => {
              handleClearFilter('startDate');
              handleClearFilter('endDate');
              handleClearFilter('startDeliveryDate');
              handleClearFilter('endDeliveryDate');
              handleFilterChange('status', '');
              handleFilterChange('search', '');
            }}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Order Date Range */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Order Date From
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Order Date To
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Delivery Date Range */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Delivery From
            </label>
            <input
              type="date"
              value={filters.startDeliveryDate}
              onChange={(e) => handleFilterChange('startDeliveryDate', e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Delivery To
            </label>
            <input
              type="date"
              value={filters.endDeliveryDate}
              onChange={(e) => handleFilterChange('endDeliveryDate', e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <ChevronDown className="w-3 h-3 inline mr-1" />
              Order Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Search className="w-3 h-3 inline mr-1" />
              Search Orders
            </label>
            <input
              type="text"
              placeholder="Search by order ID, customer name, mobile..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📦 Orders ({ordersData?.orders?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('orderItems')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'orderItems'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🛍️ Order Items ({ordersData?.order_items?.length || 0})
            </button>
          </nav>
        </div>
      </div>

      {/* Orders Table */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <ShoppingCart className="w-4 h-4 mr-2 text-gray-600" />
              Orders List
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Delivery
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {ordersData?.orders?.map((order, index) => (
                  <tr key={order.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-semibold">
                          #{order.order_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.user_name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{order.mobile}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(order.final_total)}</div>
                        <div className="text-[10px] text-gray-500">
                          Base: {formatCurrency(order.total)} + ₹{order.delivery_charge}
                        </div>
                        {order.wallet_balance > 0 && (
                          <div className="text-[10px] text-green-600">
                            Wallet: -{formatCurrency(order.wallet_balance)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-[11px] font-semibold rounded-md ${
                        order.payment_method === 'COD' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {order.payment_method}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-gray-600">{order.delivery_time}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => navigate(`/orders/view?id=${order.order_id}`)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </button>
                        <button 
                          onClick={() => handleModifyOrder(order)}
                          className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded-md hover:bg-orange-700 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          Modify
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary and Pagination */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Total</p>
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(ordersData?.orders?.reduce((sum, order) => sum + order.total, 0) || 0)}
                  </p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Delivery</p>
                  <p className="text-sm font-semibold text-purple-600">
                    {formatCurrency(ordersData?.orders?.reduce((sum, order) => sum + order.delivery_charge, 0) || 0)}
                  </p>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Final</p>
                  <p className="text-sm font-semibold text-blue-600">
                    {formatCurrency(ordersData?.orders?.reduce((sum, order) => sum + order.final_total, 0) || 0)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value="all">All</option>
                  </select>
                </div>
                
                {/* Only show pagination controls if not showing all items */}
                {itemsPerPage !== 'all' && totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, currentPage - 2) + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-white text-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="px-1 text-xs text-gray-500">...</span>
                    )}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Items Tab */}
      {activeTab === 'orderItems' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Order Items Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Variant
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Sub Total
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {ordersData?.order_items?.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                      <div className="truncate font-medium" title={item.product_name}>
                        {item.product_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {item.variant_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold">
                        ×{item.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(item.sub_total)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(item.active_status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Modification Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Modify Order #{selectedOrder?.order_id}</h2>
                <p className="text-sm text-gray-500 mt-1">Adjust item availability and quantities</p>
              </div>
              <button
                onClick={() => setShowModifyModal(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Customer Info */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedOrder?.user_name}</p>
                    <p className="text-xs text-gray-600 mt-1">{selectedOrder?.mobile}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
                      selectedOrder?.payment_method === 'COD' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {selectedOrder?.payment_method}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {modifiedItems.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 border-2 rounded-lg transition-all ${
                        item.available 
                          ? 'border-gray-200 bg-white' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          {/* Availability Checkbox */}
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={item.available}
                              onChange={() => handleToggleAvailability(item.id)}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Item Details */}
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${item.available ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                              {item.product_name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{item.variant_name}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-600">
                                Price: {formatCurrency(item.price)}
                              </span>
                              <span className="text-xs font-semibold text-gray-900">
                                Subtotal: {formatCurrency(item.price * item.newQuantity)}
                              </span>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          {item.available && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleQuantityChange(item.id, -1)}
                                disabled={item.newQuantity <= 0}
                                className="p-1.5 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus className="w-4 h-4 text-gray-700" />
                              </button>
                              <div className="text-center min-w-[60px]">
                                <p className="text-xs text-gray-500">Qty</p>
                                <p className="text-lg font-bold text-gray-900">{item.newQuantity}</p>
                                {item.newQuantity !== item.originalQuantity && (
                                  <p className="text-xs text-orange-600">
                                    (was {item.originalQuantity})
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleQuantityChange(item.id, 1)}
                                className="p-1.5 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                              >
                                <Plus className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          )}

                          {!item.available && (
                            <div className="px-4 py-2 bg-red-100 rounded-md">
                              <p className="text-xs font-semibold text-red-700">Unavailable</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modification Reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Reason for Modification (Optional)
                </label>
                <textarea
                  value={modificationReason}
                  onChange={(e) => setModificationReason(e.target.value)}
                  placeholder="e.g., Some items are out of stock..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={3}
                />
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Original Total:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(calculateModifiedTotals().originalTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">New Subtotal:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(calculateModifiedTotals().subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Charge:</span>
                    <span className="font-medium text-gray-900">+{formatCurrency(calculateModifiedTotals().deliveryCharge)}</span>
                  </div>
                  {calculateModifiedTotals().walletBalance > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Wallet Used:</span>
                      <span className="font-medium text-green-600">-{formatCurrency(calculateModifiedTotals().walletBalance)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-900">New Final Total:</span>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(calculateModifiedTotals().finalTotal)}</span>
                    </div>
                  </div>
                  {calculateModifiedTotals().savings > 0 && (
                    <div className="flex justify-between text-sm bg-green-50 p-2 rounded">
                      <span className="text-green-700 font-medium">Adjustment Amount:</span>
                      <span className="text-green-700 font-bold">-{formatCurrency(calculateModifiedTotals().savings)}</span>
                    </div>
                  )}
                  {calculateModifiedTotals().savings < 0 && (
                    <div className="flex justify-between text-sm bg-orange-50 p-2 rounded">
                      <span className="text-orange-700 font-medium">Additional Amount:</span>
                      <span className="text-orange-700 font-bold">+{formatCurrency(Math.abs(calculateModifiedTotals().savings))}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Change Summary */}
              {(modifiedItems.filter(item => !item.available).length > 0 || 
                modifiedItems.filter(item => item.available && item.newQuantity !== item.originalQuantity).length > 0) && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">Changes Summary:</h4>
                  <ul className="space-y-1 text-xs text-yellow-800">
                    {modifiedItems.filter(item => !item.available).length > 0 && (
                      <li>• {modifiedItems.filter(item => !item.available).length} item(s) marked as unavailable</li>
                    )}
                    {modifiedItems.filter(item => item.available && item.newQuantity !== item.originalQuantity).length > 0 && (
                      <li>• {modifiedItems.filter(item => item.available && item.newQuantity !== item.originalQuantity).length} item(s) quantity modified</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModifyModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitModification}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Submit Modification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;