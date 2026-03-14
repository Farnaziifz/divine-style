import React from 'react';
import { Package, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link, useParams } from 'react-router-dom';
import { DashboardPageHeader } from '../../components/dashboard/DashboardPageHeader';
import { DashboardCard } from '../../components/dashboard/DashboardCard';

export const DashboardOrders: React.FC = () => {
  const { t, language } = useLanguage();
  const { lang } = useParams<{ lang: string }>();

  return (
    <div className="animate-fade-in">
      <DashboardPageHeader title={t('dashboard.orders.title')} />

      <DashboardCard>
        <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-zafting-text/10 text-zafting-text flex items-center justify-center mb-5">
            <Package size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-medium text-zafting-text mb-2">
            {t('dashboard.orders.empty')}
          </h3>
          <p className="text-sm text-zafting-text/60 max-w-sm mb-8">
            {language === 'fa'
              ? 'با اولین خرید، سفارشات شما اینجا نمایش داده می‌شوند.'
              : 'Your orders will appear here after your first purchase.'}
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
};
