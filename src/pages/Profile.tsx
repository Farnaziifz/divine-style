import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export const Profile: React.FC = () => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen pt-24 px-6 flex flex-col items-center animate-fade-in">
        <div className="w-full max-w-4xl">
            <h1 className="font-serif text-5xl mb-12">{t('profile.title')}</h1>
            <div className="bg-white/50 backdrop-blur-md rounded-[2rem] p-8 md:p-12 border border-white/40 flex flex-col items-center text-center gap-6">
                 <div className="w-32 h-32 rounded-full bg-zafting-text text-[#E8E0D9] flex items-center justify-center">
                     <User size={64} />
                 </div>
                 <h2 className="font-serif text-3xl">Fashion Enthusiast</h2>
                 <p className="opacity-60">+1 (555) 123-4567</p>
                 
                 <div className="w-full h-[1px] bg-zafting-text/10 my-4"></div>
                 
                 <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-bold uppercase tracking-widest text-sm"
                 >
                     <LogOut size={18} /> {t('profile.logout')}
                 </button>
            </div>
        </div>
    </div>
  );
};
