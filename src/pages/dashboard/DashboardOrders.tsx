import React, { useEffect, useMemo, useState } from 'react';
import { Package, ArrowLeft, ReceiptText, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link, useParams } from 'react-router-dom';
import { DashboardPageHeader } from '../../components/dashboard/DashboardPageHeader';
import { DashboardCard, DashboardCardHeader } from '../../components/dashboard/DashboardCard';
import { formatPriceToman } from '../../utils/format';
import { orderService, OrderDto } from '../../services/order.service';

export const DashboardOrders: React.FC = () => {
  const { t, language } = useLanguage();
  const { lang } = useParams<{ lang: string }>();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  const resolveOrderStatus = (o: OrderDto): NonNullable<OrderDto['orderStatus']> => {
    if (o.orderStatus) return o.orderStatus;
    if (o.paymentStatus === 'PAID') return 'PAID';
    if (o.paymentStatus === 'FAILED') return 'CANCELED';
    return 'PENDING_PAYMENT';
  };

  const statusBadgeClass = (status: NonNullable<OrderDto['orderStatus']>) => {
    if (status === 'DELIVERED') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'CANCELED') return 'bg-red-100 text-red-700 border-red-200';
    if (status === 'SHIPPED') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (status === 'CONFIRMED') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (status === 'PAID') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  const formatDate = useMemo(() => {
    try {
      const locale = language === 'fa' ? 'fa-IR' : 'en-US';
      return (value: string) =>
        new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(value));
    } catch {
      return (value: string) => value;
    }
  }, [language]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    orderService
      .getMyOrders({ page: 1, limit: 20 })
      .then((res) => {
        if (cancelled) return;
        setOrders(res.data);
      })
      .catch(() => {
        if (cancelled) return;
        setOrders([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <DashboardPageHeader title={t('dashboard.orders.title')} />
        <DashboardCard>
          <div className="p-6">
            <p className="font-sans text-sm text-zafting-text/60">
              {language === 'fa' ? 'در حال دریافت سفارشات...' : 'Loading orders...'}
            </p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="animate-fade-in">
        <DashboardPageHeader title={t('dashboard.orders.title')} />

        <DashboardCard>
          <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-zafting-text/10 text-zafting-text flex items-center justify-center mb-5">
              <Package size={32} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-lg font-medium text-zafting-text mb-2">
              {t('dashboard.orders.empty')}
            </h3>
            <p className="font-sans text-sm text-zafting-text/60 max-w-sm mb-8">
              {language === 'fa'
                ? 'با اولین خرید، سفارشات شما اینجا نمایش داده می‌شوند.'
                : 'Your orders will appear here after your first purchase.'}
            </p>
            <Link
              to={`/${lang || language}/shop`}
              className="font-sans inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-zafting-text text-white hover:opacity-90 transition-opacity"
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
      <DashboardPageHeader title={t('dashboard.orders.title')} />

      <DashboardCard>
        <DashboardCardHeader
          title={t('dashboard.orders.title')}
          subtitle={language === 'fa' ? 'آخرین سفارشات شما' : 'Your latest orders'}
        />
        <div className="p-6 space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="border border-zafting-text/10 bg-white/40 rounded-2xl p-5"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zafting-text/10 text-zafting-text flex items-center justify-center">
                      <ReceiptText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans text-xs text-zafting-text/50">
                        {t('dashboard.orders.orderCode')}
                      </p>
                      <p className="font-mono text-sm text-zafting-text dir-ltr truncate">
                        {o.orderCode}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="font-sans text-xs text-zafting-text/50">
                        {t('dashboard.orders.date')}
                      </p>
                      <p className="font-sans text-sm text-zafting-text/80">
                        {formatDate(o.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="font-sans text-xs text-zafting-text/50">
                        {t('dashboard.orders.status')}
                      </p>
                      <span
                        className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-sans border ${statusBadgeClass(
                          resolveOrderStatus(o),
                        )}`}
                      >
                        {t(`order.orderStatus.${resolveOrderStatus(o)}`)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 w-full md:w-64 rounded-2xl border border-zafting-text/10 bg-white/50 p-4">
                  <div className="flex justify-between font-sans text-sm text-zafting-text/70">
                    <span>{t('dashboard.orders.total')}</span>
                    <span>{formatPriceToman(o.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between font-sans text-sm text-zafting-text/70 mt-2">
                    <span>{t('dashboard.orders.payable')}</span>
                    <span className="font-medium text-zafting-text">
                      {formatPriceToman(o.payableAmount)}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/${lang || language}/dashboard/orders/${encodeURIComponent(o.orderCode)}`}
                      className="font-sans inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-zafting-text text-white hover:opacity-90 transition-opacity"
                    >
                      {language === 'fa' ? 'جزئیات سفارش' : 'Order details'}
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-zafting-text/10 pt-4">
                <p className="font-sans text-xs text-zafting-text/50 mb-3">
                  {t('dashboard.orders.items')} ({o.items.length})
                </p>
                <div className="space-y-2">
                  {o.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="font-sans text-sm text-zafting-text/80 truncate">
                          {it.title}
                        </p>
                        <p className="font-mono text-xs text-zafting-text/50 dir-ltr truncate">
                          {it.sku}
                        </p>
                      </div>
                      <div className="shrink-0 text-end">
                        <p className="font-sans text-xs text-zafting-text/60">
                          {language === 'fa' ? 'تعداد' : 'Qty'}: {it.quantity}
                        </p>
                        <p className="font-sans text-sm text-zafting-text">
                          {formatPriceToman(it.unitDiscountPrice ?? it.unitPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
};
