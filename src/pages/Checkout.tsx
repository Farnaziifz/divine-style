import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { userService, UserAddress } from '../services/user.service';
import { formatPriceToman } from '../utils/format';

type CheckoutPreview = {
  subtotal: number;
  discountCode: string | null;
  discountAmount: number;
  shippingCost: number;
  payableAmount: number;
  address: any;
};

type CheckoutResponse = {
  orderId: string;
  orderCode: string;
  payableAmount: number;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  paymentUrl: string | null;
};

export const Checkout: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, cartTotal, updateCartItemQuantity, removeFromCart, clearCart } = useCart();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [discountCode, setDiscountCode] = useState('');
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/${language}/auth`, { replace: true });
    }
  }, [isAuthenticated, language, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    userService
      .getMyAddresses()
      .then((data) => {
        if (cancelled) return;
        setAddresses(data);
        const def = data.find((a) => a.isDefault) ?? data[0];
        if (def?.id) setSelectedAddressId(def.id);
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const hasCart = cart.length > 0;

  const canPay = useMemo(() => {
    return hasCart && Boolean(selectedAddressId) && !checkingOut;
  }, [hasCart, selectedAddressId, checkingOut]);

  const refreshPreview = useCallback(async (addressId: string, code: string) => {
    if (!isAuthenticated) return;
    if (!addressId) {
      setPreview(null);
      return;
    }
    setLoadingPreview(true);
    setError(null);
    try {
      const payload = {
        addressId,
        ...(code.trim() ? { discountCode: code.trim() } : {}),
      };
      const { data } = await api.post<CheckoutPreview>('/basket/checkout/preview', payload);
      setPreview(data);
    } catch (e: any) {
      setPreview(null);
      setError(e?.response?.data?.message ?? (language === 'fa' ? 'خطا در بررسی سبد خرید' : 'Checkout preview failed'));
    } finally {
      setLoadingPreview(false);
    }
  }, [isAuthenticated, language]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!selectedAddressId) return;
    refreshPreview(selectedAddressId, discountCode);
  }, [discountCode, isAuthenticated, refreshPreview, selectedAddressId]);

  const applyDiscount = () => {
    if (!selectedAddressId) return;
    refreshPreview(selectedAddressId, discountCode);
  };

  const handlePay = async () => {
    if (!canPay) return;
    setCheckingOut(true);
    setError(null);
    try {
      const payload = {
        addressId: selectedAddressId,
        ...(discountCode.trim() ? { discountCode: discountCode.trim() } : {}),
      };
      const { data } = await api.post<CheckoutResponse>('/basket/checkout', payload);
      clearCart();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      if (data.paymentStatus === 'PAID') {
        navigate(`/${language}/payment/success?orderCode=${data.orderCode}`);
        return;
      }
      navigate(`/${language}/payment/failed?orderCode=${data.orderCode}`);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? (language === 'fa' ? 'خطا در ثبت سفارش' : 'Checkout failed'));
    } finally {
      setCheckingOut(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="px-6 max-w-6xl mx-auto pt-28 pb-20 animate-fade-in">
      <h1 className="font-serif text-3xl md:text-4xl text-zafting-text">
        {t('checkout.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white/40 border border-white rounded-2xl p-6">
            <h2 className="font-serif text-xl text-zafting-text mb-4">
              {t('checkout.cart')}
            </h2>
            {cart.length === 0 ? (
              <p className="font-sans text-zafting-text/60">{t('cart.empty')}</p>
            ) : (
              <div className="space-y-5">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-24 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-serif text-lg">{item.name}</h3>
                      <p className="font-sans text-sm opacity-60">
                        {t(`product.category.${item.category}`)}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-sans font-medium">
                          {formatPriceToman(item.discountPrice || item.price)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors"
                            aria-label="decrease-qty"
                          >
                            -
                          </button>
                          <span className="font-sans text-xs opacity-60 min-w-10 text-center">
                            {t('cart.qty')}: {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors"
                            aria-label="increase-qty"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="self-start text-red-500 hover:text-red-700"
                      title={t('cart.remove')}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white/40 border border-white rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif text-xl text-zafting-text">
                {t('checkout.address')}
              </h2>
              <button
                type="button"
                onClick={() => navigate(`/${language}/dashboard/addresses`)}
                className="font-sans text-sm border-b border-zafting-text pb-1 hover:text-zafting-accent transition-colors"
              >
                {t('checkout.manageAddresses')}
              </button>
            </div>

            {addresses.length === 0 ? (
              <p className="font-sans text-zafting-text/60 mt-4">
                {t('checkout.noAddress')}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 mt-5">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className="flex gap-3 items-start border border-zafting-text/10 bg-white/40 rounded-2xl p-4 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="address"
                      className="mt-1"
                      checked={selectedAddressId === a.id}
                      onChange={() => setSelectedAddressId(a.id)}
                    />
                    <div className="min-w-0">
                      <p className="font-sans text-sm text-zafting-text/80">
                        {a.province} - {a.city}
                        {a.isDefault ? (
                          <span className="ms-2 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-zafting-text/10 text-zafting-text">
                            {t('profile.address.default')}
                          </span>
                        ) : null}
                      </p>
                      <p className="font-sans text-sm text-zafting-text/70 mt-2">
                        {a.address}
                      </p>
                      <p className="font-sans text-xs text-zafting-text/60 mt-2">
                        {(a.plaque ? `${t('profile.address.plaque')}: ${a.plaque}` : '')}
                        {(a.unit ? `  ${t('profile.address.unit')}: ${a.unit}` : '')}
                        {(a.postalCode ? `  ${t('profile.address.postalCode')}: ${a.postalCode}` : '')}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="bg-white/40 border border-white rounded-2xl p-6 h-fit">
          <h2 className="font-serif text-xl text-zafting-text mb-5">
            {t('checkout.summary')}
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between font-sans text-sm text-zafting-text/70">
              <span>{t('checkout.subtotal')}</span>
              <span>{formatPriceToman(preview?.subtotal ?? cartTotal)}</span>
            </div>
            <div className="flex justify-between font-sans text-sm text-zafting-text/70">
              <span>{t('checkout.shipping')}</span>
              <span>{formatPriceToman(preview?.shippingCost ?? 0)}</span>
            </div>
            <div className="flex justify-between font-sans text-sm text-zafting-text/70">
              <span>{t('checkout.discount')}</span>
              <span>{formatPriceToman(preview?.discountAmount ?? 0)}</span>
            </div>
            <div className="border-t border-zafting-text/10 pt-4 flex justify-between font-serif text-lg">
              <span>{t('checkout.payable')}</span>
              <span>{formatPriceToman(preview?.payableAmount ?? cartTotal)}</span>
            </div>
          </div>

          <div className="mt-6">
            <label className="font-sans text-sm text-zafting-text/70 block mb-2">
              {t('checkout.discountCode')}
            </label>
            <div className="flex gap-2">
              <input
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="font-sans flex-1 px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text dir-ltr"
                placeholder={language === 'fa' ? 'مثلاً OFF10' : 'e.g. OFF10'}
              />
              <button
                type="button"
                onClick={applyDiscount}
                disabled={loadingPreview || !selectedAddressId}
                className="font-sans px-4 py-3 rounded-xl text-sm font-medium border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors disabled:opacity-60"
              >
                {t('checkout.apply')}
              </button>
            </div>
          </div>

          {error ? (
            <p className="font-sans text-sm text-red-600 mt-4">{String(error)}</p>
          ) : null}

          <button
            type="button"
            onClick={handlePay}
            disabled={!canPay || loadingPreview}
            className="font-sans w-full bg-zafting-text text-zafting-bg py-4 rounded-full font-bold uppercase tracking-widest hover:bg-zafting-accent transition-colors mt-6 disabled:opacity-60"
          >
            {checkingOut ? (language === 'fa' ? 'در حال ثبت...' : 'Processing...') : t('checkout.pay')}
          </button>
        </aside>
      </div>
    </div>
  );
};
