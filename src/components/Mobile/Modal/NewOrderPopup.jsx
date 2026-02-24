import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, XCircle, ShoppingBag, User, MapPin, Phone, DollarSign, Calendar, Package, Tag, IndianRupee, AlertTriangle } from 'lucide-react';
import { getViewOrderDetails, acceptOrRejectOrder } from '../../../api/api';
import { useToast } from '../../../contexts/ToastContext';
import sirenSound from '../../../utils/sirenSound';

const NewOrderPopup = ({ isOpen, onClose, notification, token, onAccept, onReject }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [processingAction, setProcessingAction] = useState(null); // null, 'accept', or 'reject'
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const { showError, showSuccess } = useToast();

  const orderId = notification?.data?.order_id;

  // Initialize audio on mount (helps with mobile)
  useEffect(() => {
    // Try to initialize audio early on user interaction
    const initAudioOnInteraction = async () => {
      try {
        await sirenSound.init();
      } catch (err) {
        console.log('Audio will be initialized on first play:', err);
      }
    };
    
    // Initialize on any user interaction (click, touch, keypress)
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, initAudioOnInteraction, { once: true });
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, initAudioOnInteraction);
      });
      sirenSound.stop();
    };
  }, []);

  // Fetch order details when popup opens
  useEffect(() => {
    if (isOpen && orderId && token) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId, token]);

  // Reset processing state when modal opens
  useEffect(() => {
    if (isOpen) {
      setProcessingAction(null); // Reset processing state when modal opens
    }
  }, [isOpen]);

  // Play bell ring sound when popup is open
  useEffect(() => {
    if (isOpen) {
      // Play sound with multiple retry attempts for mobile compatibility
      const playSound = async (retryCount = 0) => {
        try {
          // Initialize audio first
          if (!sirenSound.audio) {
            await sirenSound.init();
          }
          
          // Small delay to ensure modal is rendered
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Play sound
          if (!sirenSound.isPlaying) {
            await sirenSound.play();
            console.log('Bell ring sound started when modal opened');
          } else {
            console.log('Bell ring sound already playing');
          }
        } catch (error) {
          console.error(`Failed to play bell ring sound (attempt ${retryCount + 1}):`, error);
          
          // Retry up to 3 times with increasing delays
          if (retryCount < 3) {
            setTimeout(() => {
              playSound(retryCount + 1);
            }, (retryCount + 1) * 300);
          } else {
            console.warn('Audio playback failed after all retries. User interaction required.');
          }
        }
      };
      
      // Play sound immediately with small delay to ensure modal is rendered
      setTimeout(() => {
        playSound();
      }, 100);
    } else {
      // Stop sound when modal closes
      sirenSound.stop();
      console.log('Bell ring sound stopped - modal closed');
    }

    return () => {
      // Cleanup: stop sound when component unmounts or modal closes
      sirenSound.stop();
    };
  }, [isOpen]);

  // Prevent ESC key from closing the modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        event.stopPropagation();
        // Do nothing - modal must be closed via accept/reject
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen]);

  const fetchOrderDetails = async () => {
    if (!orderId || !token) return;
    
    try {
      setLoadingOrder(true);
      const response = await getViewOrderDetails(token, orderId);
      if (response.status === 1 && response.data) {
        setOrderDetails(response.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoadingOrder(false);
    }
  };

  // Extract order data from response structure
  const order = orderDetails?.order || orderDetails;
  const orderItems = orderDetails?.order_items || orderDetails?.items || [];
  const customer = order?.customer || order?.billing_address || order;

  const handleAccept = async (e) => {
    // Stop event propagation to prevent backdrop click handler
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (processingAction) return; // Prevent multiple clicks
    
    try {
      setProcessingAction('accept'); // Set specific action type
      
      // Stop sound immediately
      sirenSound.stop();
      console.log('Bell ring sound stopped - order accept initiated');
      
      // Call API to accept order
      const response = await acceptOrRejectOrder(token, orderId, 1, null);
      
      if (response.status === 1) {
        // Show success message
        showSuccess(response.message || 'Order has been accepted successfully!');
        
        // Call callback if provided
        if (onAccept) {
          onAccept(orderId);
        }
        
        // Close modal after short delay
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        showError(response.message || 'Failed to accept order');
        setProcessingAction(null); // Reset processing state on error
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      showError(error.message || 'Failed to accept order. Please try again.');
      setProcessingAction(null); // Reset processing state on error
    }
  };

  const handleReject = (e) => {
    // Stop event propagation to prevent backdrop click handler
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (processingAction) return; // Prevent multiple clicks
    
    // Show reject reason modal
    setShowRejectModal(true);
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      showError('Please provide a reason for rejecting this order');
      return;
    }

    if (processingAction) return; // Prevent multiple clicks
    
    try {
      setProcessingAction('reject'); // Set specific action type
      
      // Stop sound immediately
      sirenSound.stop();
      console.log('Bell ring sound stopped - order reject initiated');
      
      // Call API to reject order with reason (status: 2 for reject)
      const response = await acceptOrRejectOrder(token, orderId, 2, rejectReason.trim());
      
      if (response.status === 1) {
        // Show success message
        showSuccess(response.message || 'Order has been rejected successfully!');
        
        // Close reject modal
        setShowRejectModal(false);
        setRejectReason('');
        
        // Call callback if provided
        if (onReject) {
          onReject(orderId);
        }
        
        // Close modal after short delay
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        showError(response.message || 'Failed to reject order');
        setProcessingAction(null); // Reset processing state on error
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      showError(error.message || 'Failed to reject order. Please try again.');
      setProcessingAction(null); // Reset processing state on error
    }
  };

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    return `https://seller.bringmart.in/storage/${image}`;
  };

  if (!isOpen || !notification) return null;

  // Unlock audio on touch/click (mobile requirement)
  // This plays sound if modal is open and sound is not playing
  const handleUnlockAudio = async () => {
    try {
      if (!isOpen || sirenSound.isPlaying || sirenSound.initialized) return;
      if (!sirenSound.audio) await sirenSound.init();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await sirenSound.play();
      sirenSound.initialized = true; // mark as initialized to prevent repeated runs
    } catch (error) {
      console.error('Error unlocking audio:', error);
    }
  };
  

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-40 z-[9999] flex items-end sm:items-center justify-center"
        onClick={(e) => {
          e.stopPropagation();
          handleUnlockAudio();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          handleUnlockAudio();
        }}       
        
      >
        {/* Modal - Mobile App Style */}
        <div 
          className="bg-white w-full max-w-md h-[92vh] sm:max-h-[92vh] overflow-hidden flex flex-col rounded-t-3xl sm:rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* Header - Mobile App Style */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200 px-4 pt-5 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <ShoppingBag className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-md font-bold text-gray-900">New Order Available</h2>
                  <p className="text-gray-600 text-xs mt-0.5 font-medium">Order #{orderId}</p>
                </div>
              </div>
            </div>
            {/* Android Style Divider */}
            <div className="h-1 w-12 bg-gray-300 rounded-full mx-auto sm:hidden mt-2"></div>
          </div>

          {/* Action Buttons - Fixed at Top - Mobile App Style */}
          <div className="bg-white border-b border-gray-200 px-4 py-3.5 flex-shrink-0 shadow-md">
            <div className="grid grid-cols-2 gap-3">
              {/* Accept Button */}
              <button
                onClick={handleAccept}
                disabled={processingAction !== null} // Disable if any action is processing
                className="flex items-center justify-center space-x-2 px-4 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl active:from-green-700 active:to-green-800 disabled:from-green-400 disabled:to-green-400 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-md hover:shadow-lg"
              >
                {processingAction === 'accept' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-xs">Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Accept Order</span>
                  </>
                )}
              </button>
              
              {/* Reject Button */}
              <button
                onClick={handleReject}
                disabled={processingAction !== null} // Disable if any action is processing
                className="flex items-center justify-center space-x-2 px-4 py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl active:from-red-700 active:to-red-800 disabled:from-red-400 disabled:to-red-400 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-md hover:shadow-lg"
              >
                {processingAction === 'reject' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-xs">Processing...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">Reject Order</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 pb-6">
            {/* Notification Text - Mobile App Card Style */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <p className="text-gray-800 text-sm font-semibold leading-relaxed">{notification.data?.text || 'You have received a new order'}</p>
              </div>
            </div>

            {/* Order Details */}
            {loadingOrder ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : orderDetails ? (
              <div className="space-y-4">
                {/* Customer Info - Mobile App Card */}
                {customer && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-2">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      Customer Details
                    </h3>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-start">
                        <span className="text-gray-500 w-20 flex-shrink-0">Name:</span>
                        <span className="text-gray-900 font-medium flex-1">{customer.name || customer.customer_name || 'N/A'}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-gray-500 w-20 flex-shrink-0 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          Phone:
                        </span>
                        <span className="text-gray-900 font-medium flex-1">{customer.mobile || customer.phone || customer.mobile_number || 'N/A'}</span>
                      </div>
                      {(customer.address || customer.billing_address || customer.shipping_address) && (
                        <div className="flex items-start pt-1 border-t border-gray-100">
                          <span className="text-gray-500 w-20 flex-shrink-0 flex items-start">
                            <MapPin className="w-3 h-3 mr-1 mt-0.5" />
                            Address:
                          </span>
                          <span className="text-gray-900 text-xs flex-1 leading-relaxed">{customer.address || customer.billing_address || customer.shipping_address || 'N/A'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Summary - Mobile App Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-2">
                      <IndianRupee className="w-4 h-4 text-green-600" />
                    </div>
                    Order Summary
                  </h3>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Total Amount</span>
                      <span className="text-gray-900 font-bold text-xl">₹{order.final_total}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        Date
                      </span>
                      <span className="text-gray-900 font-medium">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : 'N/A'}
                      </span>
                    </div>
                    {order.payment_method && (
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                        <span className="text-gray-500">Payment</span>
                        <span className="text-gray-900 font-medium">{order.payment_method}</span>
                      </div>
                    )}
                    {order.status_name && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className="text-gray-900 font-medium">{order.status_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items - Full Details Mobile App Style */}
                {orderItems.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mr-2">
                        <Package className="w-4 h-4 text-purple-600" />
                      </div>
                      Products ({orderItems.length})
                    </h3>
                    <div className="space-y-3">
                      {orderItems.map((item, index) => {
                        const imageUrl = getImageUrl(item.image || item.product_image || item.image_url);
                        const productName = item.product_name || item.name || 'Product';
                        const quantity = item.quantity || 0;
                        const price = item.price || item.unit_price || 0;
                        const subtotal = item.sub_total || item.subtotal || (price * quantity);
                        const variant = item.variant_name || item.variant || item.product_variant_name || null;
                        
                        return (
                          <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-3.5 border border-gray-200 shadow-sm">
                            <div className="flex items-start space-x-3">
                              {/* Product Image - Android Style */}
                              <div className="flex-shrink-0">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={productName}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23f3f4f6" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
                                    }}
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                                  {productName}
                                </h4>
                                
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Quantity:</span>
                                    <span className="text-gray-900 font-semibold">{quantity}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Unit Price:</span>
                                    <span className="text-gray-900 font-semibold">₹{price.toFixed(2)}</span>
                                  </div>
                                  {/* {variant && (
                                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
                                      <span className="text-gray-500 flex items-center">
                                        <Tag className="w-3 h-3 mr-1" />
                                        Variant:
                                      </span>
                                      <span className="text-gray-900 font-medium text-right">{variant}</span>
                                    </div>
                                  )} */}
                                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-1">
                                    <span className="text-gray-700 font-semibold text-sm">Subtotal:</span>
                                    <span className="text-gray-900 font-bold text-base">₹{subtotal.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 text-sm">
                <p>Unable to load order details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Reason Modal - Android Style */}
      {showRejectModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4"
          onClick={(e) => {
            // Prevent closing modal on backdrop click
            e.stopPropagation();
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center border-2 border-orange-200">
                <AlertTriangle className="w-7 h-7 text-orange-500" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Reject Order?
            </h3>

            {/* Instruction Text */}
            <p className="text-gray-600 text-sm text-center mb-5">
              Please provide a reason for rejecting this order:
            </p>

            {/* Input Field */}
            <div className="mb-5">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none text-sm"
                rows={4}
                disabled={processingAction === 'reject'}
                autoFocus
              />
            </div>

            {/* Action Buttons - Android Style */}
            <div className="flex space-x-3">
              <button
                onClick={handleRejectConfirm}
                disabled={processingAction === 'reject' || !rejectReason.trim()}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 active:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors font-semibold text-sm shadow-sm"
              >
                {processingAction === 'reject' ? (
                  <span className="flex items-center justify-center text-xs">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  'Reject Order'
                )}
              </button>
              <button
                onClick={handleRejectCancel}
                disabled={processingAction === 'reject'}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 active:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-sm shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewOrderPopup;