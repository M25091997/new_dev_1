import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  User,
  ChevronRight,
  X,
  CreditCard,
  Wallet,
  MessageSquare
} from 'lucide-react';

const MyAccount = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('categories');

  const menuItems = [
    { id: 'categories', icon: List, label: 'Categories', hasArrow: true },
    { id: 'reports', icon: BarChart3, label: 'Reports', hasArrow: true },
    { id: 'withdrawal', icon: CreditCard, label: 'Withdrawal Requests', hasArrow: true },
    { id: 'wallet', icon: Wallet, label: 'Wallet Transactions', hasArrow: true },
    { id: 'settings', icon: Settings, label: 'Settings', hasArrow: true },
    { id: 'raise-ticket', icon: MessageSquare, label: 'Raise Ticket', hasArrow: true },
    { id: 'help', icon: HelpCircle, label: 'Help & Support', hasArrow: true },
    { id: 'logout', icon: LogOut, label: 'Logout', hasArrow: false, isDestructive: true }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Account Menu */}
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Goutam Shaw</h2>
              <p className="text-sm text-gray-500">Seller Account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close account menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 py-4">
          <nav className="px-4 space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItem(item.id);
                    if (item.id === 'logout') {
                      // Handle logout logic here
                      console.log('Logout clicked');
                    } else if (item.id === 'raise-ticket') {
                      navigate('/raise-ticket');
                      onClose();
                    } else if (item.id === 'categories') {
                      navigate('/categories');
                      onClose();
                    } else if (item.id === 'reports') {
                      navigate('/reports/product-sales');
                      onClose();
                    } else if (item.id === 'withdrawal') {
                      navigate('/withdrawal');
                      onClose();
                    } else if (item.id === 'wallet') {
                      navigate('/wallet');
                      onClose();
                    } else if (item.id === 'settings') {
                      navigate('/settings');
                      onClose();
                    } else if (item.id === 'help') {
                      // Handle help navigation if needed
                      console.log('Help clicked');
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                      ? 'bg-blue-50 text-blue-600'
                      : item.isDestructive
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`w-5 h-5 ${isActive
                        ? 'text-blue-600'
                        : item.isDestructive
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`} />
                    <span>{item.label}</span>
                  </div>
                  {item.hasArrow && (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">Bringmart Seller App</p>
            <p className="text-xs text-gray-400">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyAccount;
