import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useParams, useNavigate } from 'react-router-dom';
import { User, Package, Heart, ShoppingBag, LogOut, Menu, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { DashboardTopBar } from '../components/dashboard/DashboardTopBar';

const SIDEBAR_WIDTH = '18rem'; // w-72

export const DashboardLayout: React.FC = () => {
  const { t, language } = useLanguage();
  const { lang } = useParams<{ lang: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const base = `/${lang || 'fa'}/dashboard`;
  const isRtl = language === 'fa';
  const isInAdminArea = location.pathname.includes('/dashboard/admin/');

  const navItems = [
    { to: 'profile', key: 'dashboard.menu.profile', icon: User },
    { to: 'addresses', key: 'dashboard.menu.addresses', icon: MapPin },
    { to: 'orders', key: 'dashboard.menu.orders', icon: Package },
    { to: 'favorites', key: 'dashboard.menu.favorites', icon: Heart },
    { to: 'cart', key: 'dashboard.menu.cart', icon: ShoppingBag },
  ];

  const handleLogout = () => {
    logout();
    navigate(`/${language}`);
  };

  const displayName =
    user?.name || user?.lastName
      ? [user?.name, user?.lastName].filter(Boolean).join(' ')
      : user?.mobile || '—';

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-zafting-text/10">
        <Link
          to={`/${lang}/shop`}
          className="font-serif text-xl font-semibold tracking-tight text-zafting-text hover:opacity-80"
        >
          {t('nav.title')}
        </Link>
<p className="font-sans text-xs text-zafting-text/50 mt-1 uppercase tracking-widest">
            {language === 'fa' ? 'حساب من' : 'My Account'}
          </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map(({ to, key, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={`${base}/${to}`}
                end={to === 'profile'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `font-sans flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zafting-text text-white shadow-md'
                      : 'text-zafting-text/80 hover:bg-zafting-text/5 hover:text-zafting-text'
                  }`
                }
              >
                <Icon size={20} strokeWidth={1.75} />
                {t(key)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-zafting-text/10 space-y-2">
        {isInAdminArea && (
          <button
            type="button"
            onClick={() => {
              setSidebarOpen(false);
              navigate(`${base}/orders`);
            }}
            className="font-sans w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border border-zafting-text/15 hover:bg-zafting-text/5 transition-colors"
          >
            {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            {t('dashboard.admin.exit')}
          </button>
        )}
        <div className="px-4 py-3 rounded-lg bg-zafting-text/5">
          <p className="font-serif text-sm font-medium text-zafting-text truncate">{displayName}</p>
          {user?.mobile && (
            <p className="font-sans text-xs text-zafting-text/50 dir-ltr mt-0.5 font-mono">{user.mobile}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="font-sans w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          {t('profile.logout')}
        </button>
      </div>
    </>
  );

  return (
    <div
      className="min-h-screen bg-[#f5f3f0]"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ paddingTop: '4rem' }}
    >
      <DashboardTopBar onMenuClick={() => setSidebarOpen(true)} />

      {/* Mobile: sidebar as overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`
          fixed top-16 bottom-0 z-50 w-72 flex flex-col bg-white border-e border-zafting-text/10 shadow-xl
          transition-transform duration-300 ease-out
          lg:!translate-x-0
          ${isRtl ? 'right-0' : 'left-0'}
          ${sidebarOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Desktop: grid so content is beside sidebar; first column = sidebar area, second = main */}
      <div
        className="lg:grid min-h-[calc(100vh-4rem)]"
        style={{ gridTemplateColumns: `${SIDEBAR_WIDTH} 1fr` }}
      >
        {/* Sidebar column: placeholder so main stays in second column and is never under sidebar */}
        <div className="hidden lg:block shrink-0 w-72" aria-hidden />

        {/* Main content column - always visible and accessible */}
        <main className="min-w-0 overflow-auto">
          <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
