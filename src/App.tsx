import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Category } from './pages/Category';
import { ProductDetail } from './pages/ProductDetail';
import { StyleInspiration } from './pages/StyleInspiration';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';

export default function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="category/:id" element={<Category />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="styling/:id" element={<StyleInspiration />} />
                <Route path="auth" element={<Auth />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </CartProvider>
    </LanguageProvider>
  );
}
