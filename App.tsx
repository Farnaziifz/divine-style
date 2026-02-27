import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { StylistChat } from './components/StylistChat';
import { ShopPage } from './components/ShopPage';
import { CategoryPage } from './components/CategoryPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { StyleInspirationPage } from './components/StyleInspirationPage';
import { AuthPage } from './components/AuthPage';
import { PRODUCTS } from './constants';
import { Product, CartItem } from './types';
import { X, LogOut, User } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const AppContent: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'category' | 'product' | 'styling' | 'auth' | 'profile'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { t } = useLanguage();

  const featuredProduct = PRODUCTS.find(p => p.isFeatured) || PRODUCTS[0];
  const otherProducts = PRODUCTS.filter(p => p.id !== featuredProduct.id);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => {
      const price = item.discountPrice || item.price;
      return sum + (price * item.quantity);
  }, 0);

  const handleCategoryClick = (categoryId: string) => {
      setSelectedCategory(categoryId);
      setCurrentView('category');
  };

  const handleProductClick = (product: Product) => {
      setSelectedProduct(product);
      setCurrentView('product');
  };

  const handleOpenStyling = (product: Product) => {
      setSelectedProduct(product);
      setCurrentView('styling');
  };

  // Auth Navigation Logic
  const handleAuthNavigation = (target: 'auth' | 'profile') => {
      if (isAuthenticated) {
          setCurrentView('profile');
      } else {
          setCurrentView('auth');
      }
  };

  const handleLoginSuccess = () => {
      setIsAuthenticated(true);
      setCurrentView('profile');
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setCurrentView('home');
  };

  return (
    <div className="min-h-screen text-zafting-text font-sans relative bg-zafting-bg">
      <Navbar 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)}
        onNavigate={(view) => {
            if (view === 'auth' || view === 'profile') {
                handleAuthNavigation(view as any);
            } else {
                setCurrentView(view);
            }
        }}
      />

      <main>
        {currentView === 'home' && (
          <>
            <Hero featuredProduct={featuredProduct} onAddToCart={handleAddToCart} />
            <ProductGrid products={otherProducts} onAddToCart={handleAddToCart} />
          </>
        )}
        
        {currentView === 'shop' && (
          <ShopPage onCategoryClick={handleCategoryClick} />
        )}

        {currentView === 'category' && (
            <CategoryPage 
                categoryId={selectedCategory} 
                onAddToCart={handleAddToCart}
                onBack={() => setCurrentView('shop')}
                onProductClick={handleProductClick}
            />
        )}

        {currentView === 'product' && selectedProduct && (
            <ProductDetailPage 
                product={selectedProduct}
                onAddToCart={handleAddToCart}
                onBack={() => setCurrentView('category')}
                onOpenStyling={handleOpenStyling}
            />
        )}

        {currentView === 'styling' && selectedProduct && (
            <StyleInspirationPage 
                product={selectedProduct}
                onAddToCart={handleAddToCart}
                onBack={() => setCurrentView('product')}
                onProductClick={handleProductClick}
            />
        )}

        {currentView === 'profile' && (
            <div className="min-h-screen pt-24 px-6 flex flex-col items-center animate-fade-in">
                <div className="w-full max-w-4xl">
                    <h1 className="font-serif text-5xl mb-12">{t('profile.title')}</h1>
                    <div className="bg-white/50 backdrop-blur-md rounded-[2rem] p-8 md:p-12 border border-white/40 flex flex-col items-center text-center gap-6">
                         <div className="w-32 h-32 rounded-full bg-zafting-text text-[#E8E0D9] flex items-center justify-center">
                             <User size={64} />
                         </div>
                         <h2 className="font-serif text-3xl">Fashion Enthusiast</h2>
                         <p className="opacity-60">+1 (555) 123-4567</p>
                         
                         <div className="w-full h-[1px] bg-zafting-text/10 my-4"></div>
                         
                         <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold uppercase tracking-widest text-sm"
                         >
                             <LogOut size={18} /> {t('profile.logout')}
                         </button>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* Auth Modal Overlay */}
      {currentView === 'auth' && (
          <AuthPage 
            onLoginSuccess={handleLoginSuccess} 
            onClose={() => setCurrentView('home')} 
          />
      )}

      <StylistChat />

      {/* Cart Sidebar Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end rtl:justify-start">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          ></div>
          
          <div className="relative w-full max-w-md bg-[#E8E0D9] h-full shadow-2xl p-8 flex flex-col transform transition-transform duration-300">
            <div className="flex justify-between items-center mb-8 border-b border-zafting-text/10 pb-4">
              <h2 className="font-serif text-3xl">{t('cart.title')}</h2>
              <button onClick={() => setIsCartOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
              {cart.length === 0 ? (
                <p className="text-center text-zafting-text/50 mt-10">{t('cart.empty')}</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-md" />
                    <div className="flex-1">
                      <h4 className="font-serif text-lg">{item.name}</h4>
                      <p className="text-sm opacity-60">
                        {item.discountPrice ? (
                            <>
                                <span className="line-through mr-1">${item.price}</span>
                                <span className="text-red-600">${item.discountPrice}</span>
                            </>
                        ) : (
                            <span>${item.price}</span>
                        )}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">{t('cart.qty')}: {item.quantity}</span>
                        <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs underline hover:text-red-500"
                        >
                            {t('cart.remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-zafting-text/10 pt-6 mt-4">
              <div className="flex justify-between text-xl font-serif mb-6">
                <span>{t('cart.total')}</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <button className="w-full bg-zafting-text text-[#E8E0D9] py-4 rounded-full uppercase tracking-widest text-xs hover:bg-opacity-90 transition-opacity">
                {t('cart.checkout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
