import React, { useState } from 'react';
import { ShoppingBag, User, Menu, Globe, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t, direction } = useLanguage();
  const { cartCount, setIsCartOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fa' : 'en');
  };

  const handleNavClick = (key: string) => {
    if (key === 'nav.menu.shop') {
        navigate(`/${language}/shop`);
    } else if (key === 'nav.menu.collections') {
        navigate(`/${language}`);
    }
    setIsMenuOpen(false);
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      navigate(`/${language}/dashboard`);
    } else {
      navigate(`/${language}/auth`);
    }
  };


  const menuItems = [
    { key: 'nav.menu.shop', href: `/${language}/shop` },
    { key: 'nav.menu.collections', href: `/${language}` },
    // These could be actual routes later
    { key: 'nav.menu.blog', href: '#' },
    { key: 'nav.menu.about', href: '#' },
    { key: 'nav.menu.contact', href: '#' },
  ];

  return (
    <>
      <nav className="fixed top-0 start-0 w-full z-40 px-6 py-6 flex justify-between items-center mix-blend-multiply pointer-events-none">
        <Link to={`/${language}`} className="pointer-events-auto text-xl tracking-widest font-sans font-medium text-zafting-text uppercase z-50">
          {t('nav.title')}
        </Link>
        
        <div className="flex items-center gap-6 md:gap-8 pointer-events-auto">
          <button 
            onClick={toggleLanguage}
            className="text-zafting-text hover:opacity-70 transition-opacity flex items-center gap-1 font-sans text-xs"
          >
            <Globe size={16} strokeWidth={1.5} />
            <span className="uppercase">{language === 'en' ? 'FA' : 'EN'}</span>
          </button>

          <button 
            onClick={handleAuthClick}
            className="text-zafting-text hover:opacity-70 transition-opacity"
          >
            <User size={20} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="text-zafting-text hover:opacity-70 transition-opacity relative"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -end-2 bg-zafting-text text-zafting-bg text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="text-zafting-text hover:opacity-70 transition-opacity"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* Full Screen Menu Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-[#E8E0D9] transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'} flex flex-col`}
      >
         {/* Close button and Header within Menu */}
         <div className="px-6 py-6 flex justify-between items-center">
             <div className="text-xl tracking-widest font-sans font-medium text-zafting-text uppercase">
                {t('nav.title')}
             </div>
             <button onClick={() => setIsMenuOpen(false)} className="text-zafting-text hover:opacity-70 transition-opacity">
                <X size={24} strokeWidth={1.5} />
             </button>
         </div>

         {/* Menu Links */}
         <div className="flex-1 flex flex-col justify-center items-center gap-8 p-6">
            {menuItems.map((item, idx) => (
                <button 
                    key={idx} 
                    onClick={() => handleNavClick(item.key)}
                    className="font-serif text-4xl md:text-6xl text-zafting-text hover:text-zafting-accent transition-colors flex items-center gap-4 group"
                >
                    {t(item.key)}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-2 rtl:group-hover:-translate-x-2">
                       {direction === 'rtl' ? <ArrowLeft size={32} /> : <ArrowRight size={32} />}
                    </span>
                </button>
            ))}
         </div>
      </div>
    </>
  );
};
