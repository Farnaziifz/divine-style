import React, { useState } from 'react';
import { Product } from '../types';
import { ArrowLeft, ArrowRight, Star, ShoppingBag, Ruler, Shirt, Layers, Play, X, Rotate3D, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ReviewsSection } from './ReviewsSection';

interface ProductDetailPageProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBack: () => void;
  onOpenStyling?: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onAddToCart, onBack, onOpenStyling }) => {
  const { t, direction } = useLanguage();
  const BackArrow = direction === 'rtl' ? ArrowRight : ArrowLeft;
  const ForwardArrow = direction === 'rtl' ? ArrowLeft : ArrowRight;
  
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[2]?.label || 'M'); // Default to M
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [galleryRotateY, setGalleryRotateY] = useState(0);

  const currentSizeData = product.sizes?.find(s => s.label === selectedSize);
  
  // Use existing gallery or fallback to main image repeated
  const galleryImages = product.gallery && product.gallery.length > 0 
    ? product.gallery 
    : [product.image, product.image, product.image, product.image, product.image];

  const handleGalleryRotate = (dir: 'left' | 'right') => {
      setGalleryRotateY(prev => prev + (dir === 'left' ? 60 : -60));
  };

  return (
    <div className="min-h-screen bg-[#E8E0D9] animate-fade-in overflow-x-hidden">
      
      {/* 3D Gallery Overlay */}
      {isGalleryOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden perspective-1000">
             <button 
                onClick={() => setIsGalleryOpen(false)}
                className="absolute top-8 end-8 text-white hover:text-red-400 z-50"
             >
                 <X size={32} />
             </button>
             
             <h3 className="text-white/50 font-serif text-2xl mb-12 uppercase tracking-[0.2em]">{t('product.view_gallery')}</h3>

             {/* 3D Carousel Stage */}
             <div className="relative w-[300px] h-[400px] md:w-[400px] md:h-[550px]" style={{ perspective: '1200px' }}>
                 <div 
                    className="w-full h-full absolute transition-transform duration-1000 ease-[cubic-bezier(0.1,0,0.3,1)]"
                    style={{ 
                        transformStyle: 'preserve-3d',
                        transform: `rotateY(${galleryRotateY}deg)`
                    }}
                 >
                     {galleryImages.map((img, idx) => {
                         const angle = (360 / galleryImages.length) * idx;
                         const translateZ = galleryImages.length > 3 ? 400 : 250; // Distance from center
                         return (
                            <div 
                                key={idx}
                                className="absolute inset-0 bg-white p-2 rounded-xl shadow-2xl border border-white/10"
                                style={{
                                    transform: `rotateY(${angle}deg) translateZ(${translateZ}px)`,
                                    backfaceVisibility: 'hidden' // Or 'visible' depending on desired effect
                                }}
                            >
                                <img src={img} className="w-full h-full object-cover rounded-lg" alt={`View ${idx}`} />
                            </div>
                         );
                     })}
                 </div>
             </div>
             
             {/* Controls */}
             <div className="flex gap-12 mt-16 text-white z-50">
                 <button 
                    onClick={() => handleGalleryRotate('left')}
                    className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                 >
                     <ArrowLeft size={24} />
                 </button>
                 <div className="flex items-center gap-2 opacity-50">
                     <Rotate3D size={20} className="animate-spin-slow" />
                     <span className="text-xs uppercase">360° View</span>
                 </div>
                 <button 
                    onClick={() => handleGalleryRotate('right')}
                    className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                 >
                     <ArrowRight size={24} />
                 </button>
             </div>
          </div>
      )}

      {/* Video Overlay */}
      {isVideoOpen && (
          <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
              <button 
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-8 end-8 text-white hover:text-red-400 z-50"
             >
                 <X size={32} />
             </button>
             
             <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative">
                 {product.video ? (
                     <video 
                        src={product.video} 
                        className="w-full h-full object-cover" 
                        controls 
                        autoPlay
                     />
                 ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-white/50 bg-zinc-900">
                         <Play size={48} className="mb-4 opacity-50" />
                         <p>Video demonstration placeholder</p>
                     </div>
                 )}
             </div>
          </div>
      )}

      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* Left: Immersive Image & Interactive Triggers */}
        <div className="lg:w-1/2 h-[50vh] lg:h-screen relative overflow-hidden group sticky top-0">
           <button 
            onClick={onBack}
            className="absolute top-6 start-6 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-zafting-text transition-colors shadow-lg"
           >
             <BackArrow size={24} />
           </button>
           
           <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 lg:bg-gradient-to-r lg:from-transparent lg:to-black/30 pointer-events-none"></div>

           {/* Floating Action Buttons for Gallery/Video */}
           <div className="absolute bottom-8 start-8 z-30 flex gap-4">
               <button 
                 onClick={() => setIsGalleryOpen(true)}
                 className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white px-5 py-3 rounded-full hover:bg-white hover:text-zafting-text transition-all duration-300 shadow-xl group/btn"
               >
                   <Layers size={20} className="group-hover/btn:rotate-180 transition-transform duration-500" />
                   <span className="text-sm font-medium tracking-wide uppercase">{t('product.view_gallery')}</span>
               </button>
               
               {product.video && (
                   <button 
                    onClick={() => setIsVideoOpen(true)}
                    className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-300 shadow-xl relative"
                   >
                       <span className="absolute inset-0 rounded-full animate-ping bg-white/30"></span>
                       <Play size={20} fill="currentColor" className="relative z-10" />
                   </button>
               )}
           </div>
        </div>

        {/* Right: Details */}
        <div className="lg:w-1/2 overflow-y-auto lg:h-screen bg-[#E8E0D9]">
          <div className="p-8 md:p-16 flex flex-col justify-center min-h-full">
            <div className="max-w-xl mx-auto w-full">
              
              {/* Breadcrumb / Rating */}
              <div className="flex items-center gap-2 mb-4 text-zafting-text/60 text-sm uppercase tracking-widest">
                  <span>{t(`product.category.${product.category}`) || product.category}</span>
                  <span>•</span>
                  <div className="flex text-yellow-600">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                  </div>
              </div>

              {/* Title & Price */}
              <h1 className="font-serif text-5xl md:text-7xl text-zafting-text mb-6 leading-tight">
                {product.name}
              </h1>

              <div className="text-3xl font-medium text-zafting-text mb-8 flex items-center gap-4">
                 {product.discountPrice ? (
                   <>
                     <span className="text-red-700">${product.discountPrice}</span>
                     <span className="text-xl opacity-40 line-through">${product.price}</span>
                   </>
                 ) : (
                   <span>${product.price}</span>
                 )}
              </div>

              {/* Description */}
              <p className="font-serif text-xl leading-relaxed opacity-80 mb-10 border-l-2 border-zafting-text/20 ps-4">
                {product.description}
              </p>

              <hr className="border-zafting-text/10 mb-10" />

              {/* Fabric Details */}
              {product.fabric && (
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Shirt size={18} className="text-zafting-text/60" />
                        <h3 className="font-sans uppercase text-sm tracking-widest font-bold text-zafting-text/80">{t('product.fabric')}</h3>
                    </div>
                    <div className="flex items-center gap-6 bg-white/40 p-4 rounded-xl border border-white/60">
                         <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm border border-white">
                             <img src={product.fabric.image} alt="fabric texture" className="w-full h-full object-cover" />
                         </div>
                         <div>
                             <p className="font-serif text-lg font-medium">{product.fabric.name}</p>
                             <p className="text-sm opacity-60">{product.fabric.composition}</p>
                         </div>
                    </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && (
                <div className="mb-10">
                   <div className="flex justify-between items-center mb-4">
                        <h3 className="font-sans uppercase text-sm tracking-widest font-bold text-zafting-text/80">{t('product.select_size')}</h3>
                        <span className="text-xs underline cursor-pointer hover:text-zafting-accent">Size Guide</span>
                   </div>
                   
                   <div className="flex flex-wrap gap-3">
                       {product.sizes.map((size) => (
                           <button
                             key={size.label}
                             onClick={() => setSelectedSize(size.label)}
                             disabled={!size.available}
                             className={`w-14 h-14 rounded-full border flex items-center justify-center font-serif text-lg transition-all ${
                                 selectedSize === size.label 
                                 ? 'bg-zafting-text text-[#E8E0D9] border-zafting-text scale-110 shadow-lg' 
                                 : 'bg-transparent border-zafting-text/30 text-zafting-text hover:border-zafting-text'
                             } ${!size.available ? 'opacity-30 cursor-not-allowed decoration-slice line-through' : ''}`}
                           >
                               {size.label}
                           </button>
                       ))}
                   </div>
                </div>
              )}

              {/* Dynamic Measurement Chart */}
              {currentSizeData && (
                  <div className="mb-12 bg-white/30 rounded-2xl p-6 border border-white/50 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-4 text-zafting-text/60">
                           <Ruler size={16} />
                           <span className="text-xs uppercase tracking-widest font-bold">{t('product.size_guide')} — {selectedSize}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex flex-col">
                              <span className="text-xs opacity-50 uppercase">{t('measure.bust')}</span>
                              <span className="font-serif text-xl">{currentSizeData.dims.bust}</span>
                          </div>
                          <div className="flex flex-col">
                              <span className="text-xs opacity-50 uppercase">{t('measure.waist')}</span>
                              <span className="font-serif text-xl">{currentSizeData.dims.waist}</span>
                          </div>
                          <div className="flex flex-col">
                              <span className="text-xs opacity-50 uppercase">{t('measure.hips')}</span>
                              <span className="font-serif text-xl">{currentSizeData.dims.hips}</span>
                          </div>
                          <div className="flex flex-col">
                              <span className="text-xs opacity-50 uppercase">{t('measure.length')}</span>
                              <span className="font-serif text-xl">{currentSizeData.dims.length}</span>
                          </div>
                      </div>
                  </div>
              )}

              {/* Strong CTA for Styling Inspiration (NEW) */}
              <div className="mb-12">
                  <button 
                    onClick={() => onOpenStyling && onOpenStyling(product)}
                    className="w-full group relative overflow-hidden rounded-2xl bg-[#2A2A2A] text-[#E8E0D9] p-6 flex items-center justify-between shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                      {/* Animated Background Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                      
                      <div className="flex items-center gap-4 relative z-10">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                              <Sparkles size={24} className="text-yellow-200" />
                          </div>
                          <div className="text-start">
                              <h3 className="font-serif text-xl">{t('style.cta')}</h3>
                              <p className="text-xs opacity-60 uppercase tracking-widest">Watch Videos & Photos</p>
                          </div>
                      </div>
                      
                      <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors relative z-10 rtl:rotate-180">
                          <ForwardArrow size={20} />
                      </div>
                  </button>
              </div>

              {/* Reviews Section */}
              <hr className="border-zafting-text/10 mb-10" />
              <ReviewsSection initialReviews={product.reviews || []} />

              {/* Actions */}
              <div className="flex gap-4 sticky bottom-0 bg-[#E8E0D9]/90 backdrop-blur-md py-4 -mx-4 px-4 lg:static lg:bg-transparent lg:p-0 z-10">
                 <button 
                    onClick={() => onAddToCart({ ...product })}
                    className="flex-1 bg-zafting-text text-[#E8E0D9] py-5 rounded-full uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-xl"
                 >
                    {t('shop.btn.buy')} <ShoppingBag size={18} />
                 </button>
                 <button className="w-16 h-16 border border-zafting-text/20 rounded-full flex items-center justify-center hover:bg-zafting-text hover:text-[#E8E0D9] transition-colors">
                    <Star size={20} />
                 </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};