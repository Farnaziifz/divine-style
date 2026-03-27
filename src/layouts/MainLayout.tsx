import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CartSidebar } from '../components/features/CartSidebar';
import { DirectChatWidget } from '../components/features/DirectChatWidget';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen text-zafting-text font-sans relative bg-zafting-bg flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartSidebar />
      <DirectChatWidget />
    </div>
  );
};
