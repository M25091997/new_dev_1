import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bell, Clock, ShoppingBag, Package, AlertCircle } from 'lucide-react';
import { markNotificationAsRead } from '../../../api/api';

const NotificationModal = ({ isOpen, onClose, notifications, unreadCount, token, onMarkAsRead }) => {
  const navigate = useNavigate();
  const [localNotifications, setLocalNotifications] = useState(notifications || []);
  
  // Update local notifications when prop changes
  React.useEffect(() => {
    setLocalNotifications(notifications || []);
  }, [notifications]);
  
  if (!isOpen) return null;
  console.log("notifications", notifications);
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <ShoppingBag className="w-4 h-4 text-green-600" />;
      case 'order_delivered':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'order_cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleNotificationClick = async (notification) => {
    // Only mark as read if it's unread
    if (notification.read_at === null && token) {
      try {
        // Call API to mark notification as read
        await markNotificationAsRead(token, notification.id);
        
        // Update local state immediately
        const updatedNotifications = localNotifications.map(n => 
          n.id === notification.id 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        );
        setLocalNotifications(updatedNotifications);
        
        // Notify parent component to update state
        if (onMarkAsRead) {
          onMarkAsRead(notification.id);
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
        // Continue with navigation even if API call fails
      }
    }
    
    // Close the modal
    onClose();
    
    // Check if notification has order_id
    if (notification.data?.order_id) {
      // Navigate to order details page
      navigate(`/orders/view?id=${notification.data.order_id}`);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal - Bottom Sheet Style */}
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-bold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag Indicator */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto pb-6">
          {localNotifications && localNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {localNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 active:bg-gray-100 transition-colors cursor-pointer ${notification.read_at === null ? 'bg-blue-50' : ''
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${notification.read_at === null ? 'bg-white' : 'bg-gray-100'
                      }`}>
                      {getNotificationIcon(notification.data?.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${notification.read_at === null
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-600'
                        }`}>
                        {notification.data?.text || 'New notification'}
                      </p>

                      {notification.data?.order_id && (
                        <p className="text-xs text-gray-500 mt-1">
                          Order #{notification.data.order_id}
                        </p>
                      )}

                      <div className="flex items-center space-x-1 mt-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Unread Indicator */}
                    {notification.read_at === null && (
                      <div className="flex-shrink-0 pt-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-center text-sm">No notifications yet</p>
              <p className="text-gray-400 text-xs text-center mt-1">
                We'll notify you when something arrives
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {localNotifications && localNotifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-t-2xl">
            <button className="w-full text-center text-sm text-red-600 font-medium py-2">
              View All Notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationModal;

