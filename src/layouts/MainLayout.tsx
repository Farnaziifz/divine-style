import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { CartSidebar } from '../components/features/CartSidebar';
import { DirectChatWidget } from '../components/features/DirectChatWidget';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen text-zafting-text font-sans relative bg-zafting-bg">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <CartSidebar />
      <DirectChatWidget />
    </div>
  );
};
