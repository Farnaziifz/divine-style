import React, { useState } from 'react';
import { ShoppingBag, User, Menu, Globe, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (view: 'home' | 'shop' | 'auth' | 'profile') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart, onNavigate }) => {
  const { language, setLanguage, t, direction } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fa' : 'en');
  };

  const handleNavClick = (key: string) => {
    if (key === 'nav.menu.shop') {
        onNavigate('shop');
    } else if (key === 'nav.menu.collections') {
        onNavigate('home');
    }
    setIsMenuOpen(false);
  };

  const menuItems = [
    { key: 'nav.menu.shop', href: '#' },
    { key: 'nav.menu.collections', href: '#' },
    { key: 'nav.menu.blog', href: '#' },
    { key: 'nav.menu.about', href: '#' },
    { key: 'nav.menu.contact', href: '#' },
  ];

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <>
      <nav className="fixed top-0 start-0 w-full z-40 px-6 py-6 flex justify-between items-center mix-blend-multiply pointer-events-none">
        <button onClick={() => onNavigate('home')} className="pointer-events-auto text-xl tracking-widest font-sans font-medium text-zafting-text uppercase z-50">
          {t('nav.title')}
        </button>
        
        <div className="flex items-center gap-6 md:gap-8 pointer-events-auto">
          <button 
            onClick={toggleLanguage}
            className="text-zafting-text hover:opacity-70 transition-opacity flex items-center gap-1 font-sans text-xs"
          >
            <Globe size={16} strokeWidth={1.5} />
            <span className="uppercase">{language === 'en' ? 'FA' : 'EN'}</span>
          </button>

          <button 
            onClick={() => onNavigate('auth')} // Logic handled in App.tsx (redirects to profile if logged in)
            className="text-zafting-text hover:opacity-70 transition-opacity"
          >
            <User size={20} strokeWidth={1.5} />
          </button>
          <button 
            onClick={onOpenCart}
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
                    <span className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 rtl:translate-x-4 rtl:group-hover:translate-x-0">
                        <ArrowIcon size={24} />
                    </span>
                    {t(item.key)}
                    <span className="opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 rtl:-translate-x-4 rtl:group-hover:translate-x-0">
                        <ArrowIcon size={24} />
                    </span>
                </button>
            ))}
         </div>
      </div>
    </>
  );
};
