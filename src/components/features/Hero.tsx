import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Product } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatPriceToman } from '../../utils/format';

interface HeroProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export const Hero: React.FC<HeroProps> = ({ products, onProductClick }) => {
  const { t, direction } = useLanguage();
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const safeProducts = useMemo(() => products.filter((p) => p && p.id), [products]);
  const [activeIndex, setActiveIndex] = useState(0);
  const canSlide = safeProducts.length > 1;
  const dragStateRef = useRef<{
    pointerId: number | null;
    startX: number;
    active: boolean;
    moved: boolean;
  }>({ pointerId: null, startX: 0, active: false });

  useEffect(() => {
    setActiveIndex(0);
  }, [safeProducts.length]);

  useEffect(() => {
    if (!canSlide) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safeProducts.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [canSlide, safeProducts.length]);

  if (safeProducts.length === 0) return null;

  const activeProduct = safeProducts[activeIndex] ?? safeProducts[0];
  const goTo = (index: number) => {
    const len = safeProducts.length;
    if (len <= 0) return;
    const next = ((index % len) + len) % len;
    setActiveIndex(next);
  };
  const goNext = () => goTo(activeIndex + 1);
  const goPrev = () => goTo(activeIndex - 1);
  const swipeThreshold = 20;
  const swipeStartThreshold = 4;

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
      </div>

      {/* Image Content */}
      <div className="relative w-full lg:w-1/2 flex justify-center items-center h-[60vh] lg:h-auto">
        {/* Main Image Container */}
        <div
          className="relative w-[80%] max-w-md aspect-[3/4]"
          style={{ touchAction: 'pan-y' }}
          onPointerDown={(e) => {
            if (!canSlide) return;
            const target = e.target as HTMLElement | null;
            if (target?.closest('button')) return;
            dragStateRef.current = {
              pointerId: e.pointerId,
              startX: e.clientX,
              active: true,
              moved: false,
            };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!canSlide) return;
            if (!dragStateRef.current.active || dragStateRef.current.pointerId !== e.pointerId) return;
            const delta = e.clientX - dragStateRef.current.startX;
            if (Math.abs(delta) >= swipeStartThreshold) {
              dragStateRef.current.moved = true;
            }
          }}
          onPointerUp={(e) => {
            if (!canSlide) return;
            if (!dragStateRef.current.active || dragStateRef.current.pointerId !== e.pointerId) return;
            const delta = e.clientX - dragStateRef.current.startX;
            const moved = dragStateRef.current.moved;
            dragStateRef.current.active = false;
            dragStateRef.current.pointerId = null;
            dragStateRef.current.moved = false;
            if (!moved) return;
            if (Math.abs(delta) < swipeThreshold) return;
            const isRtl = direction === 'rtl';
            const swipedLeft = delta < 0;
            const next = isRtl ? !swipedLeft : swipedLeft;
            if (next) goNext();
            else goPrev();
          }}
          onPointerCancel={(e) => {
            if (dragStateRef.current.pointerId !== e.pointerId) return;
            dragStateRef.current.active = false;
            dragStateRef.current.pointerId = null;
            dragStateRef.current.moved = false;
          }}
        >
           {/* Abstract shape behind image */}
           <div className="absolute inset-0 bg-white/30 rounded-t-[100px] rounded-b-[100px] blur-sm transform scale-95 translate-y-4"></div>
           
           <img 
            src={activeProduct.image} 
            alt={activeProduct.name}
            className="w-full h-full object-cover rounded-t-[100px] rounded-b-[100px] shadow-2xl relative z-10 brightness-90 contrast-110"
           />

           {/* Floating Product Card (Glassmorphism) */}
           <div
             role={canSlide ? 'button' : undefined}
             tabIndex={canSlide ? 0 : -1}
             onClick={() => canSlide && goNext()}
             onKeyDown={(e) => {
               if (!canSlide) return;
               if (e.key === 'Enter' || e.key === ' ') {
                 e.preventDefault();
                 goNext();
               }
             }}
             className={`absolute bottom-8 -end-4 md:-end-12 z-20 backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-2xl shadow-lg w-64 ${canSlide ? 'cursor-pointer' : ''}`}
           >
              <div className="flex justify-between items-end">
                <div>
                    <h3 className="font-serif text-2xl text-zafting-text">{activeProduct.name}</h3>
                    <p className="text-xs text-zafting-text/80 mt-1 font-sans font-light">
                        {activeProduct.description}
                    </p>
                    <p className="text-lg font-medium mt-2">{formatPriceToman(activeProduct.price)}</p>
                </div>
                <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductClick(activeProduct);
                    }}
                    className="p-3 bg-transparent border border-zafting-text/30 rounded-full hover:bg-zafting-text hover:text-[#E8E0D9] transition-colors group"
                    aria-label={t('hero.cta')}
                >
                    <ArrowIcon size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
              
              {/* Pagination Dots */}
              <div className="flex gap-2 mt-4">
                  {safeProducts.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goTo(i);
                      }}
                      className={`w-2 h-2 rounded-full ${i === activeIndex ? 'bg-zafting-text' : 'bg-zafting-text/30'}`}
                      aria-label={`slide-${i + 1}`}
                    />
                  ))}
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
