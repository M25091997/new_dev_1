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

  // Reset processing state when modal opens/closes
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
      console.log('Order Details Response:', response);
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

  if (!isOpen || !notification) return null;

  // Unlock audio on touch/click (mobile requirement)
  // This plays sound if modal is open and sound is not playing
  const handleUnlockAudio = async (e) => {
    try {
      if (isOpen) {
        // Initialize audio if needed
        if (!sirenSound.audio) {
          await sirenSound.init();
        }

        // Wait a moment for audio to be ready
        await new Promise(resolve => setTimeout(resolve, 50));

        // Play sound if not already playing
        if (!sirenSound.isPlaying) {
          console.log('Starting bell ring after user interaction...');
          await sirenSound.play();
        }
      }
    } catch (error) {
      console.error('Error unlocking audio:', error);
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
        onTouchStart={handleUnlockAudio}
        onTouchEnd={handleUnlockAudio}
        onClick={handleUnlockAudio}
        onMouseDown={handleUnlockAudio}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">New Order Available</h2>
                  <p className="text-gray-500 text-sm mt-0.5">Order #{orderId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Notification Text */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-gray-800 text-sm font-medium">{notification.data?.text || 'You have received a new order'}</p>
            </div>

            {/* Order Details */}
            {loadingOrder ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : orderDetails ? (
              <div className="space-y-6">
                {/* Customer Info */}
                {customer && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-gray-600" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Name</span>
                        <p className="text-gray-900 font-medium mt-1">{customer.name || customer.customer_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Phone</span>
                        <p className="text-gray-900 font-medium mt-1 flex items-center">
                          <Phone className="w-3 h-3 mr-1.5 text-gray-400" />
                          {customer.mobile || customer.phone || customer.mobile_number || 'N/A'}
                        </p>
                      </div>
                      {(customer.address || customer.billing_address || customer.shipping_address) && (
                        <div className="col-span-2">
                          <span className="text-gray-500 text-xs uppercase tracking-wide flex items-center">
                            <MapPin className="w-3 h-3 mr-1.5 text-gray-400" />
                            Address
                          </span>
                          <p className="text-gray-900 mt-1">{customer.address || customer.billing_address || customer.shipping_address || 'N/A'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                    <IndianRupee className="w-5 h-5 mr-2 text-gray-600" />
                    Order Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wide">Total Amount</span>
                      <p className="text-gray-900 font-bold text-2xl mt-1">₹{order.final_total}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wide flex items-center">
                        <Calendar className="w-3 h-3 mr-1.5 text-gray-400" />
                        Date
                      </span>
                      <p className="text-gray-900 font-medium mt-1">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                    {order.payment_method && (
                      <div>
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Payment Method</span>
                        <p className="text-gray-900 font-medium mt-1">{order.payment_method}</p>
                      </div>
                    )}
                    {order.status_name && (
                      <div>
                        <span className="text-gray-500 text-xs uppercase tracking-wide">Status</span>
                        <p className="text-gray-900 font-medium mt-1">{order.status_name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items - Full Details */}
                {orderItems.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                      <Package className="w-5 h-5 mr-2 text-gray-600" />
                      Order Items ({orderItems.length})
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
                          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                            <div className="flex items-start space-x-4">
                              {/* Product Image */}
                              <div className="flex-shrink-0">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={productName}
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                                    }}
                                  />
                                ) : (
                                  <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                    <Package className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                                  {productName}
                                </h4>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-gray-500 text-xs">Quantity:</span>
                                    <p className="text-gray-900 font-medium">{quantity}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-xs">Unit Price:</span>
                                    <p className="text-gray-900 font-medium">₹{price.toFixed(2)}</p>
                                  </div>
                                  {/* {variant && (
                                    <div className="col-span-2">
                                      <span className="text-gray-500 text-xs flex items-center">
                                        <Tag className="w-3 h-3 mr-1" />
                                        Variant:
                                      </span>
                                      <p className="text-gray-900 font-medium">{variant}</p>
                                    </div>
                                  )} */}
                                  <div className="col-span-2 pt-2 border-t border-gray-100">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600 font-medium">Subtotal:</span>
                                      <span className="text-gray-900 font-bold text-base">₹{subtotal.toFixed(2)}</span>
                                    </div>
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
              <div className="text-center py-12 text-gray-500">
                <p>Unable to load order details</p>
              </div>
            )}
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex space-x-3">
              {/* Accept Button */}
              <button
                onClick={handleAccept}
                disabled={processingAction !== null} // Disable if any action is processing
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
              >
                {processingAction === 'accept' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Accept Order</span>
                  </>
                )}
              </button>

              {/* Reject Button */}
              <button
                onClick={handleReject}
                disabled={processingAction !== null} // Disable if any action is processing
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
              >
                {processingAction === 'reject' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span>Reject Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4"
          onClick={(e) => {
            // Prevent closing modal on backdrop click
            e.stopPropagation();
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center border-2 border-orange-200">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Reject Order?
            </h3>

            {/* Instruction Text */}
            <p className="text-gray-600 text-sm text-center mb-6">
              Please provide a reason for rejecting this order:
            </p>

            {/* Input Field */}
            <div className="mb-6">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                rows={4}
                disabled={processingAction === 'reject'}
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleRejectConfirm}
                disabled={processingAction === 'reject' || !rejectReason.trim()}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {processingAction === 'reject' ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  'Reject Order'
                )}
              </button>
              <button
                onClick={handleRejectCancel}
                disabled={processingAction === 'reject'}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
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