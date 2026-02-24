import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ToastProvider, useToast } from "./contexts/ToastContext";
import LayoutWrapper from "./components/Desktop/LayoutWrapper/LayoutWrapper";
import MobileLayoutWrapper from "./components/Mobile/LayoutWrapper/MobileLayoutWrapper";
import DesktopLogin from "./components/Desktop/Pages/Auth/Login";
import MobileLogin from "./components/Mobile/Pages/Auth/Login";
import DesktopRegistration from "./components/Desktop/Pages/Registration";
import MobileRegistration from "./components/Mobile/Pages/Registration/Registration";
import DesktopRegistrationSuccess from "./components/Desktop/Pages/RegistrationSuccess";
import MobileRegistrationSuccess from "./components/Mobile/Pages/RegistrationSuccess";
import DesktopToastContainer from "./components/Desktop/AlertMessages/ToastContainer";
import MobileToastContainer from "./components/Mobile/AlertMessages/ToastContainer";
import DesktopMyProfile from './components/Desktop/Pages/MyProfile/MyProfile'
import MobileMyProfile from "./components/Mobile/Pages/MyProfile/MyProfile";

// Toast Display Component
const ToastDisplay = ({ isMobile }) => {
  const { toasts, removeToast } = useToast();
  
  if (isMobile) {
    return <MobileToastContainer toasts={toasts} onClose={removeToast} />;
  }
  return <DesktopToastContainer toasts={toasts} onClose={removeToast} />;
};

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.user);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Public Route Component (redirect to dashboard if already authenticated)
  const PublicRoute = ({ children }) => {
    if (isAuthenticated && user) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // Special route for registration success (allows both authenticated and non-authenticated users)
  const RegistrationSuccessRoute = ({ children }) => {
    return children;
  };

  return (
    <ToastProvider>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={
          <PublicRoute>
            {isMobile ? <MobileLogin /> : <DesktopLogin />}
          </PublicRoute>
        } />
        <Route path="/registration" element={
          <PublicRoute>
            {isMobile ? <MobileRegistration /> : <DesktopRegistration />}
          </PublicRoute>
        } />
        <Route path="/registration-success" element={
          <RegistrationSuccessRoute>
            {isMobile ? <MobileRegistrationSuccess /> : <DesktopRegistrationSuccess />}
          </RegistrationSuccessRoute>
        } />
        
        {/* Dashboard and App Routes - Protected */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        
        {/* All other routes */}
        <Route path="/my-profile" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/raise-ticket" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/orders/view" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/invoices/generate" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/products/add" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/products/edit/:productId" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/products/manage" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/products/view/:id" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/products/ratings" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/products/units" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/products/taxes" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/products/brands" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/products/packet" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/products/loose" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/products/sold-out" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/products/low-stock" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/products/all-products" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/products/available-products" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/stock" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/withdrawal" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/withdrawal/total-balance" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/withdrawal/pending-requests" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/withdrawal/approved-requests" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/withdrawal/total-requests" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/wallet/total-balance" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/wallet/this-month" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/wallet/withdrawn" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/reports/product-sales" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/reports/sales" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute>
            {isMobile ? <MobileLayoutWrapper /> : <LayoutWrapper />}
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      {/* Toast Display */}
      <ToastDisplay isMobile={isMobile} />
    </ToastProvider>
  );
}

export default App;
