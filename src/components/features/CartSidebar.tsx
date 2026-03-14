import React from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatPriceToman } from '../../utils/format';

export const CartSidebar: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, cartTotal } = useCart();
  const { t, direction } = useLanguage();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end rtl:justify-start">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      ></div>
      
      <div className="relative w-full max-w-md bg-[#E8E0D9] h-full shadow-2xl p-8 flex flex-col transform transition-transform duration-300 animate-slide-in">
        <div className="flex justify-between items-center mb-8 border-b border-zafting-text/10 pb-4">
          <h2 className="font-serif text-3xl">{t('cart.title')}</h2>
          <button onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          {cart.length === 0 ? (
            <p className="font-sans text-center text-zafting-text/50 mt-10">{t('cart.empty')}</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4">
                <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-md" />
                <div className="flex-1">
                  <h4 className="font-serif text-lg">{item.name}</h4>
                  <p className="font-sans text-sm opacity-60">
                     {t(`product.category.${item.category}`)}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-sans font-medium">{formatPriceToman(item.discountPrice || item.price)}</span>
                    <span className="font-sans text-xs opacity-50">{t('cart.qty')}: {item.quantity}</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="self-start text-red-500 hover:text-red-700"
                  title={t('cart.remove')}
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
            <div className="border-t border-zafting-text/10 pt-6 mt-4">
                <div className="flex justify-between items-center mb-6 text-xl font-serif">
                    <span>{t('cart.total')}</span>
                    <span>{formatPriceToman(cartTotal)}</span>
                </div>
                <button className="font-sans w-full bg-zafting-text text-zafting-bg py-4 rounded-full font-bold uppercase tracking-widest hover:bg-zafting-accent transition-colors flex items-center justify-center gap-2">
                    {t('cart.checkout')}
                    {direction === 'rtl' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
