import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export const PaymentFailed: React.FC = () => {
  const { t, language } = useLanguage();
  const [params] = useSearchParams();
  const orderId = params.get('orderId');

  return (
    <div className="px-6 max-w-3xl mx-auto pt-28 pb-20 animate-fade-in">
      <h1 className="font-serif text-3xl md:text-4xl text-zafting-text">
        {t('payment.failed.title')}
      </h1>
      <p className="font-sans text-zafting-text/70 mt-4">
        {t('payment.failed.subtitle')}
      </p>
      {orderId ? (
        <p className="font-sans text-sm text-zafting-text/60 mt-4 dir-ltr">
          {t('payment.orderId')}: {orderId}
        </p>
      ) : null}
      <div className="flex gap-3 mt-8">
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
    </div>
  );
};

