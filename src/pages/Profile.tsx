import React, { useMemo, useState, useEffect } from 'react';
import { User, LogOut, Loader2, Trash2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { DashboardPageHeader } from '../components/dashboard/DashboardPageHeader';
import { DashboardCard, DashboardCardHeader } from '../components/dashboard/DashboardCard';
import { userService } from '../services/user.service';
import { IRAN_PROVINCES } from '../constants/iranLocations';

type UserAddress = {
  id: string;
  province: string;
  city: string;
  address: string;
  plaque?: string;
  unit?: string;
  postalCode?: string;
  isDefault?: boolean;
};

export const Profile: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [job, setJob] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [formProvince, setFormProvince] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPlaque, setFormPlaque] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formPostalCode, setFormPostalCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<'success' | 'error' | null>(null);

  const citiesForSelectedProvince = useMemo(() => {
    const entry = IRAN_PROVINCES.find((p) => p.province === formProvince);
    return entry?.cities ?? [];
  }, [formProvince]);

  const normalizeDigits = (input: string) => {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    let out = input;
    for (let i = 0; i < 10; i++) {
      out = out.replace(new RegExp(persianDigits[i], 'g'), String(i));
    }
    return out.replace(/[^\d]/g, '');
  };

  const normalizeAddresses = (raw: any): UserAddress[] => {
    const list = Array.isArray(raw) ? raw : [];
    const mapped = list
      .map((a: any) => {
        const province = typeof a?.province === 'string' ? a.province : '';
        const city = typeof a?.city === 'string' ? a.city : '';
        const address = typeof a?.address === 'string' ? a.address : '';
        if (!province || !city || !address) return null;
        const id =
          typeof a?.id === 'string' && a.id ? a.id : crypto.randomUUID();
        const plaque = typeof a?.plaque === 'string' ? a.plaque : undefined;
        const unit = typeof a?.unit === 'string' ? a.unit : undefined;
        const postalCode =
          typeof a?.postalCode === 'string' && a.postalCode
            ? normalizeDigits(a.postalCode)
            : undefined;
        const isDefault = a?.isDefault === true;
        return { id, province, city, address, plaque, unit, postalCode, isDefault } as UserAddress;
      })
      .filter(Boolean) as UserAddress[];

    if (mapped.length === 0) return [];
    const hasDefault = mapped.some((a) => a.isDefault);
    if (!hasDefault) {
      mapped[0] = { ...mapped[0], isDefault: true };
    }
    return mapped.map((a) => ({ ...a, isDefault: a.isDefault === true }));
  };

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setLastName(user.lastName ?? '');
      setJob(user.job ?? '');
      setNationalCode(user.nationalCode ?? '');
      setAddresses(normalizeAddresses(user.addresses));
    }
  }, [user]);

  useEffect(() => {
    if (!formProvince) {
      if (formCity) setFormCity('');
      return;
    }
    const cities = citiesForSelectedProvince;
    if (formCity && !cities.includes(formCity)) setFormCity('');
  }, [formProvince, formCity, citiesForSelectedProvince]);

  const startAddAddress = () => {
    setEditingAddressId(null);
    setFormProvince('');
    setFormCity('');
    setFormAddress('');
    setFormPlaque('');
    setFormUnit('');
    setFormPostalCode('');
  };

  const startEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setFormProvince(addr.province);
    setFormCity(addr.city);
    setFormAddress(addr.address);
    setFormPlaque(addr.plaque ?? '');
    setFormUnit(addr.unit ?? '');
    setFormPostalCode(addr.postalCode ?? '');
  };

  const saveAddressToState = () => {
    const province = formProvince.trim();
    const city = formCity.trim();
    const address = formAddress.trim();
    if (!province || !city || !address) return;
    const postal = formPostalCode ? normalizeDigits(formPostalCode) : '';
    const next: UserAddress = {
      id: editingAddressId ?? crypto.randomUUID(),
      province,
      city,
      address,
      plaque: formPlaque.trim() || undefined,
      unit: formUnit.trim() || undefined,
      postalCode: postal || undefined,
    };

    setAddresses((prev) => {
      const hasDefault = prev.some((a) => a.isDefault);
      if (!hasDefault && prev.length === 0) {
        next.isDefault = true;
      }
      const updated = editingAddressId
        ? prev.map((a) => (a.id === editingAddressId ? { ...a, ...next } : a))
        : [...prev, next];
      const anyDefault = updated.some((a) => a.isDefault);
      if (!anyDefault && updated.length > 0) {
        updated[0] = { ...updated[0], isDefault: true };
      }
      return updated;
    });

    startAddAddress();
  };

  const removeAddress = (id: string) => {
    setAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (next.length === 0) return [];
      const hasDefault = next.some((a) => a.isDefault);
      if (hasDefault) return next;
      next[0] = { ...next[0], isDefault: true };
      return next;
    });
    if (editingAddressId === id) startAddAddress();
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

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
        addresses:
          addresses.length > 0
            ? addresses.map((a) => ({
                id: a.id,
                province: a.province,
                city: a.city,
                address: a.address,
                ...(a.plaque ? { plaque: a.plaque } : {}),
                ...(a.unit ? { unit: a.unit } : {}),
                ...(a.postalCode ? { postalCode: a.postalCode } : {}),
                ...(a.isDefault ? { isDefault: true } : {}),
              }))
            : undefined,
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

            <div className="pt-3">
              <h3 className="font-serif text-lg text-zafting-text mb-3">
                {t('profile.address.title')}
              </h3>
              {addresses.length > 0 && (
                <div className="grid grid-cols-1 gap-4 mb-6">
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className="border border-zafting-text/10 bg-white/40 rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDefaultAddress(a.id)}
                              className={`w-4 h-4 rounded-full border ${a.isDefault ? 'bg-zafting-text border-zafting-text' : 'border-zafting-text/30'}`}
                              aria-label="set-default-address"
                            />
                            <p className="font-sans text-sm text-zafting-text/80 truncate">
                              {a.province} - {a.city}
                            </p>
                            {a.isDefault ? (
                              <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-zafting-text/10 text-zafting-text">
                                {t('profile.address.default')}
                              </span>
                            ) : null}
                          </div>
                          <p className="font-sans text-sm text-zafting-text/70 mt-2">
                            {a.address}
                          </p>
                          <p className="font-sans text-xs text-zafting-text/60 mt-2">
                            {(a.plaque ? `${t('profile.address.plaque')}: ${a.plaque}` : '')}
                            {(a.unit ? `  ${t('profile.address.unit')}: ${a.unit}` : '')}
                            {(a.postalCode ? `  ${t('profile.address.postalCode')}: ${a.postalCode}` : '')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditAddress(a)}
                            className="w-9 h-9 flex items-center justify-center rounded-full border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors"
                            aria-label="edit-address"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAddress(a.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="remove-address"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="profile-province" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                    {t('profile.address.province')}
                  </label>
                  <select
                    id="profile-province"
                    value={formProvince}
                    onChange={(e) => setFormProvince(e.target.value)}
                    className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text"
                  >
                    <option value="">{language === 'fa' ? 'انتخاب استان' : 'Select province'}</option>
                    {IRAN_PROVINCES.map((p) => (
                      <option key={p.province} value={p.province}>
                        {p.province}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="profile-city" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                    {t('profile.address.city')}
                  </label>
                  <select
                    id="profile-city"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    disabled={!formProvince}
                    className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text disabled:opacity-60"
                  >
                    <option value="">{language === 'fa' ? 'انتخاب شهر' : 'Select city'}</option>
                    {citiesForSelectedProvince.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="profile-address" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                  {t('profile.address.line')}
                </label>
                <textarea
                  id="profile-address"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text min-h-[110px]"
                  placeholder={language === 'fa' ? 'خیابان، کوچه، پلاک، طبقه...' : 'Street, alley, ...'}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
                <div>
                  <label htmlFor="profile-plaque" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                    {t('profile.address.plaque')}
                  </label>
                  <input
                    id="profile-plaque"
                    type="text"
                    value={formPlaque}
                    onChange={(e) => setFormPlaque(e.target.value)}
                    className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text"
                    placeholder={language === 'fa' ? 'پلاک' : 'Plaque'}
                  />
                </div>
                <div>
                  <label htmlFor="profile-unit" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                    {t('profile.address.unit')}
                  </label>
                  <input
                    id="profile-unit"
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text"
                    placeholder={language === 'fa' ? 'واحد' : 'Unit'}
                  />
                </div>
                <div>
                  <label htmlFor="profile-postalCode" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                    {t('profile.address.postalCode')}
                  </label>
                  <input
                    id="profile-postalCode"
                    type="text"
                    value={formPostalCode}
                    onChange={(e) => setFormPostalCode(e.target.value)}
                    className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text dir-ltr"
                    placeholder={language === 'fa' ? '۱۰ رقم' : '10 digits'}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={saveAddressToState}
                  className="font-sans px-5 py-3 rounded-xl text-sm font-medium bg-zafting-text text-white hover:opacity-90 transition-opacity"
                >
                  {t('profile.address.save')}
                </button>
                <button
                  type="button"
                  onClick={startAddAddress}
                  className="font-sans px-5 py-3 rounded-xl text-sm font-medium border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors"
                >
                  {t('profile.address.cancel')}
                </button>
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
