import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { Link, useParams } from 'react-router-dom';
import { DashboardPageHeader } from '../../components/dashboard/DashboardPageHeader';
import { DashboardCard } from '../../components/dashboard/DashboardCard';
import { shoppingListService } from '../../services/shoppingList.service';
import { formatPriceToman } from '../../utils/format';
import type { Product } from '../../types';

interface ListItem {
  id: string;
  productId: string;
  addedAt: string;
  product: Product;
}

export const DashboardCart: React.FC = () => {
  const { t, language } = useLanguage();
  const { lang } = useParams<{ lang: string }>();
  const { addToCart, setIsCartOpen } = useCart();
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    shoppingListService
      .getList()
      .then((res) => {
        if (!cancelled) setItems(res.items);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await shoppingListService.remove(productId);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <DashboardPageHeader title={t('dashboard.cart.title')} />
        <div className="flex items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-zafting-text/60" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="animate-fade-in">
        <DashboardPageHeader title={t('dashboard.cart.title')} />

        <DashboardCard>
          <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-zafting-text/10 text-zafting-text flex items-center justify-center mb-5">
              <ShoppingBag size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-medium text-zafting-text mb-2">
              {t('dashboard.shopping_list.empty')}
            </h3>
            <p className="text-sm text-zafting-text/60 max-w-sm mb-8">
              {language === 'fa'
                ? 'محصولاتی که در صفحه هر محصول به «لیست خرید» اضافه کنید اینجا نمایش داده می‌شوند.'
                : 'Items you add to your shopping list from product pages will appear here.'}
            </p>
            <Link
              to={`/${lang || language}/shop`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-zafting-text text-white hover:opacity-90 transition-opacity"
            >
              <ArrowLeft size={18} className={language === 'fa' ? 'rotate-180' : ''} />
              {language === 'fa' ? 'رفتن به فروشگاه' : 'Go to Shop'}
            </Link>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <DashboardPageHeader
        title={t('dashboard.cart.title')}
        subtitle={
          language === 'fa'
            ? `${items.length} محصول در لیست شما`
            : `${items.length} item(s) in your list`
        }
      />

      <DashboardCard>
        <ul className="divide-y divide-zafting-text/10">
          {items.map((row) => (
            <li key={row.id} className="p-4 md:p-6 flex gap-4 md:gap-6 items-center">
              <Link
                to={`/${lang || language}/product/${row.productId}`}
                className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-zafting-text/10 shrink-0 overflow-hidden"
              >
                <img
                  src={row.product.image}
                  alt={row.product.name}
                  className="w-full h-full object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/${lang || language}/product/${row.productId}`}
                  className="font-medium text-zafting-text hover:underline line-clamp-2"
                >
                  {row.product.name}
                </Link>
                <p className="text-zafting-text/60 text-sm mt-0.5">
                  {row.product.discountPrice != null
                    ? formatPriceToman(row.product.discountPrice)
                    : formatPriceToman(row.product.price)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleAddToCart(row.product)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-zafting-text text-white hover:opacity-90"
                >
                  {t('shop.btn.buy')}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(row.productId)}
                  disabled={removingId === row.productId}
                  className="p-2 rounded-xl text-red-600 hover:bg-red-50 disabled:opacity-50"
                  aria-label={language === 'fa' ? 'حذف از لیست' : 'Remove from list'}
                >
                  {removingId === row.productId ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Trash2 size={20} />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </DashboardCard>
    </div>
  );
};
