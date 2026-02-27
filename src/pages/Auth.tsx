import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export const Auth: React.FC = () => {
  const { t, direction } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length > 3) {
      // Mock API call simulation
      setTimeout(() => {
        setStep('otp');
      }, 500);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple chars
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length === 4) {
      // Mock Verification
      setTimeout(() => {
        login();
        navigate('/profile');
      }, 800);
    }
  };

  const BackArrow = direction === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-5xl h-[85vh] bg-[#E8E0D9] rounded-[3rem] shadow-2xl flex overflow-hidden relative animate-fade-in border border-white/40">
        
        {/* Close Button */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 end-8 z-20 w-10 h-10 rounded-full border border-zafting-text/20 flex items-center justify-center text-zafting-text hover:bg-zafting-text hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Left Side (Form) - Order logic handled via flex-row-reverse if needed for RTL, but currently relying on dir="rtl" for alignment */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center relative">
          
          <div className="max-w-md mx-auto w-full">
            <h1 className="font-serif text-3xl md:text-5xl text-zafting-text mb-2">
              {t('nav.title')}
            </h1>
            <h2 className="text-xl opacity-60 font-serif italic mb-12">
              {step === 'phone' ? t('auth.login.title') : t('auth.otp.title')}
            </h2>

            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-8">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold opacity-50 mb-3">
                    {t('auth.login.phone')}
                  </label>
                  <input 
                    type="tel" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t('auth.login.placeholder')}
                    className="w-full bg-white/50 border-b-2 border-zafting-text/20 py-4 px-2 text-xl font-serif focus:outline-none focus:border-zafting-text transition-colors"
                    autoFocus
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-[#2A2A2A] text-[#E8E0D9] py-5 rounded-full uppercase tracking-widest text-xs font-bold hover:scale-[1.02] transition-transform shadow-lg"
                >
                  {t('auth.login.btn')}
                </button>

                <div className="text-center pt-4">
                  <p className="text-sm opacity-60">
                    {t('auth.login.footer')} <button type="button" className="font-bold underline hover:text-zafting-accent">{t('auth.login.signup')}</button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-8 animate-fade-in">
                <div>
                   <button 
                    type="button" 
                    onClick={() => setStep('phone')}
                    className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-50 hover:opacity-100 mb-6"
                   >
                     <BackArrow size={14} /> {t('auth.otp.back')}
                   </button>

                   <p className="text-lg mb-8 font-serif">
                     {t('auth.otp.desc')} <span className="font-sans font-bold">{phoneNumber}</span>
                   </p>

                   <div className="flex gap-4 justify-between max-w-xs mx-auto mb-8" dir="ltr">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-14 h-16 rounded-xl border border-zafting-text/20 bg-white/60 text-center text-3xl font-serif focus:outline-none focus:ring-2 focus:ring-zafting-text focus:border-transparent transition-all"
                        />
                      ))}
                   </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#2A2A2A] text-[#E8E0D9] py-5 rounded-full uppercase tracking-widest text-xs font-bold hover:scale-[1.02] transition-transform shadow-lg"
                >
                  {t('auth.otp.btn')}
                </button>

                <div className="text-center pt-2">
                   <button type="button" className="text-xs uppercase tracking-widest opacity-60 hover:opacity-100 border-b border-zafting-text/30 pb-0.5">
                     {t('auth.otp.resend')}
                   </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Side (Visuals) */}
        <div className="hidden lg:block w-1/2 bg-white relative p-4">
           <div className="grid grid-cols-2 gap-4 h-full">
              <div className="flex flex-col gap-4 pt-12">
                 <div className="rounded-3xl overflow-hidden h-64">
                    <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Jewelry" />
                 </div>
                 <div className="rounded-3xl overflow-hidden flex-1">
                    <img src="https://images.unsplash.com/photo-1596472537510-d3c761bb6aac?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Texture" />
                 </div>
              </div>
              <div className="flex flex-col gap-4">
                 <div className="rounded-3xl overflow-hidden flex-1">
                    <img src="https://images.unsplash.com/photo-1573612664822-d7d342da7b7b?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Fashion" />
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
