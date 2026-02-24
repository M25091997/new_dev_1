import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Save, 
  ArrowLeft, 
  Mail, 
  MessageSquare,
  User,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '../../../../contexts/ToastContext';
import { getOrderStatuses, getSellerMailAndSmsSettings, saveSellerMailAndSmsSettings, changePassword } from '../../../../api/api';

const Settings = () => {
  const [orderMailSettings, setOrderMailSettings] = useState({});
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [mailSettings, setMailSettings] = useState([]);

  const [userCredentials, setUserCredentials] = useState({
    username: '',
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    password: false,
    confirmPassword: false
  });

  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const { showError, showSuccess } = useToast();
  const { user, token } = useSelector((state) => state.user);

  useEffect(() => {
    if (user) {
      setUserCredentials(prev => ({
        ...prev,
        username: user.name || user.username || ''
      }));
    }
  }, [user]);

  // Fetch order statuses and mail settings
  useEffect(() => {
    const fetchSettingsData = async () => {
      if (!token) return;
      
      try {
        setSettingsLoading(true);
        
        // Fetch order statuses
        const orderStatusesResponse = await getOrderStatuses(token);
        if (orderStatusesResponse.status === 1) {
          setOrderStatuses(orderStatusesResponse.data || []);
        }

        // Fetch mail settings
        const mailSettingsResponse = await getSellerMailAndSmsSettings(token);
        if (mailSettingsResponse.status === 1) {
          setMailSettings(mailSettingsResponse.data || []);
          
          // Map mail settings to order statuses
          const settingsMap = {};
          mailSettingsResponse.data?.forEach(setting => {
            const statusId = setting.order_status_id;
            settingsMap[statusId] = {
              mail: setting.mail_status === 1,
              sms: setting.sms_status === 1
            };
          });
          setOrderMailSettings(settingsMap);
        }
      } catch (error) {
        console.error('Error fetching settings data:', error);
        showError('Error', 'Failed to load settings data');
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettingsData();
  }, [token, showError]);

  const handleToggleSetting = (statusId, type) => {
    setOrderMailSettings(prev => ({
      ...prev,
      [statusId]: {
        ...prev[statusId],
        [type]: !prev[statusId][type]
      }
    }));
  };

  const handleInputChange = (field, value) => {
    setUserCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveMailSettings = async () => {
    try {
      setLoading(true);
      
      // Prepare settings data for API
      const settingsData = mailSettings.map(setting => ({
        status_id: setting.order_status_id,
        mail_status: orderMailSettings[setting.order_status_id]?.mail || false,
        mobile_status: false, // Not used in current implementation
        sms_status: orderMailSettings[setting.order_status_id]?.sms || false
      }));

      console.log('Saving mail settings:', settingsData);
      
      const response = await saveSellerMailAndSmsSettings(token, settingsData);
      
      if (response.status === 1) {
        showSuccess('Success', response.message || 'Mail settings saved successfully!');
      } else {
        throw new Error(response.message || 'Failed to save mail settings');
      }
    } catch (error) {
      console.error('Error saving mail settings:', error);
      showError('Error', error.message || 'Failed to save mail settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredentials = async () => {
    try {
      setLoading(true);
      
      // Validation
      if (!userCredentials.currentPassword) {
        showError('Error', 'Current password is required');
        return;
      }
      
      if (!userCredentials.password) {
        showError('Error', 'New password is required');
        return;
      }
      
      if (userCredentials.password !== userCredentials.confirmPassword) {
        showError('Error', 'Passwords do not match');
        return;
      }
      
      if (userCredentials.password.length < 6) {
        showError('Error', 'Password must be at least 6 characters long');
        return;
      }

      // Prepare password data for API
      const passwordData = {
        username: userCredentials.username,
        current_password: userCredentials.currentPassword,
        password: userCredentials.password,
        confirm_password: userCredentials.confirmPassword
      };

      console.log('Saving credentials:', passwordData);
      
      const response = await changePassword(token, passwordData);
      
      if (response.status === 1) {
        showSuccess('Success', response.message || 'Username & Password Changed Successfully!');
        
        // Reset password fields
        setUserCredentials(prev => ({
          ...prev,
          currentPassword: '',
          password: '',
          confirmPassword: ''
        }));
      } else {
        throw new Error(response.message || 'Failed to update credentials');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      showError('Error', error.message || 'Failed to update credentials');
    } finally {
      setLoading(false);
    }
  };

  // Get order status name by ID
  const getOrderStatusName = (statusId) => {
    const status = orderStatuses.find(s => s.id === statusId);
    return status ? status.status : `Status ${statusId}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      </div>

      {/* Settings Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Mail Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Order Mail Settings</h2>
          
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-200">
              <div className="font-semibold text-gray-700">Order Status</div>
              <div className="font-semibold text-gray-700 text-center">Mail</div>
              <div className="font-semibold text-gray-700 text-center">SMS</div>
            </div>

            {/* Order Status Rows */}
            {settingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : (
              mailSettings.map((setting) => (
                <div key={setting.id} className="grid grid-cols-3 gap-4 items-center py-3">
                  <div className="text-sm font-medium text-gray-700">
                    {getOrderStatusName(setting.order_status_id)}
                  </div>
                  
                  {/* Mail Toggle */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleToggleSetting(setting.order_status_id, 'mail')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                        orderMailSettings[setting.order_status_id]?.mail
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          orderMailSettings[setting.order_status_id]?.mail
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* SMS Toggle */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleToggleSetting(setting.order_status_id, 'sms')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                        orderMailSettings[setting.order_status_id]?.sms
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          orderMailSettings[setting.order_status_id]?.sms
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSaveMailSettings}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Change Username & Password */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Change Username & Password</h2>
          
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={userCredentials.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Username"
                />
              </div>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPasswords.currentPassword ? 'text' : 'password'}
                  value={userCredentials.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Current Password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('currentPassword')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.currentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPasswords.password ? 'text' : 'password'}
                  value={userCredentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPasswords.confirmPassword ? 'text' : 'password'}
                  value={userCredentials.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSaveCredentials}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
