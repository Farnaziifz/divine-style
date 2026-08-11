import React, { useEffect, useMemo, useState } from 'react';
import { MessagesSquare } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { DirectChat } from './DirectChat';

export const DirectChatWidget: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { isCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const directParam = useMemo(() => searchParams.get('direct'), [searchParams]);
  // صفحه محصول موبایل یه نوار خرید چسبان پایین صفحه داره، صفحه دسته‌بندی موبایل ویترین نزدیک پایین صفحه داره؛
  // دکمه دایرکت رو بالاتر می‌بریم که روشون نیفته
  const isProductDetailPage = /\/product\//.test(location.pathname);
  const isCategoryPage = /\/category\//.test(location.pathname);
  // مسیر پرداخت: دکمه دایرکت نباید روی دکمه‌ی نهایی‌کردن سبد خرید/پرداخت بشینه، پس کلاً مخفی می‌شه
  const isCheckoutPage = /\/checkout/.test(location.pathname);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (directParam !== '1') return;
    setIsOpen(true);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('direct');
    setSearchParams(nextParams, { replace: true });
  }, [directParam, isAuthenticated, searchParams, setSearchParams]);

  const open = () => {
    if (isAuthenticated) {
      setIsOpen(true);
      return;
    }
    const nextParams = new URLSearchParams(location.search);
    nextParams.set('direct', '1');
    const next = `${location.pathname}?${nextParams.toString()}`;
    navigate(`/${language}/auth?next=${encodeURIComponent(next)}`);
  };

  // مسیر پرداخت اولویت داره: وقتی سبد خرید بازه یا تو صفحه تسویه‌حساب هستیم،
  // دکمه دایرکت کلاً مخفی می‌شه که هیچ‌وقت روی دکمه‌ی نهایی‌کردن سفارش ننشینه
  const isHidden = isOpen || isCartOpen || isCheckoutPage;
  const bottomOffsetClass =
    isProductDetailPage || isCategoryPage ? 'bottom-24 lg:bottom-8' : 'bottom-8';

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={`fixed ${bottomOffsetClass} start-8 z-50 bg-zafting-text text-[#E8E0D9] p-4 rounded-full shadow-xl hover:scale-105 transition-transform duration-300 ${isHidden ? 'hidden' : 'flex'} items-center gap-2`}
        aria-label="direct-chat"
      >
        <MessagesSquare size={20} />
        <span className="font-serif italic pe-1 hidden sm:inline">
          {language === 'fa' ? 'دایرکت' : 'Direct'}
        </span>
      </button>

      <DirectChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

