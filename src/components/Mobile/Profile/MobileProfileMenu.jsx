import React from 'react';
import {
    Clock,
    ShoppingCart,
    Target,
    Package,
    Archive,
    CreditCard,
    Wallet,
    Folder,
    List,
    BarChart3,
    ChevronRight,
    X,
    User,
    Settings,
    MessageSquare
} from 'lucide-react';
import { useSelector } from 'react-redux';

const MobileProfileMenu = ({ activeItem, setActiveItem, isOpen, onClose }) => {
    const { user } = useSelector((state) => state.user);
    const menuItems = [
        { id: 'dashboard', icon: Clock, label: 'Dashboard' },
        { id: 'orders', icon: ShoppingCart, label: 'Orders' },
        { id: 'categories', icon: Target, label: 'Categories' },
        { id: 'add-product', icon: Package, label: 'Add Product' },
        { id: 'manage-products', icon: Package, label: 'Manage Products' },
        { id: 'units', icon: List, label: 'Units' },
        { id: 'taxes', icon: List, label: 'Taxes' },
        { id: 'brands', icon: List, label: 'Brands' },
        { id: 'stock', icon: Archive, label: 'Stock Management' },
        { id: 'withdrawal', icon: CreditCard, label: 'Withdrawal Requests' },
        { id: 'wallet', icon: Wallet, label: 'Wallet Transactions' },
        { id: 'raise-ticket', icon: MessageSquare, label: 'Raise Ticket' },
        { id: 'product-sales-report', icon: BarChart3, label: 'Product Sales Report' },
        { id: 'sales-reports', icon: Folder, label: 'Sales Reports' }
    ];

    const handleProfileClick = () => {
        setActiveItem('my-profile');
        navigate('/my-profile');
        onClose();
    };

    const handleSettingsClick = () => {
        setActiveItem('settings');
        navigate('/settings');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={onClose}
            />

            {/* Profile Menu - Full Width */}
            <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center">
                                <img src={user?.seller?.profile_image_url} alt="User Avatar" className="w-14 h-14 rounded-full" />
                            </div>
                            <div>
                                <h2 className="text-md font-semibold text-gray-800">
                                    Bringmart Seller
                                </h2>
                                <p className="text-xs text-gray-500">Seller Account</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Close profile menu"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Profile Actions Row */}
                    <div className="flex space-x-2">
                        <button
                            onClick={handleProfileClick}
                            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">My Profile</span>
                        </button>

                        <button
                            onClick={handleSettingsClick}
                            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            <span className="text-sm font-medium">Settings</span>
                        </button>
                    </div>
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
                                        // Don't call onClose() here - let the navigation handle it
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <IconComponent className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
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

export default MobileProfileMenu;