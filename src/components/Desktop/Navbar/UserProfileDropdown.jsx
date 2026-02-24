import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { logoutUser } from '../../../redux/thunk/authThunk';
import { useToast } from '../../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

const UserProfileDropdown = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      dispatch(logoutUser());
      showSuccess('Logged Out', 'You have been successfully logged out.');
      setIsOpen(false);
    } catch (error) {
      showError('Logout Error', 'Failed to logout. Please try again.');
    }
  };

  const handleProfileClick = () => {
    navigate('/my-profile');
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsOpen(false);
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {/* {getUserInitials(user?.username || user?.name)} */}
            <img src={user?.seller?.profile_image_url} alt="Seller Avatar" className="h-12 w-12 rounded-full" />
          </span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-800">
            {user?.username || user?.name || 'User'}
          </span>
          <span className="text-xs text-gray-500">Seller</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* My Profile */}
          <button
            onClick={handleProfileClick}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
          >
            <User className="w-4 h-4 text-gray-500" />
            <span>My Profile</span>
          </button>

          {/* Settings */}
          <button
            onClick={handleSettingsClick}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
          >
            <Settings className="w-4 h-4 text-gray-500" />
            <span>Settings</span>
          </button>

          {/* Divider */}
          <div className="border-t border-gray-200 my-1"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
