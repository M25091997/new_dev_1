/**
 * NOTIFICATION POLLER - USAGE EXAMPLE
 * 
 * This file demonstrates how to use the notificationPoller utility
 * in your React components to fetch notifications every 10 seconds.
 * 
 * DELETE THIS FILE AFTER UNDERSTANDING THE USAGE
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { notificationPoller } from './notificationPoller';

const ExampleComponent = () => {
  const { token } = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Start polling when component mounts and token is available
    if (token) {
      notificationPoller.start(
        token,
        // Success callback - called every 10 seconds with fresh data
        (data) => {
          console.log('Received notifications:', data);
          setNotifications(data.notifications);
          setUnreadCount(data.unread);
          
          // You can also trigger other actions here:
          // - Show toast notification for new orders
          // - Update badge count in navbar
          // - Play notification sound
          // - etc.
        },
        // Error callback (optional)
        (error) => {
          console.error('Failed to fetch notifications:', error);
        }
      );
    }

    // Cleanup: Stop polling when component unmounts
    return () => {
      notificationPoller.stop();
    };
  }, [token]);

  return (
    <div>
      <h2>Notifications ({unreadCount} unread)</h2>
      
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id}>
            <p>{notification.data.text}</p>
            <small>{new Date(notification.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExampleComponent;

/**
 * INTEGRATION IN LAYOUT COMPONENT
 * 
 * You can also integrate this in your main Layout component
 * so notifications are polled throughout the app:
 */

// In LayoutWrapper.jsx or MobileLayoutWrapper.jsx

/*
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { notificationPoller } from '../../utils/notificationPoller';
import { useToast } from '../../contexts/ToastContext';

const LayoutWrapper = () => {
  const { token } = useSelector((state) => state.user);
  const { showInfo } = useToast();

  useEffect(() => {
    if (token) {
      notificationPoller.start(
        token,
        (data) => {
          // Show toast for new notifications
          if (data.unread > 0) {
            const latestNotification = data.notifications[0];
            if (latestNotification && latestNotification.read_at === null) {
              showInfo('New Notification', latestNotification.data.text);
            }
          }
        },
        (error) => {
          console.error('Notification polling error:', error);
        }
      );
    }

    return () => {
      notificationPoller.stop();
    };
  }, [token]);

  // ... rest of your layout component
};
*/

/**
 * ADVANCED USAGE - Custom Polling Interval
 * 
 * If you want to change the polling interval from 10 seconds to something else:
 */

/*
// Change to 5 seconds
notificationPoller.updateInterval(5000);

// Change to 30 seconds
notificationPoller.updateInterval(30000);
*/

/**
 * MANUAL FETCH
 * 
 * If you want to manually fetch notifications without waiting for the interval:
 */

/*
const handleRefreshNotifications = async () => {
  await notificationPoller.fetch();
};
*/

/**
 * CHECK IF POLLING IS ACTIVE
 */

/*
const isPollingActive = notificationPoller.isActive();
console.log('Polling active:', isPollingActive);
*/

/**
 * SAMPLE NOTIFICATION DATA STRUCTURE
 * 
 * The callback receives data in this format:
 * 
 * {
 *   unread: 71,
 *   total: 1,
 *   message: "success",
 *   notifications: [
 *     {
 *       id: "2b903437-2780-4e9c-8673-67995e3c1a28",
 *       type: "App\\Notifications\\OrderNotification",
 *       notifiable_type: "App\\Models\\Admin",
 *       notifiable_id: 32,
 *       data: {
 *         type: "new_order",
 *         order_id: 919,
 *         text: "You have Received new order  #919"
 *       },
 *       read_at: null,
 *       created_at: "2025-10-10T11:32:30.000000Z",
 *       updated_at: "2025-10-10T11:32:30.000000Z"
 *     }
 *   ]
 * }
 */

