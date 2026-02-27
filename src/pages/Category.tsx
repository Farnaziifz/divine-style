import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { PRODUCTS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { Filter, SlidersHorizontal, ArrowRight, ArrowLeft, Percent, ShoppingBag } from 'lucide-react';

export const Category: React.FC = () => {
  const { id: categoryId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t, direction } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  // Animation State
  const [animatingProduct, setAnimatingProduct] = useState<{ product: Product, rect: DOMRect } | null>(null);

  const itemsPerPage = 5;

  // Filter products by category
  let filterCategory = '';
  if (categoryId === 'pants') filterCategory = 'Pants';
  if (categoryId === 'lingerie') filterCategory = 'Lingerie';
  if (categoryId === 'sleepwear') filterCategory = 'Sleepwear';
  if (categoryId === 'tops') filterCategory = 'Tops';
  if (categoryId === 'shoes') filterCategory = 'Shoes';
  
  const allCategoryProducts = PRODUCTS.filter(p => 
    filterCategory ? p.category === filterCategory : true
  );

  const saleProducts = allCategoryProducts.filter(p => p.discountPrice);
  const regularProducts = allCategoryProducts.filter(p => !p.discountPrice);

  const totalPages = Math.ceil(regularProducts.length / itemsPerPage) || 1;
  const currentRackProducts = regularProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const featuredProduct = regularProducts[0]; 

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const BackArrowIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const handleProductClick = (product: Product, e: React.MouseEvent<HTMLDivElement>) => {
      // 1. Get coordinates of clicked image
      const imgElement = e.currentTarget.querySelector('img');
      if (imgElement) {
          const rect = imgElement.getBoundingClientRect();
          setAnimatingProduct({ product, rect });

          // 2. Wait for animation to finish then navigate
          // Match duration with CSS transition duration
          setTimeout(() => {
              navigate(`/product/${product.id}`);
          }, 800);
      } else {
          navigate(`/product/${product.id}`);
      }
  };

  return (
    <div className="min-h-screen bg-[#E8E0D9] pt-24 pb-20 overflow-x-hidden">
      
      {/* Animation Overlay */}
      {animatingProduct && (
          <div 
            className="fixed z-50 transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={{
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                // Start from the rect, animate to full screen using a simple hack
                // Actually, React re-renders quickly, so we use a CSS animation class approach or inline style update
            }}
          >
             <img 
                src={animatingProduct.product.image} 
                className="w-full h-full object-cover animate-tunnel-zoom"
                style={{
                    // We set initial CSS variables for the animation to use
                    '--start-top': `${animatingProduct.rect.top}px`,
                    '--start-left': `${animatingProduct.rect.left}px`,
                    '--start-width': `${animatingProduct.rect.width}px`,
                    '--start-height': `${animatingProduct.rect.height}px`,
                } as React.CSSProperties}
             />
             <style>{`
                @keyframes tunnelZoom {
                    0% {
                        position: fixed;
                        top: var(--start-top);
                        left: var(--start-left);
                        width: var(--start-width);
                        height: var(--start-height);
                        border-radius: 1rem;
                    }
                    50% {
                        border-radius: 0;
                    }
                    100% {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100vw;
                        height: 100vh;
                        transform: scale(1.1); /* Slight extra zoom for effect */
                    }
                }
                .animate-tunnel-zoom {
                    animation: tunnelZoom 0.8s forwards cubic-bezier(0.65, 0, 0.35, 1);
                }
             `}</style>
          </div>
      )}

      {/* 1. Header & Filters */}
      <header className="px-6 md:px-12 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button onClick={() => navigate('/shop')} className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity mb-2">
            <BackArrowIcon size={14} /> {t('shop.cat.title')}
          </button>
          <h1 className="font-serif text-5xl md:text-7xl text-zafting-text">
            {t(`shop.cat.${categoryId}`) || categoryId}
          </h1>
        </div>

        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 border border-zafting-text/20 rounded-full hover:bg-zafting-text hover:text-[#E8E0D9] transition-colors">
             <Filter size={16} /> <span className="text-sm uppercase">{t('cat.filter')}</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 border border-zafting-text/20 rounded-full hover:bg-zafting-text hover:text-[#E8E0D9] transition-colors">
             <SlidersHorizontal size={16} /> <span className="text-sm uppercase">{t('cat.sort')}</span>
          </button>
        </div>
      </header>

      {/* 2. Spotlight (Mannequin Display) */}
      {featuredProduct && (
        <section className="px-6 md:px-12 mb-24">
           <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-[1px] bg-zafting-text"></span>
              <span className="font-serif italic text-xl">{t('cat.spotlight')}</span>
           </div>
           
           <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 items-center border border-white/50">
              <div 
                className="w-full md:w-1/3 aspect-[3/4] relative rounded-xl overflow-hidden shadow-lg rotate-1 hover:rotate-0 transition-transform duration-500 cursor-pointer"
                onClick={(e) => handleProductClick(featuredProduct, e)}
              >
                  <img src={featuredProduct.image} alt={featuredProduct.name} className="w-full h-full object-cover" />
              </div>
              <div className="md:w-2/3">
                  <h3 className="font-serif text-4xl mb-4">{featuredProduct.name}</h3>
                  <p className="opacity-70 text-lg leading-relaxed max-w-md mb-6">{featuredProduct.description}</p>
                  <p className="text-2xl mb-6">${featuredProduct.price}</p>
                  <button 
                    onClick={() => addToCart(featuredProduct)}
                    className="bg-zafting-text text-[#E8E0D9] px-8 py-4 rounded-full uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    {t('shop.btn.buy')}
                  </button>
              </div>
           </div>
        </section>
      )}

      {/* 3. The Rack (Main List) */}
      <section className="mb-24 relative">
         <div className="px-6 md:px-12 flex justify-between items-end mb-4">
             <h2 className="font-serif text-3xl">{t('cat.rack')}</h2>
             <div className="flex items-center gap-4 text-sm font-sans">
                <span className="opacity-50">{t('cat.aisle')} {currentPage} / {totalPages}</span>
                <div className="flex gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="w-8 h-8 rounded-full border border-zafting-text/30 flex items-center justify-center disabled:opacity-30 hover:bg-zafting-text hover:text-white transition-colors rtl:scale-x-[-1]"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="w-8 h-8 rounded-full border border-zafting-text/30 flex items-center justify-center disabled:opacity-30 hover:bg-zafting-text hover:text-white transition-colors rtl:scale-x-[-1]"
                    >
                        <ArrowRight size={16} />
                    </button>
                </div>
             </div>
         </div>

         {/* Rail Visual */}
         <div className="absolute top-[80px] left-0 w-full h-3 bg-gradient-to-b from-gray-400 to-gray-600 shadow-md z-0"></div>

         {/* Hanging Items Scroll Area */}
         <div className="overflow-x-auto pb-12 pt-6 px-6 md:px-12 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-4 md:gap-8 min-w-max">
                {currentRackProducts.map((product) => (
                    <div 
                        key={product.id} 
                        className="group relative w-[280px] flex flex-col items-center pt-8 cursor-pointer"
                        onClick={(e) => handleProductClick(product, e)}
                    >
                        {/* Hanger Hook Visual */}
                        <div className="absolute top-[-8px] w-4 h-8 border-t-4 border-l-4 border-r-4 border-gray-400 rounded-t-full z-10"></div>
                        
                        {/* Product Card (Hanging) */}
                        <div className="relative w-full aspect-[2/3] bg-white shadow-xl rounded-lg overflow-hidden transform origin-top transition-all duration-500 ease-out group-hover:rotate-1 group-hover:scale-[1.02]">
                             <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                             
                             {/* Hover Overlay */}
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-white p-4 text-center backdrop-blur-[2px]">
                                 <h4 className="font-serif text-2xl mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{product.name}</h4>
                                 <p className="text-lg font-medium mb-4">${product.price}</p>
                                 <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(product);
                                    }}
                                    className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform"
                                 >
                                     <ShoppingBag size={20} />
                                 </button>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </section>

      {/* 4. Sale Bin (Discounted) */}
      {saleProducts.length > 0 && (
        <section className="mx-4 md:mx-12 bg-[#D14D4D] text-[#E8E0D9] rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
             
             <div className="relative z-10 mb-12 flex justify-between items-center">
                 <div>
                    <div className="flex items-center gap-2 mb-2 text-red-200">
                        <Percent size={20} />
                        <span className="uppercase tracking-widest text-sm">{t('cat.sale')}</span>
                    </div>
                    <h2 className="font-serif text-4xl md:text-6xl">Last Chance</h2>
                 </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                 {saleProducts.map(product => (
                     <div 
                        key={product.id} 
                        className="group cursor-pointer"
                        onClick={(e) => handleProductClick(product, e)}
                     >
                         <div className="relative aspect-square bg-white/10 rounded-2xl overflow-hidden mb-4 border border-white/10">
                             <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-overlay group-hover:mix-blend-normal transition-all duration-300" />
                             <div className="absolute top-2 end-2 bg-white text-red-600 font-bold px-2 py-1 rounded text-xs shadow-sm">
                                -{Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100)}%
                             </div>
                         </div>
                         <div>
                             <h4 className="font-serif text-lg">{product.name}</h4>
                             <div className="flex gap-3 items-baseline">
                                 <span className="text-xl font-medium">${product.discountPrice}</span>
                                 <span className="text-sm opacity-60 line-through">${product.price}</span>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
        </section>
      )}

    </div>
  );
};