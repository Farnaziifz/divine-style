import React, { useMemo, useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardPageHeader } from '../../components/dashboard/DashboardPageHeader';
import { DashboardCard, DashboardCardHeader } from '../../components/dashboard/DashboardCard';
import { IRAN_PROVINCES } from '../../constants/iranLocations';
import { userService, UserAddress } from '../../services/user.service';

export const DashboardAddresses: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, updateUser } = useAuth();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formProvince, setFormProvince] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPlaque, setFormPlaque] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formPostalCode, setFormPostalCode] = useState('');
  const [busy, setBusy] = useState(false);

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
        const id = typeof a?.id === 'string' && a.id ? a.id : '';
        const province = typeof a?.province === 'string' ? a.province : '';
        const city = typeof a?.city === 'string' ? a.city : '';
        const address = typeof a?.address === 'string' ? a.address : '';
        if (!id || !province || !city || !address) return null;
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

  const resetForm = () => {
    setEditingAddressId(null);
    setFormProvince('');
    setFormCity('');
    setFormAddress('');
    setFormPlaque('');
    setFormUnit('');
    setFormPostalCode('');
  };

  useEffect(() => {
    let cancelled = false;
    userService
      .getMyAddresses()
      .then((data) => {
        if (cancelled) return;
        setAddresses(normalizeAddresses(data));
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!formProvince) {
      if (formCity) setFormCity('');
      return;
    }
    const cities = citiesForSelectedProvince;
    if (formCity && !cities.includes(formCity)) setFormCity('');
  }, [citiesForSelectedProvince, formCity, formProvince]);

  const startEdit = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setFormProvince(addr.province);
    setFormCity(addr.city);
    setFormAddress(addr.address);
    setFormPlaque(addr.plaque ?? '');
    setFormUnit(addr.unit ?? '');
    setFormPostalCode(addr.postalCode ?? '');
    setIsModalOpen(true);
  };

  const saveAddress = async () => {
    const province = formProvince.trim();
    const city = formCity.trim();
    const address = formAddress.trim();
    if (!province || !city || !address) return;
    const postal = formPostalCode ? normalizeDigits(formPostalCode) : '';

    setBusy(true);
    try {
      const payload = {
        province,
        city,
        address,
        plaque: formPlaque.trim() || undefined,
        unit: formUnit.trim() || undefined,
        postalCode: postal || undefined,
      };

      const updated = editingAddressId
        ? await userService.updateMyAddress(editingAddressId, payload)
        : await userService.addMyAddress(payload);

      setAddresses(normalizeAddresses(updated));
      if (user) {
        updateUser({ ...user, addresses: updated });
      }
      resetForm();
      setIsModalOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const removeAddress = async (id: string) => {
    setBusy(true);
    try {
      const updated = await userService.deleteMyAddress(id);
      setAddresses(normalizeAddresses(updated));
      if (user) {
        updateUser({ ...user, addresses: updated });
      }
      if (editingAddressId === id) resetForm();
    } finally {
      setBusy(false);
    }
  };

  const setDefault = async (id: string) => {
    setBusy(true);
    try {
      const updated = await userService.updateMyAddress(id, { isDefault: true });
      setAddresses(normalizeAddresses(updated));
      if (user) {
        updateUser({ ...user, addresses: updated });
      }
    } finally {
      setBusy(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="animate-fade-in">
      <DashboardPageHeader title={t('profile.address.title')} />

      <DashboardCard>
        <DashboardCardHeader
          title={t('profile.address.title')}
          subtitle={language === 'fa' ? 'آدرس‌های ارسال خود را مدیریت کنید' : 'Manage your shipping addresses'}
        />

        <div className="p-6 pt-0">
          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={openCreateModal}
              className="font-sans px-5 py-3 rounded-xl text-sm font-medium bg-zafting-text text-white hover:opacity-90 transition-opacity flex items-center gap-2"
              disabled={busy}
            >
              <Plus size={18} />
              {t('profile.address.addNew')}
            </button>
          </div>

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
                          onClick={() => setDefault(a.id)}
                          className={`w-4 h-4 rounded-full border ${a.isDefault ? 'bg-zafting-text border-zafting-text' : 'border-zafting-text/30'}`}
                          aria-label="set-default-address"
                          disabled={busy}
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
                        onClick={() => startEdit(a)}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors"
                        aria-label="edit-address"
                        disabled={busy}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAddress(a.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="remove-address"
                        disabled={busy}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardCard>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            aria-label="close-address-modal"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-2xl bg-zafting-bg border border-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-xl text-zafting-text">
                {editingAddressId ? t('profile.address.save') : t('profile.address.addNew')}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-zafting-text/15 hover:bg-zafting-text/5 transition-colors"
                aria-label="close-modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="modal-province" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                  {t('profile.address.province')}
                </label>
                <select
                  id="modal-province"
                  value={formProvince}
                  onChange={(e) => setFormProvince(e.target.value)}
                  className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text"
                  disabled={busy}
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
                <label htmlFor="modal-city" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                  {t('profile.address.city')}
                </label>
                <select
                  id="modal-city"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  disabled={!formProvince || busy}
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
              <label htmlFor="modal-address" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                {t('profile.address.line')}
              </label>
              <textarea
                id="modal-address"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text min-h-[120px]"
                placeholder={language === 'fa' ? 'خیابان، کوچه، پلاک، طبقه...' : 'Street, alley, ...'}
                disabled={busy}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">
              <div>
                <label htmlFor="modal-plaque" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                  {t('profile.address.plaque')}
                </label>
                <input
                  id="modal-plaque"
                  type="text"
                  value={formPlaque}
                  onChange={(e) => setFormPlaque(e.target.value)}
                  className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text"
                  placeholder={language === 'fa' ? 'پلاک' : 'Plaque'}
                  disabled={busy}
                />
              </div>
              <div>
                <label htmlFor="modal-unit" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                  {t('profile.address.unit')}
                </label>
                <input
                  id="modal-unit"
                  type="text"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text"
                  placeholder={language === 'fa' ? 'واحد' : 'Unit'}
                  disabled={busy}
                />
              </div>
              <div>
                <label htmlFor="modal-postalCode" className="font-sans block text-sm font-medium text-zafting-text/80 mb-1.5">
                  {t('profile.address.postalCode')}
                </label>
                <input
                  id="modal-postalCode"
                  type="text"
                  value={formPostalCode}
                  onChange={(e) => setFormPostalCode(e.target.value)}
                  className="font-sans w-full px-4 py-3 rounded-xl border border-zafting-text/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-zafting-text/30 focus:border-zafting-text dir-ltr"
                  placeholder={language === 'fa' ? '۱۰ رقم' : '10 digits'}
                  disabled={busy}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={saveAddress}
                disabled={busy}
                className="font-sans px-6 py-3 rounded-xl text-sm font-medium bg-zafting-text text-white hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {t('profile.address.save')}
              </button>
              <button
                type="button"
                onClick={closeModal}
                disabled={busy}
                className="font-sans px-6 py-3 rounded-xl text-sm font-medium border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors disabled:opacity-70"
              >
                {t('profile.address.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
