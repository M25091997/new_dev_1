import React, { useState } from 'react';
import {
  Clock,
  ShoppingCart,
  Target,
  Package,
  Archive,
  CreditCard,
  Wallet,
  Folder,
  ChevronDown,
  ChevronRight,
  X,
  Menu,
  ChevronLeft,
  User,
  MessageSquare
} from 'lucide-react';
import BringmartLogo from "../../../assets/BringmartLogo.png"


const SideBar = ({ activeItem, setActiveItem, isOpen, onClose, isCollapsed, onToggleCollapse, onToggleSidebar }) => {
  const [expandedItems, setExpandedItems] = useState([]);

  const menuItems = [
    { id: 'dashboard', icon: Clock, label: 'Dashboard' },
    { id: 'orders', icon: ShoppingCart, label: 'Orders' },
    { id: 'categories', icon: Target, label: 'Categories' },
    {
      id: 'products',
      icon: Package,
      label: 'Products',
      hasSubmenu: true,
      submenu: [
        { id: 'add-product', label: 'Add Product' },
        { id: 'manage-products', label: 'Manage Products' },
        { id: 'units', label: 'Units' },
        { id: 'taxes', label: 'Taxes' },
        { id: 'brands', label: 'Brands' }
      ]
    },
    { id: 'stock', icon: Archive, label: 'Stock Management' },
    { id: 'withdrawal', icon: CreditCard, label: 'Withdrawal Requests' },
    { id: 'wallet', icon: Wallet, label: 'Wallet Transactions' },
    { id: 'my-profile', icon: User, label: 'My Profile' },
    { id: 'raise-ticket', icon: MessageSquare, label: 'Raise Ticket' },
    {
      id: 'reports',
      icon: Folder,
      label: 'Reports',
      hasSubmenu: true,
      submenu: [
        { id: 'product-sales-report', label: 'Product Sales Report' },
        { id: 'sales-reports', label: 'Sales Reports' }
      ]
    }
  ];

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <>
      {/* Overlay for mobile and tablet (up to 768px) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Dark Theme */}
      <div className={`fixed left-0 top-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 h-screen flex flex-col z-50 transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'w-16' : 'w-64'} ${!isCollapsed ? 'shadow-2xl shadow-black/50' : 'shadow-xl shadow-black/30'
        }`}>
        {/* Header with Logo, Toggle button and close button */}
        <div className={`relative flex items-center justify-center p-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'
          }`}>
          {/* Centered Logo */}
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="flex items-center justify-center hover:bg-slate-800/70 rounded-lg p-2 transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Collapse sidebar"
            >
              <img
                src={BringmartLogo}
                alt="Bringmart Logo"
                className="w-28 h-12 rounded-lg object-cover transition-all duration-300 hover:shadow-lg"
              />
            </button>
          )}
          {isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="w-12 h-12 rounded-lg flex items-center justify-center hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 active:scale-95 p-1"
              aria-label="Expand sidebar"
            >
              <img
                src={BringmartLogo}
                alt="Bringmart"
                className="w-10 h-6 rounded-lg object-cover"
              />
            </button>
          )}

          {/* Toggle buttons positioned absolutely on the right - only show when not collapsed */}
          {!isCollapsed && (
            <div className="absolute right-4 flex items-center space-x-2">
              {/* Toggle sidebar button */}
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-300 hover:scale-110 active:scale-95 group"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors duration-300" />
              </button>

              {/* Close button for mobile */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-red-500/20 transition-all duration-300 hover:scale-110 active:scale-95 md:hidden group"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-slate-300 group-hover:text-red-400 transition-colors duration-300" />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable sidebar content */}
        <div className="flex-1 py-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className={`space-y-2 ${isCollapsed ? 'px-2' : 'px-3'}`}>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeItem === item.id;
              const isExpanded = expandedItems.includes(item.id);

              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => {
                      if (item.hasSubmenu && !isCollapsed) {
                        toggleExpanded(item.id);
                      } else {
                        setActiveItem(item.id);
                      }
                    }}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-4 py-3'} text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                        ? 'text-white shadow-lg shadow-cyan-500/50'
                        : 'text-slate-300 hover:text-white hover:shadow-md'
                      }`}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                        : 'transparent'
                    }}
                    title={isCollapsed ? item.label : ''}
                  >
                    {/* Hover effect background */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-700/0 via-slate-700/50 to-slate-700/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}

                    <div className={`flex items-center transition-all duration-300 relative z-10 ${isCollapsed ? '' : 'space-x-3'}`}>
                      <IconComponent className={`w-5 h-5 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      {!isCollapsed && (
                        <span className="transition-all duration-300 opacity-100 font-medium">{item.label}</span>
                      )}
                    </div>
                    {item.hasSubmenu && !isCollapsed && (
                      <div className={`transition-all duration-300 relative z-10 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    )}

                    {/* Active indicator */}
                    {isActive && !isCollapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg shadow-white/50" />
                    )}
                  </button>

                  {/* Submenu items - only show when not collapsed */}
                  {item.hasSubmenu && !isCollapsed && (
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
                        }`}
                    >
                      <div className="ml-4 pl-4 space-y-1 border-l-2 border-slate-700/50">
                        {item.submenu.map((subItem, index) => {
                          const isSubActive = activeItem === subItem.id;
                          return (
                            <button
                              key={subItem.id}
                              onClick={() => setActiveItem(subItem.id)}
                              className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-300 group relative overflow-hidden ${isSubActive
                                  ? 'text-cyan-400 bg-slate-800/80 shadow-md shadow-cyan-500/20'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }`}
                              style={{
                                transitionDelay: isExpanded ? `${index * 50}ms` : '0ms'
                              }}
                            >
                              {/* Submenu item indicator */}
                              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-300 ${isSubActive
                                  ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50'
                                  : 'bg-slate-600 group-hover:bg-slate-500'
                                }`} />
                              <span className="ml-4 transition-all duration-300 font-medium">{subItem.label}</span>

                              {/* Hover background effect */}
                              {!isSubActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom gradient decoration */}
        <div className="h-20 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent pointer-events-none" />
      </div>
    </>
  );
};

export default SideBar;