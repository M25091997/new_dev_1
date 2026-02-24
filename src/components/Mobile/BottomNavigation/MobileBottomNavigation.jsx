import React from 'react';
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Archive, 
  CircleUserRound
} from 'lucide-react';

const MobileBottomNavigation = ({ activeTab, setActiveTab, activeItem, setActiveItem }) => {
  const tabs = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'orders', icon: ShoppingCart, label: 'Orders' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'stock', icon: Archive, label: 'Stock' },
    { id: 'account', icon: CircleUserRound , label: 'Account' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-2 min-w-0 flex-1 transition-colors ${
                  isActive 
                    ? 'text-purple-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <IconComponent className={`w-5 h-5 mb-1 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-medium text-center leading-tight ${
                  isActive ? 'text-purple-600' : 'text-gray-500'
                }`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 bg-purple-600 rounded-full mt-1"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
  );
};

export default MobileBottomNavigation;
