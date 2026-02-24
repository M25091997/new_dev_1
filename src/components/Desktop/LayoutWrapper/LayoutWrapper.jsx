import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopNavbar from '../Navbar/TopNavbar';
import SideBar from '../Sidebar/SideBar';

// Import all desktop pages
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
import Registration from '../Pages/Registration';
import MyProfile from '../Pages/MyProfile/MyProfile';
import Settings from '../Pages/Settings/Settings';
import ViewOrderDetails from '../Pages/ViewOrderDetails';
import GenerateInvoice from '../Pages/Invoices/GenerateInvoice';
import RaiseTicket from '../Pages/RaiseTicket/RaiseTicket';

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    // On desktop, toggle between collapsed and expanded
    if (window.innerWidth >= 768) {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    } else {
      // On mobile, toggle visibility
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Update activeItem based on current path
  useEffect(() => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        setActiveItem('dashboard');
        break;
      case '/orders':
        setActiveItem('orders');
        break;
      case '/categories':
        setActiveItem('categories');
        break;
      case '/products/add':
        setActiveItem('add-product');
        break;
      case '/products/edit':
        setActiveItem('edit-product');
        break;
      case '/products/manage':
        setActiveItem('manage-products');
        break;
      case '/products/ratings':
        setActiveItem('product-ratings');
        break;
      case '/products/units':
        setActiveItem('units');
        break;
      case '/products/taxes':
        setActiveItem('taxes');
        break;
      case '/products/brands':
        setActiveItem('brands');
        break;
      case '/products/packet':
        setActiveItem('packet-products');
        break;
      case '/products/loose':
        setActiveItem('loose-products');
        break;
      case '/products/sold-out':
        setActiveItem('sold-out-products');
        break;
      case '/products/low-stock':
        setActiveItem('low-stock-products');
        break;
      case '/products/all-products':
        setActiveItem('all-products');
        break;
      case '/products/available-products':
        setActiveItem('available-products');
        break;
      case '/stock':
        setActiveItem('stock');
        break;
      case '/withdrawal':
        setActiveItem('withdrawal');
        break;
      case '/withdrawal/total-balance':
        setActiveItem('total-balance');
        break;
      case '/withdrawal/pending-requests':
        setActiveItem('pending-requests');
        break;
      case '/withdrawal/approved-requests':
        setActiveItem('approved-requests');
        break;
      case '/withdrawal/total-requests':
        setActiveItem('total-requests');
        break;
      case '/wallet':
        setActiveItem('wallet');
        break;
      case '/wallet/total-balance':
        setActiveItem('wallet-total-balance');
        break;
      case '/wallet/this-month':
        setActiveItem('wallet-this-month');
        break;
      case '/wallet/withdrawn':
        setActiveItem('wallet-withdrawn');
        break;
      case '/reports/product-sales':
        setActiveItem('product-sales-report');
        break;
      case '/reports/sales':
        setActiveItem('sales-reports');
        break;
      case '/registration':
        setActiveItem('registration');
        break;
      case '/my-profile':
        setActiveItem('my-profile');
        break;
      case '/settings':
        setActiveItem('settings');
        break;
      case '/raise-ticket':
        setActiveItem('raise-ticket');
        break;
      case '/orders/view':
        setActiveItem('view-order');
        break;
      case '/invoices/generate':
        setActiveItem('generate-invoice');
        break;
      default:
        if (path.startsWith('/products/view/')) {
          setActiveItem('view-product');
        } else if (path.startsWith('/products/edit/')) {
          setActiveItem('edit-product');
        } else {
          setActiveItem('dashboard');
        }
    }
  }, [location.pathname]);

  // Handle navigation
  const handleNavigation = (itemId) => {
    if (!itemId) return;
    
    setActiveItem(itemId);
    
    switch (itemId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'orders':
        navigate('/orders');
        break;
      case 'categories':
        navigate('/categories');
        break;
      case 'add-product':
        navigate('/products/add');
        break;
      case 'manage-products':
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
        navigate('/products/packet');
        break;
      case 'loose-products':
        navigate('/products/loose');
        break;
      case 'stock':
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
        navigate('/raise-ticket', { replace: false });
        return;
      case 'view-order':
        navigate('/orders/view');
        break;
      default:
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
      case 'categories':
        return <Categories />;
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
      case 'view-order':
        return <ViewOrderDetails />;
      case 'generate-invoice':
        return <GenerateInvoice />;
      default:
        return <Dashboard />;
    }
  };

  // Handle window resize to manage sidebar state on desktop/mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set sidebar open by default on desktop
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      <div className="md:hidden">
        <SideBar
          activeItem={activeItem}
          setActiveItem={handleNavigation}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isCollapsed={false}
          onToggleCollapse={() => { }}
          onToggleSidebar={toggleSidebar}
        />
      </div>

      {/* Fixed Sidebar for Desktop */}
      <div className="hidden md:block fixed left-0 top-0 z-40">
        <SideBar
          activeItem={activeItem}
          setActiveItem={handleNavigation}
          isOpen={true}
          onClose={closeSidebar}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          onToggleSidebar={toggleSidebar}
        />
      </div>

      {/* Main Content Area with proper margin for sidebar */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}>
        {/* Fixed Top Navbar */}
        <TopNavbar isCollapsed={isSidebarCollapsed} />

        {/* Scrollable Content with padding for fixed navbar */}
        <main className="flex-1 overflow-y-auto bg-gray-50 pt-14">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default LayoutWrapper;