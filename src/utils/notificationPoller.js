import { getTopNotifications } from '../api/api';

/**
 * NotificationPoller - Utility class for polling notifications every 10 seconds
 * 
 * Usage:
 * import { notificationPoller } from '../utils/notificationPoller';
 * 
 * // Start polling with a callback
 * notificationPoller.start(token, (data) => {
 *   console.log('Notifications:', data);
 *   console.log('Unread count:', data.unread);
 *   console.log('Notifications list:', data.notifications);
 * });
 * 
 * // Stop polling
 * notificationPoller.stop();
 */

class NotificationPoller {
  constructor() {
    this.intervalId = null;
    this.token = null;
    this.callback = null;
    this.errorCallback = null;
    this.isPolling = false;
    this.isFetching = false;
    this.pollingInterval = 40000; // 10 seconds in milliseconds
  }

  /**
   * Start polling for notifications
   * @param {string} token - Authentication token
   * @param {function} onSuccess - Callback function to handle successful response
   * @param {function} onError - Optional callback function to handle errors
   */
  start(token, onSuccess, onError = null) {
    // Strong guard against duplicate starts
    if (this.isPolling) {
      console.warn('Notification polling is already running. Ignoring duplicate start request.');
      // Update callback if provided
      if (typeof onSuccess === 'function') {
        this.callback = onSuccess;
      }
      if (onError) {
        this.errorCallback = onError;
      }
      return;
    }

    if (!token) {
      console.error('Token is required to start notification polling');
      return;
    }

    if (typeof onSuccess !== 'function') {
      console.error('onSuccess callback must be a function');
      return;
    }

    this.token = token;
    this.callback = onSuccess;
    this.errorCallback = onError;
    this.isPolling = true;

    // Fetch notifications immediately on start
    this.fetchNotifications();

    // Set up interval to fetch notifications every 10 seconds
    this.intervalId = setInterval(() => {
      this.fetchNotifications();
    }, this.pollingInterval);

    console.log('Notification polling started (every 10 seconds)');
  }

  /**
   * Stop polling for notifications
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isPolling = false;
    this.isFetching = false;
    this.token = null;
    this.callback = null;
    this.errorCallback = null;

    console.log('Notification polling stopped');
  }

  /**
   * Fetch notifications from the API
   * @private
   */
  async fetchNotifications() {
    if (!this.token || !this.callback) {
      return;
    }

    // Prevent concurrent API calls
    if (this.isFetching) {
      console.log('Already fetching notifications, skipping...');
      return;
    }

    try {
      this.isFetching = true;
      const response = await getTopNotifications(this.token);

      console.log('Raw API Response:', response);
      console.log('Response Data:', response.data);
      console.log('Notifications Array:', response.data?.notifications);

      if (response.status === 1 && response.data) {
        // Call the success callback with the notification data
        const callbackData = {
          unread: response.data.unread || 0,
          notifications: response.data.notifications || [],
          total: response.total || 0,
          message: response.message
        };
        
        console.log('Sending to callback:', callbackData);
        this.callback(callbackData);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Call the error callback if provided
      if (this.errorCallback && typeof this.errorCallback === 'function') {
        this.errorCallback(error);
      }
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Update the polling interval
   * @param {number} intervalMs - New interval in milliseconds
   */
  updateInterval(intervalMs) {
    if (intervalMs < 1000) {
      console.warn('Polling interval should be at least 1 second');
      return;
    }

    this.pollingInterval = intervalMs;

    // Restart polling if it's currently active
    if (this.isPolling) {
      const currentToken = this.token;
      const currentCallback = this.callback;
      const currentErrorCallback = this.errorCallback;

      this.stop();
      this.start(currentToken, currentCallback, currentErrorCallback);
    }

    console.log(`Polling interval updated to ${intervalMs}ms`);
  }

  /**
   * Check if polling is currently active
   * @returns {boolean}
   */
  isActive() {
    return this.isPolling;
  }

  /**
   * Manually trigger a notification fetch (without waiting for the interval)
   */
  async fetch() {
    await this.fetchNotifications();
  }
}

// Create a singleton instance
const notificationPoller = new NotificationPoller();

// Export the singleton instance
export { notificationPoller };

// Export the class for creating custom instances if needed
export default NotificationPoller;

