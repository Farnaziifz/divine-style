import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CartItem } from '../types';
import api from '../services/api';
import { mapApiProductToProduct } from '../services/productApi';
import { useAuth } from './AuthContext';

export interface CartMutationResult {
  ok: boolean;
  message?: string;
}

export interface CartRefreshResult {
  previous: CartItem[];
  current: CartItem[];
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => Promise<CartMutationResult>;
  removeFromCart: (id: string) => void;
  updateCartItemQuantity: (id: string, quantity: number) => Promise<CartMutationResult>;
  clearCart: () => void;
  /** Re-fetches the basket from the server (picks up reservations the
   * background sweeper expired) and reports what the cart looked like
   * before/after so callers can surface what changed. */
  refreshCart: () => Promise<CartRefreshResult>;
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
    (async () => {
      try {
        const localRaw = localStorage.getItem(CART_STORAGE_KEY);
        const localParsed = localRaw ? (JSON.parse(localRaw) as CartItem[]) : [];
        const localUnsynced = Array.isArray(localParsed)
          ? localParsed.filter((it) => !it?.basketItemId && it?.id && it?.quantity > 0)
          : [];

        if (localUnsynced.length > 0) {
          for (const item of localUnsynced) {
            if (cancelled) return;
            await api.post('/basket/items', {
              productId: item.id,
              quantity: item.quantity,
            });
          }
        }

        const res = await api.get('/basket');
        if (cancelled) return;
        setCart(hydrateFromBasketResponse(res.data));
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const addToCart = (product: Product): Promise<CartMutationResult> => {
    let previousCart: CartItem[] = [];
    setCart((prev) => {
      previousCart = prev;
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);

    if (!isAuthenticated) {
      return Promise.resolve({ ok: true });
    }

    return api
      .post('/basket/items', { productId: product.id, quantity: 1 })
      .then((res) => {
        setCart(hydrateFromBasketResponse(res.data));
        return { ok: true };
      })
      .catch((e) => {
        setCart(previousCart);
        return {
          ok: false,
          message: e?.response?.data?.message ?? 'موجودی کافی نیست',
        };
      });
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

  const updateCartItemQuantity = (id: string, quantity: number): Promise<CartMutationResult> => {
    if (!Number.isFinite(quantity) || quantity < 1) {
      removeFromCart(id);
      return Promise.resolve({ ok: true });
    }

    if (isAuthenticated) {
      let previousCart: CartItem[] = [];
      let basketItemId: string | undefined;
      setCart((prev) => {
        previousCart = prev;
        basketItemId = prev.find((x) => x.id === id)?.basketItemId;
        return prev.map((x) => (x.id === id ? { ...x, quantity } : x));
      });

      if (!basketItemId) {
        return Promise.resolve({ ok: true });
      }

      return api
        .patch(`/basket/items/${basketItemId}`, { quantity })
        .then((res) => {
          setCart(hydrateFromBasketResponse(res.data));
          return { ok: true };
        })
        .catch((e) => {
          setCart(previousCart);
          return {
            ok: false,
            message: e?.response?.data?.message ?? 'موجودی کافی نیست',
          };
        });
    }

    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
    return Promise.resolve({ ok: true });
  };

  const refreshCart = async (): Promise<CartRefreshResult> => {
    if (!isAuthenticated) return { previous: cart, current: cart };
    const previous = cart;
    try {
      const res = await api.get('/basket');
      const current = hydrateFromBasketResponse(res.data);
      setCart(current);
      return { previous, current };
    } catch {
      return { previous, current: previous };
    }
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
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart, refreshCart, cartTotal, isCartOpen, setIsCartOpen, cartCount }}>
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
