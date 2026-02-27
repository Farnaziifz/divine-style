import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroProps {
  featuredProduct: Product;
  onAddToCart: (product: Product) => void;
}

export const Hero: React.FC<HeroProps> = ({ featuredProduct, onAddToCart }) => {
  const { t, direction } = useLanguage();
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-screen w-full flex flex-col lg:flex-row items-center justify-center px-4 pt-20 overflow-hidden">
      
      {/* Background/Layout Grid Elements (Decoration) */}
      <div className="absolute top-1/4 start-1/4 w-64 h-64 rounded-full bg-white opacity-20 blur-3xl pointer-events-none"></div>

      {/* Text Content */}
      <div className="z-10 w-full lg:w-1/2 flex flex-col justify-center items-start lg:ps-20 mb-12 lg:mb-0">
        <h1 className="font-serif text-6xl md:text-8xl xl:text-9xl leading-[0.9] text-zafting-text">
          {t('hero.headline.1')} <br />
          <span className="italic text-outline">{t('hero.headline.2')}</span> <br />
          {t('hero.headline.3')}
        </h1>
        
        <div className="mt-12 flex gap-4">
            <button className="bg-zafting-text text-[#E8E0D9] px-8 py-3 rounded-full font-sans text-sm tracking-wide uppercase hover:bg-opacity-90 transition-all duration-300">
                {t('hero.cta')}
            </button>
        </div>
      </div>

      {/* Image Content */}
      <div className="relative w-full lg:w-1/2 flex justify-center items-center h-[60vh] lg:h-auto">
        {/* Main Image Container */}
        <div className="relative w-[80%] max-w-md aspect-[3/4]">
           {/* Abstract shape behind image */}
           <div className="absolute inset-0 bg-white/30 rounded-t-[100px] rounded-b-[100px] blur-sm transform scale-95 translate-y-4"></div>
           
           <img 
            src={featuredProduct.image} 
            alt={featuredProduct.name}
            className="w-full h-full object-cover rounded-t-[100px] rounded-b-[100px] shadow-2xl relative z-10 brightness-90 contrast-110"
           />

           {/* Floating Product Card (Glassmorphism) */}
           <div className="absolute bottom-8 -end-4 md:-end-12 z-20 backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-2xl shadow-lg w-64">
              <div className="flex justify-between items-end">
                <div>
                    <h3 className="font-serif text-2xl text-zafting-text">{featuredProduct.name}</h3>
                    <p className="text-xs text-zafting-text/80 mt-1 font-sans font-light">
                        {featuredProduct.description}
                    </p>
                    <p className="text-lg font-medium mt-2">${featuredProduct.price}</p>
                </div>
                <button 
                    onClick={() => onAddToCart(featuredProduct)}
                    className="p-3 bg-transparent border border-zafting-text/30 rounded-full hover:bg-zafting-text hover:text-[#E8E0D9] transition-colors group"
                    aria-label={t('hero.cta')}
                >
                    <ArrowIcon size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
              
              {/* Pagination Dots */}
              <div className="flex gap-2 mt-4">
                  <span className="w-2 h-2 rounded-full bg-zafting-text"></span>
                  <span className="w-2 h-2 rounded-full bg-zafting-text/30"></span>
                  <span className="w-2 h-2 rounded-full bg-zafting-text/30"></span>
              </div>
           </div>
           
           {/* Decorative Cursor circle from design */}
           <div className="absolute top-1/2 start-0 -translate-x-1/2 rtl:translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/40 flex items-center justify-center backdrop-blur-sm">
             <div className="w-2 h-2 bg-white rounded-full"></div>
           </div>
        </div>
      </div>
    </section>
  );
};