import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileText,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Rocket,
  Eye,
  X,
  MessageCircle,
  Key,
  Shield,
  CreditCard,
  Clock,
  Hash,
  AlertTriangle
} from 'lucide-react';
import { getViewOrderDetails, getOrderStatuses, assignDeliveryBoy, generateInvoice, downloadInvoice } from '../../../api/api';
import { useToast } from '../../../contexts/ToastContext';
import OrderItemDetailsModal from '../Modal/OrderItemDetailsModal';

const ViewOrderDetails = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.user);
  const { showError, showSuccess } = useToast();

  const orderId = searchParams.get('id');

  useEffect(() => {
    if (orderId && token) {
      fetchOrderDetails();
      fetchOrderStatuses();
    }
  }, [orderId, token]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await getViewOrderDetails(token, orderId);
      if (response.status === 1) {
        setOrderDetails(response.data);
        setSelectedStatus(response.data.order.status_name);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      showError('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStatuses = async () => {
    try {
      const response = await getOrderStatuses(token);
      if (response.status === 1) {
        setOrderStatuses(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching order statuses:', error);
      showError('Error', 'Failed to load order statuses');
    }
  };

  const handleBack = () => {
    navigate('/orders');
  };

  const handleGenerateInvoice = () => {
    const orderId = searchParams.get('id');
    if (orderId) {
      navigate(`/invoices/generate?id=${orderId}`);
    } else {
      showError('Error', 'Order ID not found');
    }
  };

  const handleDownloadInvoice = async () => {
    const orderId = searchParams.get('id');
    if (!orderId) {
      showError('Error', 'Order ID not found');
      return;
    }

    try {
      await downloadInvoice(token, orderId);
      showSuccess('Success', 'Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showError('Error', error.message || 'Failed to download invoice');
    }
  };

  const handleAssignDeliveryBoy = async () => {
    if (!selectedDeliveryBoy) {
      showError('Error', 'Please select a delivery boy');
      return;
    }

    try {
      setLoading(true);
      const response = await assignDeliveryBoy(token, orderId, selectedDeliveryBoy);

      if (response.status === 1) {
        showSuccess('Success', response.message || 'Delivery boy assigned successfully');
        // Optionally refresh order details to show updated delivery boy
        await fetchOrderDetails();
        setSelectedDeliveryBoy(''); // Clear selection
      } else {
        throw new Error(response.message || 'Failed to assign delivery boy');
      }
    } catch (error) {
      console.error('Error assigning delivery boy:', error);
      showError('Error', error.message || 'Failed to assign delivery boy');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = () => {
    if (!selectedStatus) {
      showError('Error', 'Please select a status');
      return;
    }
    showSuccess('Success', 'Order status updated successfully');
  };

  const handleAcceptOrder = () => {
    showSuccess('Success', 'Order accepted successfully');
  };

  const handleRejectOrder = () => {
    showSuccess('Success', 'Order rejected successfully');
  };

  const handleCreateShiprocketOrder = () => {
    showSuccess('Success', 'Shiprocket order created successfully');
  };

  const handleViewItemDetails = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleCloseItemModal = () => {
    setShowItemModal(false);
    setSelectedItem(null);
  };

  const handleWhatsApp = (item) => {
    showSuccess('Info', `Opening WhatsApp for ${item.product_name}`);
  };

  const handleViewProduct = (item) => {
    if (item.product_id) {
      navigate(`/products/view/${item.product_id}`);
    } else {
      showError('Error', 'Product ID not found');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Order details not found</p>
      </div>
    );
  }

  const { order, order_items, deliveryBoys } = orderDetails;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Order Details</h1>
              <p className="text-xs text-gray-500">Order #{order.order_id}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Download Invoice</span>
          </button>
          <button
            onClick={handleGenerateInvoice}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* Highlighted OTP Section */}
      {order.seller_pickup_otp ? (
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl shadow-lg p-6 border-2 border-orange-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Key className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Shield className="w-5 h-5 text-white" />
                  <label className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                    OTP for Product Pickup
                  </label>
                </div>
                <p className="text-4xl font-bold text-white tracking-wider drop-shadow-lg">
                  {order.seller_pickup_otp}
                </p>
                <p className="text-xs text-white/80 mt-1">
                  Please verify this OTP when the delivery boy arrives
                </p>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 rounded-xl shadow-lg p-6 border-2 border-gray-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Shield className="w-5 h-5 text-white" />
                  <label className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                    OTP Not Yet Available
                  </label>
                </div>
                <p className="text-base font-medium text-white/90 leading-relaxed">
                  You will get the OTP when the delivery boy accepts the order.
                </p>
                <p className="text-xs text-white/70 mt-1">
                  Please wait for confirmation.
                </p>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Order Details</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center space-x-2 mb-1">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Id</label>
                </div>
                <p className="text-sm font-semibold text-gray-800">{order.order_id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center space-x-2 mb-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate">{order.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Note</label>
                </div>
                <p className="text-sm font-semibold text-gray-800">{order.order_note || '-'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                </div>
                <p className="text-sm font-semibold text-gray-800">{order.status_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center space-x-2 mb-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer Name</label>
                </div>
                <p className="text-sm font-semibold text-gray-800">{order.user_name}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center space-x-2 mb-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</label>
                </div>
                <p className="text-sm font-semibold text-gray-800">{order.user_mobile}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery Address</label>
              </div>
              <p className="text-sm font-semibold text-gray-800">{order.customer_address}</p>
              <p className="text-xs text-gray-600 mt-1">Pincode: {order.customer_pincode}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center space-x-2 mb-1">
                <Truck className="w-4 h-4 text-gray-400" />
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery Boy</label>
              </div>
              <p className="text-sm font-semibold text-gray-800">{order.delivery_boy_name || 'Not Assigned'}</p>
            </div>
          </div>
        </div>

        {/* Billing Details */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Billing Details</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Date</label>
                </div>
                <p className="text-sm font-semibold text-gray-800">{new Date(order.orders_created_at).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery Time</label>
                </div>
                <p className="text-sm font-semibold text-gray-800">{order.delivery_time}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Billing Address</label>
              </div>
              <p className="text-sm font-semibold text-gray-800">{order.order_address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Total (₹)</label>
                <p className="text-sm font-semibold text-gray-800">₹{order.total}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Discount (%)</label>
                <p className="text-sm font-semibold text-gray-800">{order.discount}%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Wallet Used (₹)</label>
                <p className="text-sm font-semibold text-gray-800">₹{order.wallet_balance}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Promo Discount (₹)</label>
                <p className="text-sm font-semibold text-gray-800">₹{order.promo_discount}</p>
              </div>
            </div>

            {order.promo_code && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide block mb-1">Promo Code</label>
                <p className="text-sm font-bold text-blue-800">{order.promo_code}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Delivery Charge (₹)</label>
                <p className="text-sm font-semibold text-gray-800">₹{order.delivery_charge}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Handling Fee (₹)</label>
                <p className="text-sm font-semibold text-gray-800">₹{order.handling_fee}</p>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <label className="text-base font-bold text-gray-700">Payable Total</label>
                <p className="text-2xl font-bold text-green-600">
                  ₹{order.final_total}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center space-x-2 mb-1">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Method</label>
              </div>
              <p className="text-sm font-semibold text-gray-800">{order.payment_method}</p>
            </div>
          </div>
        </div>
      </div>

      {/* List of Order Items */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Order Items</h2>
          <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {order_items?.length || 0} {order_items?.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="space-y-4">
          {order_items?.map((item, index) => (
            <div key={item.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-all bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.product_name}
                    className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                  />
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-800 mb-3">
                    {item.product_name}
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <span className="text-xs text-gray-500 block mb-1">Quantity</span>
                      <span className="text-sm font-bold text-gray-800">{item.quantity}</span>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <span className="text-xs text-gray-500 block mb-1">Variant</span>
                      <span className="text-sm font-bold text-gray-800 truncate">{item.variant_name}</span>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                      <span className="text-xs text-green-600 block mb-1">Subtotal</span>
                      <span className="text-sm font-bold text-green-700">₹{item.sub_total}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => handleViewItemDetails(item)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all shadow-sm hover:shadow-md font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => handleViewProduct(item)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-all shadow-sm hover:shadow-md font-medium"
                    >
                      <Package className="w-4 h-4" />
                      <span>View Product</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Item Details Modal */}
      <OrderItemDetailsModal
        isOpen={showItemModal}
        onClose={handleCloseItemModal}
        selectedItem={selectedItem}
        orderDetails={orderDetails}
        onWhatsAppClick={handleWhatsApp}
      />
    </div>
  );
};

export default ViewOrderDetails;
