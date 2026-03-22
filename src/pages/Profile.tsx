import React, { useState, useEffect } from 'react';
import { User, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { DashboardPageHeader } from '../components/dashboard/DashboardPageHeader';
import { DashboardCard, DashboardCardHeader } from '../components/dashboard/DashboardCard';
import { userService } from '../services/user.service';

export const Profile: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [job, setJob] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setLastName(user.lastName ?? '');
      setJob(user.job ?? '');
      setNationalCode(user.nationalCode ?? '');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate(`/${language}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const updated = await userService.updateProfile({
        name: name.trim() || undefined,
        lastName: lastName.trim() || undefined,
        job: job.trim() || undefined,
        nationalCode: nationalCode.trim() || undefined,
      });
      updateUser(updated);
      setMessage('success');
    } catch {
      setMessage('error');
    } finally {
      setSaving(false);
    }
  };

  const displayName =
    user?.name || user?.lastName
      ? [user?.name, user?.lastName].filter(Boolean).join(' ')
      : user?.mobile || t('profile.title');

  return (
    <div className="animate-fade-in">
      <DashboardPageHeader title={t('profile.title')} />

      <div className="space-y-6">
        {/* Summary card */}
        <DashboardCard>
          <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-zafting-text/10 text-zafting-text flex items-center justify-center shrink-0">
              <User size={40} strokeWidth={1.5} />
            </div>
            <div className="text-center sm:text-start flex-1 min-w-0">
              <h2 className="font-serif text-xl font-semibold text-zafting-text truncate">
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

        {/* Edit profile form */}
        <DashboardCard>
          <DashboardCardHeader
            title={t('profile.edit')}
            subtitle={language === 'fa' ? 'نام، نام خانوادگی و سایر اطلاعات را ویرایش کنید' : 'Edit your name, last name and other details'}
          />
          <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-5">
            {message === 'success' && (
              <p className="font-sans text-sm text-green-600 bg-green-50 py-2 px-3 rounded-lg">
                {t('profile.saved')}
              </p>
            )}
            {message === 'error' && (
              <p className="font-sans text-sm text-red-600 bg-red-50 py-2 px-3 rounded-lg">
                {language === 'fa' ? 'خطا در به‌روزرسانی. دوباره تلاش کنید.' : 'Update failed. Please try again.'}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="profile-name" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                  {t('profile.name')}
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text"
                  placeholder={language === 'fa' ? 'نام' : 'First name'}
                />
              </div>
              <div>
                <label htmlFor="profile-lastName" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                  {t('profile.lastName')}
                </label>
                <input
                  id="profile-lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text"
                  placeholder={language === 'fa' ? 'نام خانوادگی' : 'Last name'}
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile-mobile" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                {t('profile.mobile')}
              </label>
              <input
                id="profile-mobile"
                type="text"
                value={user?.mobile ?? ''}
                readOnly
                className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-zafting-text/5 text-zafting-text/70 dir-ltr font-mono cursor-not-allowed"
              />
              <p className="font-sans text-xs text-zafting-text/50 mt-1">
                {language === 'fa' ? 'شماره موبایل قابل تغییر نیست' : 'Mobile number cannot be changed'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="profile-job" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                  {t('profile.job')}
                </label>
                <input
                  id="profile-job"
                  type="text"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text"
                  placeholder={language === 'fa' ? 'شغل' : 'Job'}
                />
              </div>
              <div>
                <label htmlFor="profile-nationalCode" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                  {t('profile.nationalCode')}
                </label>
                <input
                  id="profile-nationalCode"
                  type="text"
                  value={nationalCode}
                  onChange={(e) => setNationalCode(e.target.value)}
                  className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text dir-ltr"
                  placeholder={language === 'fa' ? 'کد ملی' : 'National code'}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="font-sans px-6 py-3 rounded-xl text-sm font-medium bg-zafting-text text-white hover:opacity-90 disabled:opacity-70 transition-opacity flex items-center gap-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                {t('profile.save')}
              </button>
            </div>
          </form>
        </DashboardCard>

        {/* Logout */}
        <DashboardCard>
          <div className="p-6 flex items-center justify-between gap-4">
            <p className="font-sans text-sm text-zafting-text/70">
              {language === 'fa'
                ? 'خروج از حساب کاربری در تمام دستگاه‌ها'
                : 'Sign out from your account on all devices'}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="font-sans flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-colors"
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
