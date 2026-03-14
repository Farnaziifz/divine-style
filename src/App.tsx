import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, Outlet } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Category } from './pages/Category';
import { ProductDetail } from './pages/ProductDetail';
import { StyleInspiration } from './pages/StyleInspiration';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { DashboardOrders } from './pages/dashboard/DashboardOrders';
import { DashboardFavorites } from './pages/dashboard/DashboardFavorites';
import { DashboardCart } from './pages/dashboard/DashboardCart';

const RootRedirect = () => <Navigate to="/fa" replace />;

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
      <CartProvider>
        <AuthProvider>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              {/* Dashboard: separate layout with its own top bar, no main site Navbar */}
              <Route path="/:lang/dashboard" element={<ProtectedDashboard />}>
                <Route element={<DashboardLayout />}>
                  <Route index element={<Navigate to="profile" replace />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="orders" element={<DashboardOrders />} />
                  <Route path="favorites" element={<DashboardFavorites />} />
                  <Route path="cart" element={<DashboardCart />} />
                </Route>
              </Route>
              {/* Main site: Navbar + Cart + StylistChat */}
              <Route path="/:lang" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="category/:id" element={<Category />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="styling/:id" element={<StyleInspiration />} />
                <Route path="auth" element={<Auth />} />
              </Route>
            </Routes>
        </AuthProvider>
      </CartProvider>
    </LanguageProvider>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
