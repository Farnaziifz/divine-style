import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { Instagram, Twitter, Facebook, ArrowRight, ArrowLeft } from 'lucide-react';
import enamd from '../../assets/images/home-page/enamd.png';

export const Footer: React.FC = () => {
  const { language, t, direction } = useLanguage();

  const footerLinks = [
    {
      title: language === 'en' ? 'Shop' : 'فروشگاه',
      links: [
        { label: language === 'en' ? 'All Products' : 'همه محصولات', href: `/${language}/shop` },
        { label: language === 'en' ? 'Collections' : 'کالکشن‌ها', href: `/${language}` },
        { label: language === 'en' ? 'New Arrivals' : 'جدیدترین‌ها', href: `/${language}/shop` },
      ]
    },
    {
      title: language === 'en' ? 'About' : 'درباره ما',
      links: [
        { label: language === 'en' ? 'Our Story' : 'داستان ما', href: '#' },
        { label: language === 'en' ? 'Journal' : 'مجله', href: `/${language}/journal` },
        { label: language === 'en' ? 'Contact' : 'تماس با ما', href: `/${language}/contact` },
      ]
    },
    {
      title: language === 'en' ? 'Customer Care' : 'خدمات مشتریان',
      links: [
        { label: language === 'en' ? 'Shipping & Returns' : 'ارسال و مرجوعی', href: '#' },
        { label: language === 'en' ? 'FAQ' : 'سوالات متداول', href: '#' },
        { label: language === 'en' ? 'Terms of Service' : 'قوانین و مقررات', href: '#' },
      ]
    }
  ];

  return (
    <footer className="bg-zafting-text text-zafting-bg pt-20 pb-8 px-6 md:px-12 overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        {/* Top Section: Newsletter & Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-24">
          
          {/* Newsletter */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-3xl md:text-4xl mb-4">
                {language === 'en' ? 'Join the Divine Club' : 'به باشگاه دیواین بپیوندید'}
              </h3>
              <p className="text-zafting-bg/70 font-sans text-sm md:text-base mb-8 max-w-md leading-relaxed">
                {language === 'en' 
                  ? 'Subscribe to receive updates, access to exclusive deals, and more.' 
                  : 'برای دریافت جدیدترین اخبار، دسترسی به پیشنهادات ویژه و بیشتر، مشترک شوید.'}
              </p>
            </div>
            
            <form className="relative max-w-md group" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder={language === 'en' ? 'Enter your email address' : 'آدرس ایمیل خود را وارد کنید'}
                className="w-full bg-transparent border-b border-zafting-bg/30 py-3 pe-12 outline-none font-sans text-sm transition-colors focus:border-zafting-bg placeholder:text-zafting-bg/40"
              />
              <button 
                type="submit"
                className="absolute end-0 top-1/2 -translate-y-1/2 text-zafting-bg/50 hover:text-zafting-bg transition-colors"
                aria-label="Subscribe"
              >
                {direction === 'rtl' ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
              </button>
            </form>
          </div>

          {/* Links */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-6">
                <h4 className="font-serif text-lg tracking-wide">{section.title}</h4>
                <ul className="flex flex-col gap-4">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link 
                        to={link.href}
                        className="font-sans text-sm text-zafting-bg/60 hover:text-zafting-bg transition-colors relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:start-0 after:bg-zafting-bg after:origin-bottom-right hover:after:scale-x-100 hover:after:origin-bottom-left after:transition-transform after:duration-300"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Section: Socials & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-zafting-bg/10 pt-8 mb-12">
          <div className="flex items-center gap-6">
            <a href="#" aria-label="Instagram" className="text-zafting-bg/60 hover:text-zafting-bg transition-colors hover:-translate-y-1 transform duration-300">
              <Instagram size={20} strokeWidth={1.5} />
            </a>
            <a href="#" aria-label="Twitter" className="text-zafting-bg/60 hover:text-zafting-bg transition-colors hover:-translate-y-1 transform duration-300">
              <Twitter size={20} strokeWidth={1.5} />
            </a>
            <a href="#" aria-label="Facebook" className="text-zafting-bg/60 hover:text-zafting-bg transition-colors hover:-translate-y-1 transform duration-300">
              <Facebook size={20} strokeWidth={1.5} />
            </a>
            <a
              target="_blank"
              href="https://trustseal.enamad.ir/?id=717666&Code=mfqMbWBGBvz8O8gbbTWG13WZ6kNDy8tG"
              className="inline-flex items-center"
            >
              <img
                referrerPolicy="origin"
                src={enamd}
                alt={language === 'en' ? 'Enamad' : 'نماد اعتماد الکترونیکی'}
                className="grayscale"
                style={{ cursor: 'pointer', height: 42 }}
              />
            </a>
            {/* <a
              referrerPolicy="origin"
              target="_blank"
              rel="noopener noreferrer"
              href="https://trustseal.enamad.ir/?id=717666&Code=mfqMbWBGBvz8O8gbbTWG13WZ6kNDy8tG"
              className="inline-flex items-center"
            >
              <img
                referrerPolicy="origin"
                src="https://trustseal.enamad.ir/logo.aspx?id=717666&Code=mfqMbWBGBvz8O8gbbTWG13WZ6kNDy8tG"
                alt={language === 'en' ? 'Enamad' : 'نماد اعتماد الکترونیکی'}
                style={{ cursor: 'pointer' }}
                {...({ code: 'mfqMbWBGBvz8O8gbbTWG13WZ6kNDy8tG' } as React.ImgHTMLAttributes<HTMLImageElement>)}
              />
            </a> */}
          </div>
          <div className="font-sans text-xs text-zafting-bg/40 tracking-wider">
            © {new Date().getFullYear()} DIVINE STYLE. {language === 'en' ? 'ALL RIGHTS RESERVED.' : 'تمامی حقوق محفوظ است.'}
          </div>
        </div>

        {/* Bottom Section: Huge Brand Name */}
        <div className="w-full flex justify-center items-center select-none pointer-events-none opacity-90">
          <h1 className="font-serif text-[15vw] leading-none tracking-tighter m-0 p-0 text-zafting-bg">
            DIVINE
          </h1>
        </div>
      </div>
    </footer>
  );
};
