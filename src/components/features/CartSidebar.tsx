import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatPriceToman } from '../../utils/format';

export const CartSidebar: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateCartItemQuantity, cartTotal } = useCart();
  const { t, direction, language } = useLanguage();
  const navigate = useNavigate();
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

  const handleQuantityChange = async (id: string, quantity: number) => {
    const result = await updateCartItemQuantity(id, quantity);
    setItemErrors((prev) => {
      if (result.ok) {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: result.message ?? 'موجودی کافی نیست' };
    });
  };

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
          <button onClick={() => setIsCartOpen(false)} aria-label={t('common.close')}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center text-center mt-10">
              <div className="w-16 h-16 rounded-full bg-zafting-text/5 flex items-center justify-center mb-4">
                <ShoppingBag size={28} className="text-zafting-text/40" />
              </div>
              <p className="font-sans text-zafting-text/50 mb-6">{t('cart.empty')}</p>
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate(`/${language}/shop`);
                }}
                className="font-sans px-6 py-3 rounded-full bg-zafting-text text-zafting-bg text-sm uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
              >
                {t('cart.emptyCta')}
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartLineId} className="flex gap-4">
                <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-md" />
                <div className="flex-1">
                  <h4 className="font-serif text-lg">{item.name}</h4>
                  <p className="font-sans text-sm opacity-60">
                     {item.category}
                  </p>
                  {(item.selectedColor || item.selectedSize) && (
                    <p className="font-sans text-xs opacity-70 mt-1 flex items-center gap-2">
                      {item.selectedColor && (
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="w-3 h-3 rounded-full border border-zafting-text/20 inline-block"
                            style={{ backgroundColor: item.variants?.[0]?.colorCode || undefined }}
                          />
                          {item.selectedColor}
                        </span>
                      )}
                      {item.selectedSize && <span>{item.selectedSize}</span>}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-sans font-medium">{formatPriceToman(item.discountPrice || item.price)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.cartLineId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors"
                        aria-label="decrease-qty"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-sans text-xs opacity-60 min-w-10 text-center">
                        {t('cart.qty')}: {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.cartLineId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors"
                        aria-label="increase-qty"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  {itemErrors[item.cartLineId] && (
                    <p className="text-xs text-red-600 mt-1">{itemErrors[item.cartLineId]}</p>
                  )}
                </div>
                <button
                  onClick={() => removeFromCart(item.cartLineId)}
                  className="self-start p-2.5 -m-2.5 text-red-500 hover:text-red-700 rounded-full"
                  aria-label={t('cart.remove')}
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
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate(`/${language}/checkout`);
                  }}
                  className="font-sans w-full bg-zafting-text text-zafting-bg py-4 rounded-full font-bold uppercase tracking-widest hover:bg-zafting-accent transition-colors flex items-center justify-center gap-2"
                >
                    {t('cart.checkout')}
                    {direction === 'rtl' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
