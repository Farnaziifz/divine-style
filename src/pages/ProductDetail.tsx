import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { fetchProductById } from '../services/productApi';
import { ArrowLeft, ArrowRight, Star, ShoppingBag, Ruler, Shirt, Layers, Play, X, Rotate3D, Sparkles, Loader2, ListPlus, ListMinus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { shoppingListService } from '../services/shoppingList.service';
import { ReviewsSection } from '../components/features/ReviewsSection';
import { formatPriceToman } from '../utils/format';

export const ProductDetail: React.FC = () => {
  const { id, lang } = useParams<{ id: string; lang?: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { t, direction, language } = useLanguage();
  const BackArrow = direction === 'rtl' ? ArrowRight : ArrowLeft;
  const ForwardArrow = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [galleryRotateY, setGalleryRotateY] = useState(0);
  const [inShoppingList, setInShoppingList] = useState(false);
  const [loadingShoppingList, setLoadingShoppingList] = useState(false);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);

  useEffect(() => {
    if (product?.id && isAuthenticated) {
      let cancelled = false;
      shoppingListService
        .checkInList(product.id)
        .then((inList) => {
          if (!cancelled) setInShoppingList(inList);
        })
        .catch(() => {
          if (!cancelled) setInShoppingList(false);
        });
      return () => {
        cancelled = true;
      };
    } else {
      setInShoppingList(false);
    }
  }, [product?.id, isAuthenticated]);

  const handleShoppingListClick = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      const currentLang = lang || language;
      const next = encodeURIComponent(`/${currentLang}/product/${product.id}`);
      navigate(`/${currentLang}/auth?next=${next}`);
      return;
    }
    setLoadingShoppingList(true);
    try {
      if (inShoppingList) {
        await shoppingListService.remove(product.id);
        setInShoppingList(false);
      } else {
        await shoppingListService.add(product.id);
        setInShoppingList(true);
      }
    } catch {
      // keep state on error
    } finally {
      setLoadingShoppingList(false);
    }
  };

  useEffect(() => {
    if (isGalleryOpen) {
      setGalleryRotateY(0);
    }
  }, [isGalleryOpen]);

  useEffect(() => {
    if (!isGalleryOpen && !isVideoOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsGalleryOpen(false);
        setIsVideoOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isGalleryOpen, isVideoOpen]);

  useEffect(() => {
    if (!product?.variants?.length || !selectedSize) return;
    const sizeKey = String(selectedSize);
    const forSize = product.variants
      .filter((v) => String(v.size ?? '') === sizeKey)
      .map((v) => (v.color != null ? String(v.color) : ''))
      .filter(Boolean);
    const firstColor = forSize[0];
    const currentColorInList = forSize.includes(String(selectedColor));
    if (firstColor && !currentColorInList) setSelectedColor(firstColor);
  }, [product?.variants, selectedSize, selectedColor]);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setError('Missing product id');
      return;
    }
    let cancelled = false;
    setError(null);
    setProduct(null);
    setIsLoading(true);
    fetchProductById(id)
      .then((p) => {
        if (!cancelled) {
          setProduct(p);
          const defaultSize =
            p.sizes?.find((s) => s.available)?.label ??
            p.sizes?.[0]?.label ??
            'M';
          setSelectedSize(String(defaultSize));
          const defaultSizeStr = String(defaultSize);
          const firstVariantWithSize = p.variants?.find((v) => String(v.size ?? '') === defaultSizeStr);
          const allColors = [...new Set((p.variants ?? []).map((v) => v.color).filter(Boolean))];
          const defaultColor =
            firstVariantWithSize?.color != null
              ? String(firstVariantWithSize.color)
              : (allColors[0] != null ? String(allColors[0]) : '');
          setSelectedColor(defaultColor ?? '');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load product');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const colorsForProduct = React.useMemo(
    () => [...new Set((product?.variants ?? []).map((v) => v.color).filter(Boolean))] as string[],
    [product?.variants]
  );
  const colorsForSize = React.useMemo(
    () =>
      selectedSize
        ? [...new Set(
            (product?.variants ?? [])
              .filter((v) => v.size === selectedSize)
              .map((v) => v.color)
              .filter(Boolean)
          )] as string[]
        : colorsForProduct,
    [product?.variants, selectedSize, colorsForProduct]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E8E0D9] flex items-center justify-center">
        <Loader2 className="animate-spin text-zafting-text" size={48} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#E8E0D9] flex flex-col items-center justify-center p-8">
        <p className="text-zafting-text/80 text-lg mb-4">
          {error || t('product.not_found') || 'Product not found'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-zafting-text text-[#E8E0D9] px-6 py-3 rounded-full uppercase tracking-widest text-sm hover:scale-105 transition-transform"
        >
          <BackArrow size={18} />
          {t('common.back') || 'Back'}
        </button>
      </div>
    );
  }

  const sizeKey = String(selectedSize ?? '');
  const colorKey = String(selectedColor ?? '');
  const currentSizeData = product.sizes?.find((s) => String(s.label) === sizeKey);
  const currentVariant =
    product.variants?.find(
      (v) =>
        String(v.size ?? '') === sizeKey &&
        (colorKey ? String(v.color ?? '') === colorKey : true)
    ) ??
    product.variants?.find((v) => String(v.size ?? '') === sizeKey);

  const isOutOfStock = !currentVariant || currentVariant.stock <= 0;

  const handleAddToCart = async () => {
    setAddToCartError(null);
    const result = await addToCart({
      ...product,
      selectedSize,
      selectedColor: selectedColor || undefined,
    });
    if (!result.ok) {
      setAddToCartError(result.message ?? 'ناموجود');
    }
  };

  // Use existing gallery or fallback to main image repeated
  const galleryImages = product.gallery && product.gallery.length > 0 
    ? product.gallery 
    : [product.image, product.image, product.image, product.image, product.image];

  const galleryRotationStep = galleryImages.length > 0 ? 360 / galleryImages.length : 60;

  const handleGalleryRotate = (dir: 'left' | 'right') => {
      setGalleryRotateY(prev => prev + (dir === 'left' ? galleryRotationStep : -galleryRotationStep));
  };

  return (
    <div className="min-h-screen bg-[#E8E0D9] animate-fade-in overflow-x-hidden">
      
      {/* 3D Gallery Overlay */}
      {isGalleryOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden perspective-1000">
             <button
                onClick={() => setIsGalleryOpen(false)}
                aria-label={t('common.close')}
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
                aria-label={t('common.close')}
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
            onClick={() => navigate(-1)}
            aria-label={t('common.back')}
            className="absolute top-24 start-6 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-zafting-text transition-colors shadow-lg"
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
          <div className="p-8 md:p-16 pb-28 lg:pb-16 flex flex-col justify-center min-h-full">
            <div className="max-w-xl mx-auto w-full">
              
              {/* Breadcrumb / Rating */}
              <div className="flex items-center gap-2 mb-4 text-zafting-text/60 text-sm uppercase tracking-widest">
                  <span>{product.category}</span>
                  {product.reviews && product.reviews.length > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex text-yellow-600">
                        {(() => {
                          const avg = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
                          const rounded = Math.round(avg);
                          return [1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={12} fill={i <= rounded ? 'currentColor' : 'none'} />
                          ));
                        })()}
                      </div>
                    </>
                  )}
              </div>

              {/* Title & Price */}
              <h1 className="font-serif text-5xl md:text-7xl text-zafting-text mb-6 leading-tight">
                {product.name}
              </h1>

              <div className="text-3xl font-medium text-zafting-text mb-8 flex items-center gap-4">
                 {currentVariant ? (
                   currentVariant.discountPrice != null && currentVariant.discountPrice < currentVariant.price ? (
                     <>
                       <span className="text-red-700">{formatPriceToman(currentVariant.discountPrice)}</span>
                       <span className="text-xl opacity-40 line-through">{formatPriceToman(currentVariant.price)}</span>
                     </>
                   ) : (
                     <span>{formatPriceToman(currentVariant.price)}</span>
                   )
                 ) : product.discountPrice ? (
                   <>
                     <span className="text-red-700">{formatPriceToman(product.discountPrice)}</span>
                     <span className="text-xl opacity-40 line-through">{formatPriceToman(product.price)}</span>
                   </>
                 ) : (
                   <span>{formatPriceToman(product.price)}</span>
                 )}
              </div>

              {/* Description */}
              <p className="font-serif text-xl leading-relaxed opacity-80 mb-8 border-l-2 border-zafting-text/20 ps-4">
                {product.description}
              </p>

              {/* Primary actions: Buy + Add to list — right after description for better UX */}
              <div className="flex gap-3 mb-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 bg-zafting-text text-zafting-bg py-4 px-6 rounded-full uppercase tracking-widest text-sm font-medium hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
                >
                  <ShoppingBag size={20} />
                  {isOutOfStock ? (t('product.out_of_stock') || 'ناموجود') : t('shop.btn.buy')}
                </button>
                <button
                  type="button"
                  onClick={handleShoppingListClick}
                  disabled={loadingShoppingList}
                  title={!isAuthenticated ? t('product.shopping_list.login_to_add') : inShoppingList ? t('product.shopping_list.remove') : t('product.shopping_list.add')}
                  className={`shrink-0 flex items-center gap-2 py-4 px-5 rounded-full border-2 text-sm font-medium transition-colors ${
                    inShoppingList
                      ? 'bg-zafting-text text-zafting-bg border-zafting-text'
                      : 'border-zafting-text/30 text-zafting-text hover:bg-zafting-text/10 hover:border-zafting-text'
                  } ${loadingShoppingList ? 'opacity-70' : ''}`}
                >
                  {loadingShoppingList ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : inShoppingList ? (
                    <ListMinus size={20} />
                  ) : (
                    <ListPlus size={20} />
                  )}
                  <span className="hidden sm:inline">
                    {inShoppingList ? t('product.shopping_list.remove') : t('product.shopping_list.add')}
                  </span>
                </button>
              </div>

              {addToCartError && (
                <p className="text-sm text-red-600 mb-8">{addToCartError}</p>
              )}

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
                        {product.sizes?.some((s) => s.dims || s.specifications) && (
                          <button
                            type="button"
                            onClick={() => document.getElementById('size-guide-chart')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                            className="text-xs underline cursor-pointer hover:text-zafting-accent"
                          >
                            {t('product.size_guide')}
                          </button>
                        )}
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

              {/* Color Selector — هر رنگ مشخصات خودش را دارد */}
              {colorsForProduct.length > 0 && (
                <div className="mb-10">
                  <h3 className="font-sans uppercase text-sm tracking-widest font-bold text-zafting-text/80 mb-4">
                    {t('product.select_color') || 'رنگ'}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {colorsForSize.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                          selectedColor === color
                            ? 'bg-zafting-text text-[#E8E0D9] border-zafting-text'
                            : 'bg-transparent border-zafting-text/30 text-zafting-text hover:border-zafting-text'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Measurement Chart — مقادیر بر اساس سایز + رنگ انتخاب‌شده به‌روز می‌شوند */}
              {(currentSizeData || currentVariant) && (
                  <div id="size-guide-chart" className="mb-12 bg-white/30 rounded-2xl p-6 border border-white/50 transition-all duration-300" key={`${selectedSize}-${selectedColor}`}>
                      <div className="flex items-center gap-2 mb-4 text-zafting-text/60">
                           <Ruler size={16} />
                           <span className="text-xs uppercase tracking-widest font-bold">
                             {t('product.size_guide')} — {selectedSize}
                             {selectedColor ? ` · ${selectedColor}` : ''}
                           </span>
                      </div>
                      {(() => {
                        const specs = currentVariant?.specifications ?? currentSizeData?.specifications;
                        if (specs && Object.keys(specs).length > 0) {
                          return (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {Object.entries(specs).map(([specKey, specVal]) => (
                                <div key={specKey} className="flex flex-col">
                                  <span className="text-xs opacity-50 uppercase">{specKey.replace(/_/g, ' ')}</span>
                                  <span className="font-serif text-xl">{String(specVal)}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        const d = currentSizeData?.dims;
                        if (!d) return null;
                        return (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                              <span className="text-xs opacity-50 uppercase">{t('measure.bust')}</span>
                              <span className="font-serif text-xl">{d.bust}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs opacity-50 uppercase">{t('measure.waist')}</span>
                              <span className="font-serif text-xl">{d.waist}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs opacity-50 uppercase">{t('measure.hips')}</span>
                              <span className="font-serif text-xl">{d.hips}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs opacity-50 uppercase">{t('measure.length')}</span>
                              <span className="font-serif text-xl">{d.length}</span>
                            </div>
                            {d.sleeve != null && (
                              <div className="flex flex-col">
                                <span className="text-xs opacity-50 uppercase">{t('measure.sleeve')}</span>
                                <span className="font-serif text-xl">{d.sleeve}</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                  </div>
              )}

              {/* Strong CTA for Styling Inspiration (NEW) */}
              <div className="mb-12">
                  <button 
                    onClick={() => navigate(`/${language}/styling/${product.id}`)}
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

            </div>
          </div>
        </div>

      </div>

      {/* نوار خرید چسبان موبایل — CTA اصلی خرید همیشه در دسترس بمونه، حتی وسط اسکرول توضیحات بلند */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-zafting-bg/95 backdrop-blur-md border-t border-zafting-text/10 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col leading-tight min-w-0">
          {currentVariant ? (
            currentVariant.discountPrice != null && currentVariant.discountPrice < currentVariant.price ? (
              <span className="font-medium text-zafting-text truncate">{formatPriceToman(currentVariant.discountPrice)}</span>
            ) : (
              <span className="font-medium text-zafting-text truncate">{formatPriceToman(currentVariant.price)}</span>
            )
          ) : product.discountPrice ? (
            <span className="font-medium text-zafting-text truncate">{formatPriceToman(product.discountPrice)}</span>
          ) : (
            <span className="font-medium text-zafting-text truncate">{formatPriceToman(product.price)}</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex-1 bg-zafting-text text-zafting-bg py-3 px-6 rounded-full uppercase tracking-widest text-sm font-medium hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
        >
          <ShoppingBag size={18} />
          {isOutOfStock ? (t('product.out_of_stock') || 'ناموجود') : t('shop.btn.buy')}
        </button>
      </div>
    </div>
  );
};
