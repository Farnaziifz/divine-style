import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { DashboardPageHeader } from '../components/dashboard/DashboardPageHeader';
import { DashboardCard } from '../components/dashboard/DashboardCard';

export const Profile: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(`/${language}`);
  };

  const displayName =
    user?.name || user?.lastName
      ? [user?.name, user?.lastName].filter(Boolean).join(' ')
      : user?.mobile || t('profile.title');

  return (
    <div className="animate-fade-in">
      <DashboardPageHeader title={t('profile.title')} />

      <div className="space-y-6">
        <DashboardCard>
          <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-zafting-text/10 text-zafting-text flex items-center justify-center shrink-0">
              <User size={40} strokeWidth={1.5} />
            </div>
            <div className="text-center sm:text-start flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-zafting-text truncate">
                {displayName}
              </h2>
              {user?.mobile && (
                <p className="text-zafting-text/60 mt-1 dir-ltr font-mono text-sm">
                  {user.mobile}
                </p>
              )}
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="p-6 flex items-center justify-between gap-4">
            <p className="text-sm text-zafting-text/70">
              {language === 'fa'
                ? 'خروج از حساب کاربری در تمام دستگاه‌ها'
                : 'Sign out from your account on all devices'}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-colors"
            >
              <LogOut size={18} />
              {t('profile.logout')}
            </button>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};
