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
  Hash
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
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header - Android App Style */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold">Order Details</h1>
                <p className="text-xs text-white/80">#{order.order_id}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadInvoice}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleGenerateInvoice}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Highlighted OTP Section - Android Card Style */}
        {order.seller_pickup_otp ? (
          <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl shadow-xl p-5 sm:p-6 border-2 border-orange-300 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
              {/* Icon Section */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                <Key className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>

              {/* OTP Details */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex justify-center sm:justify-start items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <label className="text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wide">
                    OTP for Product Pickup
                  </label>
                </div>

                <p className="text-3xl sm:text-4xl font-bold text-white tracking-wider drop-shadow-lg mb-1">
                  {order.seller_pickup_otp}
                </p>
                <p className="text-xs sm:text-sm text-white/80">
                  Verify this OTP when the delivery boy arrives
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl shadow-xl p-5 sm:p-6 border-2 border-orange-300 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
              {/* Icon Section */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>

              {/* Message */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex justify-center sm:justify-start items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <label className="text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wide">
                    Pickup OTP Pending
                  </label>
                </div>

                <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                  You will get the OTP once the delivery boy accepts the order.
                </p>
              </div>
            </div>
          </div>
        )}


        <div className="space-y-4">
          {/* Order Details - Android Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-200">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Order Details</h2>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <div className="flex items-center space-x-1 mb-1">
                    <Hash className="w-3 h-3 text-gray-400" />
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Order Id</label>
                  </div>
                  <p className="text-xs font-bold text-gray-800">{order.order_id}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <div className="flex items-center space-x-1 mb-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Email</label>
                  </div>
                  <p className="text-xs font-bold text-gray-800 truncate">{order.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <div className="flex items-center space-x-1 mb-1">
                    <FileText className="w-3 h-3 text-gray-400" />
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Order Note</label>
                  </div>
                  <p className="text-xs font-bold text-gray-800">{order.order_note || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <div className="flex items-center space-x-1 mb-1">
                    <CheckCircle className="w-3 h-3 text-gray-400" />
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Status</label>
                  </div>
                  <p className="text-xs font-bold text-gray-800">{order.status_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <div className="flex items-center space-x-1 mb-1">
                    <User className="w-3 h-3 text-gray-400" />
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Name</label>
                  </div>
                  <p className="text-xs font-bold text-gray-800">{order.user_name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <div className="flex items-center space-x-1 mb-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Contact</label>
                  </div>
                  <p className="text-xs font-bold text-gray-800">{order.user_mobile}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                <div className="flex items-center space-x-1 mb-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Address</label>
                </div>
                <p className="text-xs font-bold text-gray-800">{order.customer_address}</p>
                <p className="text-[10px] text-gray-600 mt-1">Pincode: {order.customer_pincode}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                <div className="flex items-center space-x-1 mb-1">
                  <Truck className="w-3 h-3 text-gray-400" />
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Delivery Boy</label>
                </div>
                <p className="text-xs font-bold text-gray-800">{order.delivery_boy_name || 'Not Assigned'}</p>
              </div>
            </div>
          </div>

          {/* Billing Details - Android Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-200">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-base font-bold text-gray-800">Billing Details</h2>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <div className="flex items-center space-x-1 mb-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Order Date</label>
                  </div>
                  <p className="text-xs font-bold text-gray-800">{new Date(order.orders_created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <div className="flex items-center space-x-1 mb-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Delivery Time</label>
                  </div>
                  <p className="text-xs font-bold text-gray-800">{order.delivery_time}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                <div className="flex items-center space-x-1 mb-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Billing Address</label>
                </div>
                <p className="text-xs font-bold text-gray-800">{order.order_address}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Total (₹)</label>
                  <p className="text-xs font-bold text-gray-800">₹{order.total}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Discount (%)</label>
                  <p className="text-xs font-bold text-gray-800">{order.discount}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Wallet Used (₹)</label>
                  <p className="text-xs font-bold text-gray-800">₹{order.wallet_balance}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Promo Disc. (₹)</label>
                  <p className="text-xs font-bold text-gray-800">₹{order.promo_discount}</p>
                </div>
              </div>

              {order.promo_code && (
                <div className="bg-blue-50 rounded-xl p-2.5 border border-blue-200">
                  <label className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Promo Code</label>
                  <p className="text-xs font-bold text-blue-800">{order.promo_code}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Delivery Charge (₹)</label>
                  <p className="text-xs font-bold text-gray-800">₹{order.delivery_charge}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Handling Fee (₹)</label>
                  <p className="text-xs font-bold text-gray-800">₹{order.handling_fee}</p>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-700">Payable Total</label>
                  <p className="text-xl font-bold text-green-600">
                    ₹{order.final_total}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                <div className="flex items-center space-x-1 mb-1">
                  <CreditCard className="w-3 h-3 text-gray-400" />
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Payment Method</label>
                </div>
                <p className="text-xs font-bold text-gray-800">{order.payment_method}</p>
              </div>
            </div>
          </div>

          {/* List of Order Items - Android Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Package className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="text-base font-bold text-gray-800">Order Items</h2>
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-bold">
                {order_items?.length || 0}
              </span>
            </div>

            <div className="space-y-3">
              {order_items?.map((item, index) => (
                <div key={item.id} className="border-2 border-gray-200 rounded-2xl p-3 bg-gradient-to-br from-white to-gray-50 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <div className="absolute -top-1 -left-1 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-gray-800 mb-2 line-clamp-2">
                        {item.product_name}
                      </h3>
                      <div className="grid grid-cols-3 gap-1.5 mb-2">
                        <div className="bg-white rounded-lg p-1.5 border border-gray-200">
                          <span className="text-[9px] text-gray-500 block mb-0.5">Qty</span>
                          <span className="text-[10px] font-bold text-gray-800">{item.quantity}</span>
                        </div>
                        <div className="bg-white rounded-lg p-1.5 border border-gray-200">
                          <span className="text-[9px] text-gray-500 block mb-0.5">Variant</span>
                          <span className="text-[10px] font-bold text-gray-800 truncate">{item.variant_name}</span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-1.5 border border-green-200">
                          <span className="text-[9px] text-green-600 block mb-0.5">Subtotal</span>
                          <span className="text-[10px] font-bold text-green-700">₹{item.sub_total}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleViewItemDetails(item)}
                          className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-red-600 text-white text-[10px] rounded-xl hover:bg-red-700 transition-all shadow-sm font-bold"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={() => handleViewProduct(item)}
                          className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-gray-600 text-white text-[10px] rounded-xl hover:bg-gray-700 transition-all shadow-sm font-bold"
                        >
                          <Package className="w-3 h-3" />
                          <span>Product</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
