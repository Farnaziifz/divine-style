import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, X, KeyRound, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toEnglishDigits } from '../utils/digits';
import { authService } from '../services/auth.service';
import imgLogin1 from '../assets/images/login-page/1.jpg';
import imgLogin2 from '../assets/images/login-page/2.jpg';
import imgLogin3 from '../assets/images/login-page/3.jpg';

const OTP_LENGTH = 5;
const RESEND_COOLDOWN_SEC = 120;

export const Auth: React.FC = () => {
  const { t, direction, language } = useLanguage();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(`/${language}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, language, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = toEnglishDigits(e.target.value);
    if (/^\d*$/.test(value)) setPhoneNumber(value);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const normalized = toEnglishDigits(phoneNumber).trim();
    if (normalized.length < 11 || !/^09\d{9}$/.test(normalized)) {
      setError(language === 'fa' ? 'شماره موبایل معتبر وارد کنید (۰۹xxxxxxxxx)' : 'Enter a valid mobile number (09xxxxxxxxx)');
      return;
    }
    setIsLoading(true);
    try {
      await authService.sendOtp(normalized);
      setStep('otp');
      setOtp(Array(OTP_LENGTH).fill(''));
      setCountdown(RESEND_COOLDOWN_SEC);
      setPassword('');
      setLoginMethod('otp');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || (language === 'fa' ? 'خطا در ارسال کد. دوباره تلاش کنید.' : 'Failed to send code. Try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = toEnglishDigits(value);
    if (!/^\d*$/.test(digit)) return;
    const newOtp = [...otp];
    newOtp[index] = digit.slice(-1);
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    const normalized = toEnglishDigits(phoneNumber).trim();
    try {
      await authService.sendOtp(normalized);
      setCountdown(RESEND_COOLDOWN_SEC);
      setOtp(Array(OTP_LENGTH).fill(''));
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || (language === 'fa' ? 'خطا در ارسال مجدد کد.' : 'Failed to resend code.'));
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const normalizedPhone = toEnglishDigits(phoneNumber).trim();

    try {
      let accessToken: string;
      let refreshToken: string;
      let user: { id: string; mobile: string; role?: string; name?: string | null; lastName?: string | null };

      if (loginMethod === 'otp') {
        const otpValue = otp.join('');
        if (otpValue.length !== OTP_LENGTH) {
          setError(language === 'fa' ? 'کد تایید را کامل وارد کنید.' : 'Please enter the full verification code.');
          setIsLoading(false);
          return;
        }
        const res = await authService.verifyOtp(normalizedPhone, otpValue);
        accessToken = res.accessToken;
        refreshToken = res.refreshToken;
        user = res.user;
      } else {
        if (!password.trim()) {
          setError(language === 'fa' ? 'رمز عبور را وارد کنید.' : 'Please enter your password.');
          setIsLoading(false);
          return;
        }
        const res = await authService.login(normalizedPhone, password);
        accessToken = res.accessToken;
        refreshToken = res.refreshToken;
        user = res.user;
      }

      login(accessToken, refreshToken, user);
      navigate(`/${language}/dashboard`);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || (language === 'fa' ? 'خطا در ورود. دوباره تلاش کنید.' : 'Login failed. Try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const BackArrow = direction === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[85vh] bg-[#E8E0D9] rounded-[3rem] shadow-2xl flex overflow-hidden relative animate-fade-in border border-white/40">
        <button
          onClick={() => navigate(`/${language}`)}
          className="absolute top-8 end-8 z-20 w-10 h-10 rounded-full border border-zafting-text/20 flex items-center justify-center text-zafting-text hover:bg-zafting-text hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center relative">
          <div className="max-w-md mx-auto w-full">
            <h1 className="font-serif text-3xl md:text-5xl text-zafting-text mb-2">
              {t('nav.title')}
            </h1>
            <h2 className="text-xl opacity-60 font-serif italic mb-12">
              {step === 'phone' ? t('auth.login.title') : t('auth.otp.title')}
            </h2>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-100 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-8">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold opacity-50 mb-3">
                    {t('auth.login.phone')}
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder={language === 'fa' ? '۰۹۱۲۳۴۵۶۷۸۹' : t('auth.login.placeholder')}
                    className="w-full bg-white/50 border-b-2 border-zafting-text/20 py-4 px-2 text-xl font-serif focus:outline-none focus:border-zafting-text transition-colors"
                    dir="ltr"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#2A2A2A] text-[#E8E0D9] py-5 rounded-full uppercase tracking-widest text-xs font-bold hover:scale-[1.02] transition-transform shadow-lg disabled:opacity-60"
                >
                  {isLoading ? (language === 'fa' ? 'در حال ارسال...' : 'Sending...') : t('auth.login.btn')}
                </button>
              </form>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setError(''); }}
                  className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-50 hover:opacity-100 mb-6"
                >
                  <BackArrow size={14} /> {t('auth.otp.back')}
                </button>

                <p className="text-lg mb-6 font-serif">
                  {t('auth.otp.desc')} <span className="font-sans font-bold dir-ltr">{phoneNumber}</span>
                </p>

                <div className="flex bg-white/30 p-1 rounded-xl gap-1 mb-6">
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('otp'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${loginMethod === 'otp' ? 'bg-white text-zafting-text shadow-sm' : 'text-zafting-text/70 hover:text-zafting-text'}`}
                  >
                    <Smartphone size={18} />
                    {language === 'fa' ? 'کد تایید' : 'OTP'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginMethod('password'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${loginMethod === 'password' ? 'bg-white text-zafting-text shadow-sm' : 'text-zafting-text/70 hover:text-zafting-text'}`}
                  >
                    <KeyRound size={18} />
                    {language === 'fa' ? 'رمز عبور' : 'Password'}
                  </button>
                </div>

                <form onSubmit={handleVerify} className="space-y-8 animate-fade-in">
                  {loginMethod === 'otp' ? (
                    <div className="flex gap-2 justify-between max-w-xs mx-auto mb-8" dir="ltr">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => { inputRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-12 h-14 rounded-xl border border-zafting-text/20 bg-white/60 text-center text-2xl font-serif focus:outline-none focus:ring-2 focus:ring-zafting-text"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label className="block text-xs uppercase tracking-widest font-bold opacity-50 mb-2">
                        {language === 'fa' ? 'رمز عبور' : 'Password'}
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/50 border-b-2 border-zafting-text/20 py-4 px-2 text-lg focus:outline-none focus:border-zafting-text"
                        placeholder={language === 'fa' ? 'رمز عبور' : 'Password'}
                        autoFocus
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || (loginMethod === 'otp' && otp.some((d) => !d)) || (loginMethod === 'password' && !password.trim())}
                    className="w-full bg-[#2A2A2A] text-[#E8E0D9] py-5 rounded-full uppercase tracking-widest text-xs font-bold hover:scale-[1.02] transition-transform shadow-lg disabled:opacity-60"
                  >
                    {isLoading ? (language === 'fa' ? 'در حال بررسی...' : 'Verifying...') : t('auth.otp.btn')}
                  </button>

                  {loginMethod === 'otp' && (
                    <div className="text-center pt-2">
                      {countdown > 0 ? (
                        <p className="text-xs opacity-60 font-mono dir-ltr">
                          {language === 'fa' ? `ارسال مجدد (${countdown})` : `Resend (${countdown}s)`}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100 border-b border-zafting-text/30 pb-0.5"
                        >
                          {t('auth.otp.resend')}
                        </button>
                      )}
                    </div>
                  )}
                </form>
              </>
            )}
          </div>
        </div>

        <div className="hidden lg:block w-1/2 bg-white relative p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="flex flex-col gap-4 pt-12">
              <div className="rounded-3xl overflow-hidden h-64">
                <img src={imgLogin1} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="" />
              </div>
              <div className="rounded-3xl overflow-hidden flex-1">
                <img src={imgLogin2} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="" />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-3xl overflow-hidden flex-1">
                <img src={imgLogin3} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="" />
              </div>
              <div className="rounded-3xl overflow-hidden h-48 bg-[#2A2A2A] flex items-center justify-center text-[#E8E0D9] p-6 text-center">
                <p className="font-serif italic text-xl">"Simplicity is the keynote of all true elegance."</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
