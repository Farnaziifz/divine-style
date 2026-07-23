import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, ArrowRight, Home, ReceiptText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { orderService, OrderDetailsDto } from '../services/order.service';

const MAX_REFRESHES = 5;
const REFRESH_INTERVAL_MS = 3000;

export const PaymentResult: React.FC = () => {
  const { t, language, direction } = useLanguage();
  const { orderCode } = useParams<{ orderCode: string }>();
  const isRtl = direction === 'rtl';

  const [order, setOrder] = useState<OrderDetailsDto | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const refreshCount = useRef(0);

  useEffect(() => {
    if (!orderCode) return;
    let cancelled = false;
    let timer: number | undefined;

    const load = async () => {
      try {
        const data = await orderService.getOrderByCode(orderCode);
        if (cancelled) return;
        setOrder(data);
        setLoading(false);

        const isFinal = data.paymentStatus === 'PAID' || data.paymentStatus === 'FAILED';
        if (!isFinal && refreshCount.current < MAX_REFRESHES) {
          refreshCount.current += 1;
          timer = window.setTimeout(load, REFRESH_INTERVAL_MS);
        }
      } catch {
        if (cancelled) return;
        setError(t('payment.checkFailed'));
        setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCode]);

  const isSuccess = order?.paymentStatus === 'PAID';
  const isFailed = order?.paymentStatus === 'FAILED';
  const isPending = !!order && !isSuccess && !isFailed;

  return (
    <div className="px-6 max-w-4xl mx-auto pt-28 pb-20 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl border border-white bg-white/40 shadow-xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -end-24 w-72 h-72 rounded-full bg-green-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -start-24 w-72 h-72 rounded-full bg-zafting-text/10 blur-3xl" />
        </div>

        <div className="relative p-8 md:p-12 text-center">
          {loading && !order && (
            <>
              <div className="w-10 h-10 border-2 border-zafting-text/20 border-t-zafting-text rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zafting-text/70 text-sm">{t('payment.pending.subtitle')}</p>
            </>
          )}

          {error && (
            <>
              <p className="text-red-500 text-sm mb-6">{error}</p>
              <Link
                to={`/${language}`}
                className="font-sans inline-block px-6 py-3 rounded-xl text-sm font-medium bg-zafting-text text-white hover:opacity-90 transition-opacity"
              >
                {t('payment.goHome')}
              </Link>
            </>
          )}

          {order && isPending && (
            <>
              <div className="w-10 h-10 border-2 border-zafting-text/20 border-t-zafting-text rounded-full animate-spin mx-auto mb-4" />
              <h1 className="font-serif text-2xl md:text-3xl text-zafting-text mb-2">
                {t('payment.pending.title')}
              </h1>
              <p className="font-sans text-sm text-zafting-text/60 dir-ltr">
                {t('payment.orderCode')}: {order.orderCode}
              </p>
            </>
          )}

          {order && isSuccess && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center shrink-0 mx-auto mb-4">
                <CheckCircle2 size={30} />
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-zafting-text">
                {t('payment.success.title')}
              </h1>
              <p className="font-sans text-zafting-text/70 mt-3 max-w-xl mx-auto">
                {t('payment.success.subtitle')}
              </p>

              <div className="mt-8 rounded-2xl border border-zafting-text/10 bg-white/50 p-5 max-w-sm mx-auto">
                <p className="font-sans text-xs uppercase tracking-widest text-zafting-text/50">
                  {t('payment.orderCode')}
                </p>
                <p className="font-mono text-sm md:text-base text-zafting-text mt-2 dir-ltr break-all">
                  {order.orderCode}
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to={`/${language}/dashboard/orders`}
                  className="font-sans inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-zafting-text text-white hover:opacity-90 transition-opacity"
                >
                  <ReceiptText size={18} />
                  {t('payment.goToOrders')}
                  {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                </Link>
                <Link
                  to={`/${language}`}
                  className="font-sans inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors"
                >
                  <Home size={18} />
                  {t('payment.goHome')}
                </Link>
              </div>
            </>
          )}

          {order && isFailed && (
            <>
              <h1 className="font-serif text-3xl md:text-4xl text-zafting-text">
                {t('payment.failed.title')}
              </h1>
              <p className="font-sans text-zafting-text/70 mt-4">{t('payment.failed.subtitle')}</p>
              <p className="font-sans text-sm text-zafting-text/60 mt-4 dir-ltr">
                {t('payment.orderCode')}: {order.orderCode}
              </p>
              <div className="flex gap-3 mt-8 justify-center">
                <Link
                  to={`/${language}/checkout`}
                  className="font-sans px-6 py-3 rounded-xl text-sm font-medium bg-zafting-text text-white hover:opacity-90 transition-opacity"
                >
                  {t('payment.tryAgain')}
                </Link>
                <Link
                  to={`/${language}/dashboard/orders`}
                  className="font-sans px-6 py-3 rounded-xl text-sm font-medium border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors"
                >
                  {t('payment.goToOrders')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
