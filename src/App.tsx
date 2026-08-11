import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, Outlet, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Category } from './pages/Category';
import { Collection } from './pages/Collection';
import { ProductDetail } from './pages/ProductDetail';
import { StyleInspiration } from './pages/StyleInspiration';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { Checkout } from './pages/Checkout';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentFailed } from './pages/PaymentFailed';
import { PaymentResult } from './pages/PaymentResult';
import { Journal } from './pages/Journal';
import { JournalPost } from './pages/JournalPost';
import { Contact } from './pages/Contact';
import { ShippingAndPayment } from './pages/ShippingAndPayment';
import { Search } from './pages/Search';
import { Catalog } from './pages/Catalog';
import { DashboardOrders } from './pages/dashboard/DashboardOrders';
import { DashboardFavorites } from './pages/dashboard/DashboardFavorites';
import { DashboardCart } from './pages/dashboard/DashboardCart';
import { DashboardAddresses } from './pages/dashboard/DashboardAddresses';
import { DashboardOrderDetail } from './pages/dashboard/DashboardOrderDetail';

const RootRedirect = () => <Navigate to="/fa" replace />;

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  return null;
};

const ProtectedDashboard = () => {
  const { lang } = useParams<{ lang: string }>();
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to={`/${lang || 'fa'}/auth`} replace />;
  }
  return <Outlet />;
};

// Wrapper component to provide contexts inside Router
const AppContent = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            {/* Dashboard: separate layout with its own top bar, no main site Navbar */}
            <Route path="/:lang/dashboard" element={<ProtectedDashboard />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<Profile />} />
                <Route path="addresses" element={<DashboardAddresses />} />
                <Route path="orders" element={<DashboardOrders />} />
                <Route path="orders/:orderCode" element={<DashboardOrderDetail />} />
                <Route path="favorites" element={<DashboardFavorites />} />
                <Route path="cart" element={<DashboardCart />} />
              </Route>
            </Route>
            {/* Main site: Navbar + Cart */}
            <Route path="/:lang" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="journal" element={<Journal />} />
              <Route path="journal/:slug" element={<JournalPost />} />
              <Route path="contact" element={<Contact />} />
              <Route path="shipping-payment" element={<ShippingAndPayment />} />
              <Route path="search" element={<Search />} />
              <Route path="products" element={<Catalog />} />
              <Route path="category/:id" element={<Category />} />
              <Route path="collection/:id" element={<Collection />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="styling/:id" element={<StyleInspiration />} />
              <Route path="auth" element={<Auth />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="payment/success" element={<PaymentSuccess />} />
              <Route path="payment/failed" element={<PaymentFailed />} />
              <Route path="payment/result/:orderCode" element={<PaymentResult />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}
