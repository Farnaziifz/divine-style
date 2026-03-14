import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Menu, Globe, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface DashboardTopBarProps {
  onMenuClick: () => void;
}

export const DashboardTopBar: React.FC<DashboardTopBarProps> = ({ onMenuClick }) => {
  const { t, language, setLanguage } = useLanguage();
  const { lang } = useParams<{ lang: string }>();

  return (
    <header
      className="fixed top-0 start-0 end-0 h-16 z-50 bg-white border-b border-zafting-text/10 flex items-center justify-between px-4 md:px-6"
      dir={language === 'fa' ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 rounded-lg text-zafting-text hover:bg-zafting-text/5 lg:hidden"
          aria-label="Menu"
        >
          <Menu size={24} />
        </button>
        <Link
          to={`/${lang}`}
          className="font-serif text-lg font-semibold text-zafting-text hover:opacity-80 tracking-tight"
        >
          {t('nav.title')}
        </Link>
        <span className="text-zafting-text/40 hidden sm:inline">/</span>
        <span className="font-sans text-sm text-zafting-text/70 hidden sm:inline">
          {language === 'fa' ? 'حساب من' : 'My Account'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')}
          className="font-sans p-2 rounded-lg text-zafting-text/70 hover:bg-zafting-text/5 text-xs font-medium uppercase"
        >
          <Globe size={18} />
        </button>
        <Link
          to={`/${lang}/shop`}
          className="font-sans flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-zafting-text hover:bg-zafting-text/5"
        >
          {language === 'fa' ? 'فروشگاه' : 'Shop'}
          <ArrowRight size={16} className={language === 'fa' ? 'rotate-180' : ''} />
        </Link>
      </div>
    </header>
  );
};
