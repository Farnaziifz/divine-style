import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, ArrowRight, Home, ReceiptText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const PaymentSuccess: React.FC = () => {
  const { t, language, direction } = useLanguage();
  const [params] = useSearchParams();
  const orderCode = params.get('orderCode') || params.get('orderId');
  const isRtl = direction === 'rtl';

  return (
    <div className="px-6 max-w-4xl mx-auto pt-28 pb-20 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl border border-white bg-white/40 shadow-xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -end-24 w-72 h-72 rounded-full bg-green-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -start-24 w-72 h-72 rounded-full bg-zafting-text/10 blur-3xl" />
        </div>

        <div className="relative p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <CheckCircle2 size={30} />
              </div>
              <div>
                <h1 className="font-serif text-3xl md:text-4xl text-zafting-text">
                  {t('payment.success.title')}
                </h1>
                <p className="font-sans text-zafting-text/70 mt-3 max-w-xl">
                  {t('payment.success.subtitle')}
                </p>
              </div>
            </div>

            <Link
              to={`/${language}/dashboard/orders`}
              className="font-sans inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-zafting-text text-white hover:opacity-90 transition-opacity"
            >
              <ReceiptText size={18} />
              {t('payment.goToOrders')}
              {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </Link>
          </div>

          {orderCode ? (
            <div className="mt-8 rounded-2xl border border-zafting-text/10 bg-white/50 p-5">
              <p className="font-sans text-xs uppercase tracking-widest text-zafting-text/50">
                {t('payment.orderCode')}
              </p>
              <p className="font-mono text-sm md:text-base text-zafting-text mt-2 dir-ltr break-all">
                {orderCode}
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to={`/${language}/dashboard/orders`}
              className="font-sans inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors"
            >
              <ReceiptText size={18} />
              {t('payment.goToOrders')}
            </Link>
            <Link
              to={`/${language}`}
              className="font-sans inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors"
            >
              <Home size={18} />
              {t('payment.goHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
