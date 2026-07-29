import React, { useRef } from 'react';
import { Product } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { formatPriceToman } from '../../utils/format';

interface IntroSectionProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const IntroSection: React.FC<IntroSectionProps> = ({
  products,
  onProductClick,
  onAddToCart,
}) => {
  const { t, direction, language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const ArrowPrev = direction === 'rtl' ? ArrowRight : ArrowLeft;
  const ArrowNext = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const scroll = (dir: 'prev' | 'next') => {
    if (!scrollRef.current) return;
    const step = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: dir === 'next' ? step : -step,
      behavior: 'smooth',
    });
  };

  const card = (product: Product) => (
    <div
      key={product.id}
      role="button"
      tabIndex={0}
      onClick={() => onProductClick(product)}
      onKeyDown={(e) => e.key === 'Enter' && onProductClick(product)}
      className="shrink-0 w-[280px] md:w-[320px] group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zafting-text rounded-t-[50px] overflow-hidden"
    >
      <div className="relative aspect-3/4 overflow-hidden rounded-t-[50px] mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="absolute bottom-4 inset-e-4 bg-white/20 backdrop-blur-md p-3 rounded-full text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-zafting-text hover:text-zafting-bg"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-serif text-xl text-zafting-text">{product.name}</h3>
          <p className="text-xs text-zafting-text/60 uppercase tracking-widest mt-1">
            {t(`product.category.${product.category}`) || product.category}
          </p>
        </div>
        <span className="font-medium text-zafting-text">{formatPriceToman(product.price)}</span>
      </div>
    </div>
  );

  const countLabel =
    language === 'fa'
      ? `${products.length} محصول`
      : `${products.length} products`;

  if (products.length === 1) {
    return (
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="font-serif text-4xl md:text-5xl text-zafting-text mb-12 text-center">
          {t('home.intro') || 'اینترو'} · {countLabel}
        </h2>
        <div className="flex justify-center">{card(products[0])}</div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <h2 className="font-serif text-4xl md:text-5xl text-zafting-text">
          {t('home.intro') || 'اینترو'} · {countLabel}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scroll('prev')}
            className="w-12 h-12 rounded-full border border-zafting-text/30 flex items-center justify-center text-zafting-text hover:bg-zafting-text hover:text-zafting-bg transition-colors"
            aria-label={t('common.prev')}
          >
            <ArrowPrev size={20} />
          </button>
          <button
            type="button"
            onClick={() => scroll('next')}
            className="w-12 h-12 rounded-full border border-zafting-text/30 flex items-center justify-center text-zafting-text hover:bg-zafting-text hover:text-zafting-bg transition-colors"
            aria-label={t('common.next')}
          >
            <ArrowNext size={20} />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto overflow-y-hidden pb-4 scroll-smooth snap-x snap-mandatory *:snap-start [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => card(p))}
      </div>
    </section>
  );
};
