import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CartItem } from '../types';
import api from '../services/api';
import { mapApiProductToProduct } from '../services/productApi';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const CART_STORAGE_KEY = 'cart';

  const hydrateFromBasketResponse = (payload: any): CartItem[] => {
    const items = Array.isArray(payload?.items) ? payload.items : [];
    return items
      .map((it: any) => {
        const product = it?.product;
        const quantity = typeof it?.quantity === 'number' ? it.quantity : Number(it?.quantity ?? 0);
        if (!product || !product.id || !Number.isFinite(quantity) || quantity <= 0) return null;
        const mapped = mapApiProductToProduct(product);
        return {
          ...mapped,
          quantity,
          basketItemId: it.id,
        } as CartItem;
      })
      .filter(Boolean) as CartItem[];
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) setCart(parsed);
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    api
      .get('/basket')
      .then((res) => {
        if (cancelled) return;
        setCart(hydrateFromBasketResponse(res.data));
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const addToCart = (product: Product) => {
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

    if (isAuthenticated) {
      api
        .post('/basket/items', { productId: product.id, quantity: 1 })
        .then((res) => setCart(hydrateFromBasketResponse(res.data)))
        .catch(() => {
          // ignore
        });
    }
  };

  const removeFromCart = (id: string) => {
    if (isAuthenticated) {
      setCart((prev) => {
        const item = prev.find((x) => x.id === id);
        if (item?.basketItemId) {
          api
            .delete(`/basket/items/${item.basketItemId}`)
            .then((res) => setCart(hydrateFromBasketResponse(res.data)))
            .catch(() => {
              // ignore
            });
        }
        return prev.filter((x) => x.id !== id);
      });
      return;
    }
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    if (!Number.isFinite(quantity) || quantity < 1) {
      removeFromCart(id);
      return;
    }

    if (isAuthenticated) {
      setCart((prev) => {
        const item = prev.find((x) => x.id === id);
        if (!item?.basketItemId) {
          return prev.map((x) => (x.id === id ? { ...x, quantity } : x));
        }
        api
          .patch(`/basket/items/${item.basketItemId}`, { quantity })
          .then((res) => setCart(hydrateFromBasketResponse(res.data)))
          .catch(() => {
            // ignore
          });
        return prev.map((x) => (x.id === id ? { ...x, quantity } : x));
      });
      return;
    }

    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const cartTotal = cart.reduce((sum, item) => {
      const price = item.discountPrice || item.price;
      return sum + (price * item.quantity);
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart, cartTotal, isCartOpen, setIsCartOpen, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
