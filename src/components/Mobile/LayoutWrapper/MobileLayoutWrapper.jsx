import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MobileTopNavbar from '../Navbar/MobileTopNavbar';
import MobileBottomNavigation from '../BottomNavigation/MobileBottomNavigation';

// Import all mobile pages
import Dashboard from '../Pages/Dashboard';
import Orders from '../Pages/Orders';
import Categories from '../Pages/Categories';
import AddProduct from '../Pages/Products/AddProduct';
import EditProduct from '../Pages/Products/EditProduct';
import ManageProducts from '../Pages/Products/ManageProducts';
import ViewProduct from '../Pages/Products/ViewProduct';
import ProductRating from '../Pages/Products/ProductRating';
import Units from '../Pages/Products/Units';
import Taxes from '../Pages/Products/Taxes';
import Brands from '../Pages/Products/Brands';
import PacketProducts from '../Pages/Products/PacketProducts';
import LooseProducts from '../Pages/Products/LooseProducts';
import SoldOutProducts from '../Pages/Products/SoldOutProducts';
import LowStockProducts from '../Pages/Products/LowStockProducts';
import AllProducts from '../Pages/stock-management/AllProducts';
import AvailableProducts from '../Pages/stock-management/AvailableProducts';
import StockManagement from '../Pages/StockManagement';
import WithdrawalRequests from '../Pages/WithdrawalRequests';
import TotalBalance from '../Pages/withdraw-request/TotalBalance';
import PendingRequests from '../Pages/withdraw-request/PendingRequests';
import ApprovedRequests from '../Pages/withdraw-request/ApprovedRequests';
import TotalRequests from '../Pages/withdraw-request/TotalRequests';
import WalletTransactions from '../Pages/WalletTransactions';
import WalletTotalBalance from '../Pages/wallet-transaction/TotalBalance';
import ThisMonthTransaction from '../Pages/wallet-transaction/ThisMonthTransaction';
import WithdrawnTransaction from '../Pages/wallet-transaction/WithdrawnTransaction';
import ProductSalesReport from '../Pages/Reports/ProductSalesReport';
import SalesReports from '../Pages/Reports/SalesReports';
import Registration from '../Pages/Registration/Registration';
import MyProfile from '../Pages/MyProfile/MyProfile';
import Settings from '../Pages/Settings/Settings';
import ViewOrderDetails from '../Pages/ViewOrderDetails';
import GenerateInvoice from '../Pages/Invoices/GenerateInvoice';
import MobileProfileMenu from '../Profile/MobileProfileMenu';
import RaiseTicket from '../Pages/RaiseTicket/RaiseTicket';

const MobileLayoutWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeItem, setActiveItem] = useState('dashboard');



  // Update activeItem and activeTab based on current path
  useEffect(() => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        setActiveItem('dashboard');
        setActiveTab('dashboard');
        break;
      case '/orders':
        setActiveItem('orders');
        setActiveTab('orders');
        break;
      case '/products':
      case '/products/add':
        setActiveItem('add-product');
        setActiveTab('products');
        break;
      case '/products/edit':
        setActiveItem('edit-product');
        setActiveTab('products');
        break;
      case '/products/manage':
        setActiveItem('manage-products');
        setActiveTab('products');
        break;
      case '/products/ratings':
        setActiveItem('product-ratings');
        setActiveTab('products');
        break;
      case '/products/units':
        setActiveItem('units');
        setActiveTab('more');
        break;
      case '/products/taxes':
        setActiveItem('taxes');
        setActiveTab('more');
        break;
      case '/products/brands':
        setActiveItem('brands');
        setActiveTab('more');
        break;
      case '/products/packet':
        setActiveItem('packet-products');
        setActiveTab('products');
        break;
      case '/products/loose':
        setActiveItem('loose-products');
        setActiveTab('products');
        break;
      case '/products/sold-out':
        setActiveItem('sold-out-products');
        setActiveTab('products');
        break;
      case '/products/low-stock':
        setActiveItem('low-stock-products');
        setActiveTab('products');
        break;
      case '/products/all-products':
        setActiveItem('all-products');
        setActiveTab('stock');
        break;
      case '/products/available-products':
        setActiveItem('available-products');
        setActiveTab('stock');
        break;
      case '/categories':
        setActiveItem('categories');
        setActiveTab('more');
        break;
      case '/stock':
        setActiveItem('stock');
        setActiveTab('stock');
        break;
      case '/withdrawal':
        setActiveItem('withdrawal');
        setActiveTab('more');
        break;
      case '/withdrawal/total-balance':
        setActiveItem('total-balance');
        setActiveTab('more');
        break;
      case '/withdrawal/pending-requests':
        setActiveItem('pending-requests');
        setActiveTab('more');
        break;
      case '/withdrawal/approved-requests':
        setActiveItem('approved-requests');
        setActiveTab('more');
        break;
      case '/withdrawal/total-requests':
        setActiveItem('total-requests');
        setActiveTab('more');
        break;
      case '/wallet':
        setActiveItem('wallet');
        setActiveTab('more');
        break;
      case '/wallet/total-balance':
        setActiveItem('wallet-total-balance');
        setActiveTab('more');
        break;
      case '/wallet/this-month':
        setActiveItem('wallet-this-month');
        setActiveTab('more');
        break;
      case '/wallet/withdrawn':
        setActiveItem('wallet-withdrawn');
        setActiveTab('more');
        break;
      case '/reports/product-sales':
        setActiveItem('product-sales-report');
        setActiveTab('more');
        break;
      case '/reports/sales':
        setActiveItem('sales-reports');
        setActiveTab('more');
        break;
      case '/registration':
        setActiveItem('registration');
        setActiveTab('more');
        break;
      case '/my-profile':
        setActiveItem('my-profile');
        setActiveTab('more');
        break;
      case '/settings':
        setActiveItem('settings');
        setActiveTab('more');
        break;
      case '/raise-ticket':
        setActiveItem('raise-ticket');
        setActiveTab('more');
        break;
      case '/account':
        setActiveItem('account');
        setActiveTab('account');
        break;
      case '/orders/view':
        setActiveItem('view-order');
        setActiveTab('orders');
        break;
      case '/invoices/generate':
        setActiveItem('generate-invoice');
        setActiveTab('orders');
        break;
      default:
        if (path.startsWith('/products/view/')) {
          setActiveItem('view-product');
          setActiveTab('products');
        } else if (path.startsWith('/products/edit/')) {
          setActiveItem('edit-product');
          setActiveTab('products');
        } else {
          setActiveItem('dashboard');
          setActiveTab('dashboard');
        }
    }
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Navigate based on tab
    switch (tabId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'orders':
        navigate('/orders');
        break;
      case 'products':
        navigate('/products/manage');
        setActiveItem('manage-products');
        break;
      case 'stock':
        navigate('/stock');
        break;
      case 'account':
        navigate('/account');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleProfileMenuItemChange = (itemId) => {
    setActiveItem(itemId);
    
    // Navigate based on item
    switch (itemId) {
      case 'dashboard':
        setActiveTab('dashboard');
        navigate('/dashboard');
        break;
      case 'orders':
        setActiveTab('orders');
        navigate('/orders');
        break;
      case 'add-product':
        setActiveTab('products');
        navigate('/products/add');
        break;
      case 'manage-products':
        setActiveTab('products');
        navigate('/products/manage');
        break;
      case 'units':
        navigate('/products/units');
        break;
      case 'taxes':
        navigate('/products/taxes');
        break;
      case 'brands':
        navigate('/products/brands');
        break;
      case 'packet-products':
        setActiveTab('products');
        navigate('/products/packet');
        break;
      case 'loose-products':
        setActiveTab('products');
        navigate('/products/loose');
        break;
      case 'sold-out-products':
        setActiveTab('products');
        navigate('/products/sold-out');
        break;
      case 'low-stock-products':
        setActiveTab('products');
        navigate('/products/low-stock');
        break;
      case 'categories':
        navigate('/categories');
        break;
      case 'stock':
        setActiveTab('stock');
        navigate('/stock');
        break;
      case 'withdrawal':
        navigate('/withdrawal');
        break;
      case 'wallet':
        navigate('/wallet');
        break;
      case 'product-sales-report':
        navigate('/reports/product-sales');
        break;
      case 'sales-reports':
        navigate('/reports/sales');
        break;
      case 'registration':
        navigate('/registration');
        break;
      case 'my-profile':
        navigate('/my-profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'raise-ticket':
        navigate('/raise-ticket');
        break;
      default:
        setActiveTab('dashboard');
        navigate('/dashboard');
    }
  };

  const handleProfileMenuClose = () => {
    // Only navigate to dashboard if we're currently on the account page
    // and no menu item was clicked
    if (activeItem === 'account') {
      navigate('/dashboard');
    }
  };

  // Render content based on active item
  const renderContent = () => {
    switch (activeItem) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <Orders />;
      case 'products':
      case 'add-product':
        return <AddProduct />;
      case 'edit-product':
        return <EditProduct />;
      case 'manage-products':
        return <ManageProducts />;
      case 'product-ratings':
        return <ProductRating />;
      case 'view-product':
        return <ViewProduct />;
      case 'units':
        return <Units />;
      case 'taxes':
        return <Taxes />;
      case 'brands':
        return <Brands />;
      case 'packet-products':
        return <PacketProducts />;
      case 'loose-products':
        return <LooseProducts />;
      case 'sold-out-products':
        return <SoldOutProducts />;
      case 'low-stock-products':
        return <LowStockProducts />;
      case 'all-products':
        return <AllProducts />;
      case 'available-products':
        return <AvailableProducts />;
      case 'stock':
        return <StockManagement />;
      case 'withdrawal':
        return <WithdrawalRequests />;
      case 'total-balance':
        return <TotalBalance />;
      case 'pending-requests':
        return <PendingRequests />;
      case 'approved-requests':
        return <ApprovedRequests />;
      case 'total-requests':
        return <TotalRequests />;
      case 'wallet':
        return <WalletTransactions />;
      case 'wallet-total-balance':
        return <WalletTotalBalance />;
      case 'wallet-this-month':
        return <ThisMonthTransaction />;
      case 'wallet-withdrawn':
        return <WithdrawnTransaction />;
      case 'categories':
        return <Categories />;
      case 'product-sales-report':
        return <ProductSalesReport />;
      case 'sales-reports':
        return <SalesReports />;
      case 'registration':
        return <Registration />;
      case 'my-profile':
        return <MyProfile />;
      case 'settings':
        return <Settings />;
      case 'raise-ticket':
        return <RaiseTicket />;
      case 'account':
        return <MobileProfileMenu 
          activeItem={activeItem}
          setActiveItem={handleProfileMenuItemChange}
          isOpen={true}
          onClose={handleProfileMenuClose}
        />;
      case 'view-order':
        return <ViewOrderDetails />;
      case 'generate-invoice':
        return <GenerateInvoice />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <MobileTopNavbar />
      
      {/* Main Content */}
      <main className="pt-16 pb-20 px-0 min-h-screen">
        {renderContent()}
      </main>
      
      {/* Bottom Navigation */}
      <MobileBottomNavigation 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        activeItem={activeItem}
        setActiveItem={handleProfileMenuItemChange}
      />
      
    </div>
  );
};

export default MobileLayoutWrapper;