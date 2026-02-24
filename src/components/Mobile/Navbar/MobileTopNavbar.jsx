import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Bell,
  Mail,
  Menu,
  User,
  Store,
  Power,
  RefreshCw
} from 'lucide-react';
import NotificationModal from './NotificationModal';
import ConfirmationModal from '../Modal/ConfirmationModal';
import NewOrderPopup from '../Modal/NewOrderPopup';
import { toggleStoreStatus, clearCache, getSellerStoreStatus, markNotificationAsRead } from '../../../api/api';
import { useToast } from '../../../contexts/ToastContext';
import { notificationPoller } from '../../../utils/notificationPoller';
import { useNavigate, Link } from 'react-router-dom'
import BringmartLogo from "../../../assets/BringmartLogo.png"

const MobileTopNavbar = () => {
  const { user, token } = useSelector((state) => state.user);
  const { showSuccess, showError } = useToast();
  const [isStoreOnline, setIsStoreOnline] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const [showNewOrderPopup, setShowNewOrderPopup] = useState(false);
  const [showStoreToggleModal, setShowStoreToggleModal] = useState(false);
  const shownNotificationsRef = useRef(new Set());

  const navigate = useNavigate();

  // Fetch store status on component mount
  const fetchStoreStatus = async () => {
    if (!token) return;

    try {
      const response = await getSellerStoreStatus(token);
      if (response.status === 1 && response.data) {
        // Store is on if status is 1, off if status is 10
        setIsStoreOnline(response.data.status === 1);
      }
    } catch (error) {
      console.error('Failed to fetch store status:', error);
      // Don't show error to user as this is a background operation
    }
  };

  // Start notification polling when component mounts
  useEffect(() => {
    if (token && !notificationPoller.isActive()) {
      notificationPoller.start(
        token,
        (data) => {
          console.log("data", data);
          const newNotifications = data?.notifications || [];
          setUnreadNotifications(data?.unread || 0);
          setNotifications(newNotifications);

          // Detect new "new_order" notifications
          if (newNotifications && newNotifications.length > 0) {
            newNotifications.forEach(notification => {
              // Check if it's a new_order type, unread, and hasn't been shown yet
              if (
                notification.data?.type === 'new_order' &&
                notification.read_at === null &&
                !shownNotificationsRef.current.has(notification.id) &&
                !showNewOrderPopup // Don't show if another popup is already open
              ) {
                // Mark as shown
                shownNotificationsRef.current.add(notification.id);
                
                // Show the popup
                setNewOrderNotification(notification);
                setShowNewOrderPopup(true);
              }
            });
          }
        },
        (error) => {
          console.error('Notification polling error:', error);
        }
      );
    }

    // Cleanup: Stop polling when component unmounts
    return () => {
      notificationPoller.stop();
    };
  }, [token, showNewOrderPopup]);

  // Fetch store status when component mounts
  useEffect(() => {
    fetchStoreStatus();
  }, [token]);

  const handleBellClick = () => {
    setShowNotificationModal(true);
  };

  const handleCloseNotificationModal = () => {
    setShowNotificationModal(false);
  };

  const handleMarkAsRead = (notificationId) => {
    // Update notifications state to mark notification as read
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read_at: new Date().toISOString() }
          : notification
      )
    );
    
    // Decrement unread count if notification was unread
    setUnreadNotifications(prev => Math.max(0, prev - 1));
  };

  const handleToggleStoreStatus = () => {
    if (isToggling) return; // Prevent multiple clicks

    // Show confirmation modal only when turning OFF the store
    if (isStoreOnline) {
      setShowStoreToggleModal(true);
    } else {
      // If turning ON, proceed directly
      performStoreToggle();
    }
  };

  const performStoreToggle = async () => {
    try {
      setIsToggling(true);
      const newStatus = isStoreOnline ? 10 : 1; // 10 for off, 1 for on

      const response = await toggleStoreStatus(token, newStatus);

      if (response.status === 1) {
        // Fetch the updated store status to ensure consistency
        await fetchStoreStatus();
        showSuccess('Store Status Updated', response.message || `Store is now ${isStoreOnline ? 'OFF' : 'ON'}.`);
      } else {
        throw new Error(response.message || 'Failed to update store status');
      }
    } catch (error) {
      console.error('Toggle store status error:', error);
      showError('Update Failed', error.message || 'Failed to update store status. Please try again.');
    } finally {
      setIsToggling(false);
      setShowStoreToggleModal(false);
    }
  };

  const handleStoreToggleConfirm = () => {
    performStoreToggle();
  };

  const handleStoreToggleCancel = () => {
    setShowStoreToggleModal(false);
  };

  const handleClearCacheClick = () => {
    setShowClearCacheModal(true);
  };

  const handleClearCacheConfirm = async () => {
    setShowClearCacheModal(false);

    if (isClearingCache) return; // Prevent multiple clicks

    try {
      setIsClearingCache(true);
      const response = await clearCache(token);

      if (response.status === 1) {
        showSuccess('Cache Cleared', response.message || 'Cache cleared successfully!');
        navigate("/")
      } else {
        throw new Error(response.message || 'Failed to clear cache');
      }
    } catch (error) {
      console.error('Clear cache error:', error);
      showError('Clear Cache Failed', error.message || 'Failed to clear cache. Please try again.');
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleClearCacheCancel = () => {
    setShowClearCacheModal(false);
  };

  const handleAcceptOrder = (orderId) => {
    showSuccess('Order Accepted', `Order #${orderId} has been accepted successfully`);
    // Mark notification as read
    if (newOrderNotification) {
      handleMarkAsRead(newOrderNotification.id);
      if (token) {
        markNotificationAsRead(token, newOrderNotification.id).catch(err => {
          console.error('Error marking notification as read:', err);
        });
      }
    }
    // Navigate to order details
    navigate(`/orders/view?id=${orderId}`);
  };

  const handleRejectOrder = (orderId) => {
    showSuccess('Order Rejected', `Order #${orderId} has been rejected`);
    // Mark notification as read
    if (newOrderNotification) {
      handleMarkAsRead(newOrderNotification.id);
      if (token) {
        markNotificationAsRead(token, newOrderNotification.id).catch(err => {
          console.error('Error marking notification as read:', err);
        });
      }
    }
  };

  const handleCloseNewOrderPopup = () => {
    setShowNewOrderPopup(false);
    setNewOrderNotification(null);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      {/* Left side - Menu button and Logo */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">         
          <Link to="/">
            <img src={BringmartLogo} alt="Bringmart Logo" className="w-16 h-10 rounded-lg object-cover" />
          </Link>
        </div>
      </div>

      {/* Right side icons */}
      <div className="flex items-center space-x-3">
        {/* Store Status Toggle */}
        <div className="flex items-center space-x-2">
          <Store className="w-4 h-4 text-gray-600" />
          <button
            onClick={handleToggleStoreStatus}
            disabled={isToggling}
            className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isStoreOnline ? '#10b981' : '#9ca3af'
            }}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isStoreOnline ? 'translate-x-5' : 'translate-x-1'
                }`}
            />
          </button>
          <span className={`text-xs font-medium hidden sm:block ${isStoreOnline ? 'text-green-600' : 'text-gray-600'
            }`}>
            {isStoreOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        {/* Notification Bell with badge */}
        <div className="relative">
          <Bell
            className="w-5 h-5 text-gray-600 cursor-pointer active:text-gray-800 transition-colors"
            onClick={handleBellClick}
          />
          {unreadNotifications > 0 && (
            <span onClick={handleBellClick} className="absolute -top-2.5 -right-1 bg-green-500 text-white rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-semibold animate-pulse">
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </span>
          )}
        </div>

        {/* Mail */}
        <Mail className="w-5 h-5 text-gray-600" />

        <button
          onClick={handleClearCacheClick}
          disabled={isClearingCache}
          className={`p-1.5 rounded flex items-center justify-center transition-colors ${isClearingCache
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 active:bg-green-600'
            }`}
          title="Clear Cache"
        >
          <RefreshCw
            className={`w-4 h-4 text-white ${isClearingCache ? 'animate-spin' : ''}`}
            strokeWidth={3}
          />
        </button>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={handleCloseNotificationModal}
        notifications={notifications}
        unreadCount={unreadNotifications}
        token={token}
        onMarkAsRead={handleMarkAsRead}
      />

      {/* Clear Cache Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearCacheModal}
        onClose={handleClearCacheCancel}
        onConfirm={handleClearCacheConfirm}
        title="Confirmation"
        message="Are you sure you want to proceed?"
        actions={[
          'cache:clear,',
          'config:clear,',
          'route:clear,',
          'view:clear,'
        ]}
      />

      {/* Store Toggle Confirmation Modal - Only shows when turning OFF */}
      <ConfirmationModal
        isOpen={showStoreToggleModal}
        onClose={handleStoreToggleCancel} 
        onConfirm={handleStoreToggleConfirm}
        title="Turn Off Store"
        message="Are you sure you want to turn off your store? Your store will not receive new orders while offline."
        confirmText="Turn Off"
        cancelText="Keep Online"
      />

      {/* New Order Popup */}
      <NewOrderPopup
        isOpen={showNewOrderPopup}
        onClose={handleCloseNewOrderPopup}
        notification={newOrderNotification}
        token={token}
        onAccept={handleAcceptOrder}
        onReject={handleRejectOrder}
      />
    </div>
  );
};

export default MobileTopNavbar;