import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { Filter, SlidersHorizontal, ArrowRight, ArrowLeft, Percent, ShoppingBag } from 'lucide-react';
import { formatPriceToman } from '../utils/format';
import { getApiBaseUrl, resolveImageUrl } from '../utils/imageUrl';

type ApiProductVariant = {
  sku: string;
  price: number | string;
  discountPrice?: number | string | null;
  discountPercent?: number | null;
  stock: number;
};

type ApiProduct = {
  id: string;
  title: string;
  description: string;
  images: string[];
  category?: { id: string; title: string };
  categoryId: string;
  variants?: ApiProductVariant[];
};

type ApiCategory = {
  id: string;
  title: string;
  parentId?: string | null;
};

type PaginatedCategories = {
  data: ApiCategory[];
};

type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; lastPage: number };
};

export const Category: React.FC = () => {
  const { id: categoryId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t, direction, language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState<string>('');
  const [allCategories, setAllCategories] = useState<ApiCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  // Animation State
  const [animatingProduct, setAnimatingProduct] = useState<{ product: Product, rect: DOMRect } | null>(null);

  type SortOption = 'newest' | 'price_asc' | 'price_desc';
  const [sort, setSort] = useState<SortOption>('newest');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceDraft, setPriceDraft] = useState<{ min: string; max: string }>({ min: '', max: '' });

  const itemsPerPage = 5;

  const getImageUrl = (path?: string | null) => {
    return resolveImageUrl(path) ?? '';
  };

  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  const toUiProduct = (p: ApiProduct): Product => {
    const firstVariant = p.variants?.[0];
    const priceRaw = firstVariant?.price ?? 0;
    const discountPriceRaw = firstVariant?.discountPrice;
    const price = typeof priceRaw === 'string' ? Number(priceRaw) || 0 : Number(priceRaw);
    const discountPrice =
      discountPriceRaw != null && discountPriceRaw !== ''
        ? typeof discountPriceRaw === 'string'
          ? Number(discountPriceRaw) || undefined
          : Number(discountPriceRaw)
        : undefined;

    return {
      id: p.id,
      name: p.title,
      price,
      discountPrice,
      description: p.description ?? '',
      image: getImageUrl(p.images?.[0]) || '',
      gallery: (p.images || []).map((img) => getImageUrl(img)),
      category: p.category?.title || '',
    };
  };

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (!categoryId) return;
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          categoryId,
          page: String(currentPage),
          limit: String(itemsPerPage),
          sort,
        });
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        const [catRes, productsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/categories/${categoryId}`),
          fetch(`${apiBaseUrl}/products?${params.toString()}`),
        ]);

        if (catRes.ok) {
          const cat = (await catRes.json()) as ApiCategory;
          setCategoryTitle(cat.title);
        } else {
          setCategoryTitle('');
        }

        const json = (await productsRes.json()) as PaginatedResponse<ApiProduct>;
        setProducts((json.data || []).map(toUiProduct));
        setTotalPages(json.meta?.lastPage || 1);
      } catch (error) {
        console.error('Failed to fetch category/products', error);
        setProducts([]);
        setTotalPages(1);
        setCategoryTitle('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [apiBaseUrl, categoryId, currentPage, sort, minPrice, maxPrice]);

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/categories?page=1&limit=100`);
        if (!res.ok) return;
        const json = (await res.json()) as PaginatedCategories;
        setAllCategories(json.data || []);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchAllCategories();
  }, [apiBaseUrl]);

  const saleProducts = products.filter((p) => typeof p.discountPrice === 'number' && p.discountPrice < p.price);
  const regularProducts = products.filter((p) => !p.discountPrice || p.discountPrice >= p.price);
  /** رگال: نمایش همهٔ محصولات (هم عادی هم تخفیف‌دار) */
  const currentRackProducts = products;

  const featuredProduct = regularProducts[0] || saleProducts[0];

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const BackArrowIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const handleProductClick = (product: Product, e: React.SyntheticEvent<HTMLDivElement>) => {
      // 1. Get coordinates of clicked image
      const imgElement = e.currentTarget.querySelector('img');
      if (imgElement) {
          const rect = imgElement.getBoundingClientRect();
          setAnimatingProduct({ product, rect });

          // 2. Wait for animation to finish then navigate
          // Match duration with CSS transition duration
          setTimeout(() => {
              navigate(`/${language}/product/${product.id}`);
          }, 800);
      } else {
          navigate(`/${language}/product/${product.id}`);
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
          <button onClick={() => navigate(`/${language}/shop`)} className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity mb-2">
            <BackArrowIcon size={14} /> {t('shop.cat.title')}
          </button>
          <h1 className="font-serif text-5xl md:text-7xl text-zafting-text">
            {categoryTitle || categoryId}
          </h1>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <button
              onClick={() => { setIsFilterOpen((v) => !v); setIsSortOpen(false); setPriceDraft({ min: minPrice, max: maxPrice }); }}
              className="flex items-center gap-2 px-6 py-3 border border-zafting-text/20 rounded-full hover:bg-zafting-text hover:text-zafting-bg transition-colors cursor-pointer"
            >
               <Filter size={16} /> <span className="text-sm uppercase">{t('cat.filter')}</span>
            </button>
            {isFilterOpen && (
              <div className="absolute top-full mt-2 start-0 z-30 w-64 bg-zafting-bg border border-zafting-text/15 rounded-2xl shadow-xl p-4">
                <p className="text-xs uppercase tracking-widest opacity-60 mb-3">{t('cat.filter.price')}</p>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={priceDraft.min}
                    onChange={(e) => setPriceDraft((d) => ({ ...d, min: e.target.value }))}
                    placeholder="0"
                    className="w-full min-w-0 px-3 py-2 rounded-lg border border-zafting-text/20 bg-transparent text-sm"
                  />
                  <span className="opacity-50">–</span>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={priceDraft.max}
                    onChange={(e) => setPriceDraft((d) => ({ ...d, max: e.target.value }))}
                    placeholder="∞"
                    className="w-full min-w-0 px-3 py-2 rounded-lg border border-zafting-text/20 bg-transparent text-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    setMinPrice(priceDraft.min);
                    setMaxPrice(priceDraft.max);
                    setCurrentPage(1);
                    setIsFilterOpen(false);
                  }}
                  className="w-full py-2 rounded-lg bg-zafting-text text-zafting-bg text-sm uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {t('cat.filter')}
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setIsSortOpen((v) => !v); setIsFilterOpen(false); }}
              className="flex items-center gap-2 px-6 py-3 border border-zafting-text/20 rounded-full hover:bg-zafting-text hover:text-zafting-bg transition-colors cursor-pointer"
            >
               <SlidersHorizontal size={16} /> <span className="text-sm uppercase">{t('cat.sort')}</span>
            </button>
            {isSortOpen && (
              <div className="absolute top-full mt-2 start-0 z-30 w-56 bg-zafting-bg border border-zafting-text/15 rounded-2xl shadow-xl p-2">
                {([
                  ['newest', 'cat.sort.new'],
                  ['price_asc', 'cat.sort.price_asc'],
                  ['price_desc', 'cat.sort.price_desc'],
                ] as [SortOption, string][]).map(([value, key]) => (
                  <button
                    key={value}
                    onClick={() => { setSort(value); setCurrentPage(1); setIsSortOpen(false); }}
                    className={`w-full text-start px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${sort === value ? 'bg-zafting-text text-zafting-bg' : 'hover:bg-zafting-text/10'}`}
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 1b. Category Switcher */}
      {allCategories.length > 1 && (
        <div className="mb-16 overflow-x-auto px-6 md:px-12 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-3 min-w-max">
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { if (cat.id !== categoryId) { navigate(`/${language}/category/${cat.id}`); setCurrentPage(1); } }}
                className={`px-5 py-2 rounded-full text-sm whitespace-nowrap border transition-colors cursor-pointer ${
                  cat.id === categoryId
                    ? 'bg-zafting-text text-zafting-bg border-zafting-text'
                    : 'border-zafting-text/20 hover:bg-zafting-text/10'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Spotlight (Mannequin Display) */}
      {featuredProduct && (
        <section className="px-6 md:px-12 mb-24">
           <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-[1px] bg-zafting-text"></span>
              <span className="font-serif italic text-xl">{t('cat.spotlight')}</span>
           </div>
           
           <div className="bg-white/40 backdrop-blur-sm rounded-4xl p-8 flex flex-col md:flex-row gap-8 items-center border border-white/50">
              <div
                role="button"
                tabIndex={0}
                className="w-full md:w-1/3 aspect-[3/4] relative rounded-xl overflow-hidden shadow-lg rotate-1 hover:rotate-0 transition-transform duration-500 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zafting-text"
                onClick={(e) => handleProductClick(featuredProduct, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleProductClick(featuredProduct, e);
                  }
                }}
              >
                  <img src={featuredProduct.image} alt={featuredProduct.name} className="w-full h-full object-cover" />
              </div>
              <div className="md:w-2/3">
                  <h3 className="font-serif text-4xl mb-4">{featuredProduct.name}</h3>
                  <p className="opacity-70 text-lg leading-relaxed max-w-md mb-6">{featuredProduct.description}</p>
                  {typeof featuredProduct.discountPrice === 'number' && featuredProduct.discountPrice < featuredProduct.price ? (
                    <div className="flex items-baseline gap-4 mb-6">
                      <p className="text-2xl font-medium">{formatPriceToman(featuredProduct.discountPrice)}</p>
                      <p className="text-lg opacity-60 line-through">{formatPriceToman(featuredProduct.price)}</p>
                    </div>
                  ) : (
                    <p className="text-2xl mb-6">{formatPriceToman(featuredProduct.price)}</p>
                  )}
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
             {totalPages > 1 && (
               <div className="flex items-center gap-4 text-sm font-sans">
                  <span className="opacity-50">{t('cat.page')} {currentPage} {t('cat.page.of')} {totalPages}</span>
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
             )}
         </div>

         {/* Rail Visual */}
         <div className="absolute top-[80px] left-0 w-full h-3 bg-gradient-to-b from-gray-400 to-gray-600 shadow-md z-0"></div>

         {/* Hanging Items Scroll Area */}
         <div className="overflow-x-auto pb-12 pt-6 px-6 md:px-12 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-4 md:gap-8 min-w-max">
                {isLoading ? (
                  <div className="py-24 text-zafting-text/60">
                    <span className="text-sm uppercase tracking-widest">{t('loading') || 'Loading...'}</span>
                  </div>
                ) : currentRackProducts.length === 0 ? (
                  <div className="py-24 text-zafting-text/60">
                    <span className="text-sm uppercase tracking-widest">
                      {t('empty') || 'No products found'}
                    </span>
                  </div>
                ) : (
                currentRackProducts.map((product) => (
                    <div
                        key={product.id}
                        role="button"
                        tabIndex={0}
                        className="group relative w-[280px] flex flex-col items-center pt-8 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zafting-text rounded-lg"
                        onClick={(e) => handleProductClick(product, e)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleProductClick(product, e);
                          }
                        }}
                    >
                        {/* Hanger Hook Visual */}
                        <div className="absolute top-[-8px] w-4 h-8 border-t-4 border-l-4 border-r-4 border-gray-400 rounded-t-full z-10"></div>
                        
                        {/* Product Card (Hanging) */}
                        <div className="relative w-full aspect-[2/3] bg-white shadow-xl rounded-lg overflow-hidden transform origin-top transition-all duration-500 ease-out group-hover:rotate-1 group-hover:scale-[1.02]">
                             <img src={product.image} alt={product.name} className="w-full h-full object-cover" />

                             {/* Quick add-to-cart */}
                             <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(product);
                                }}
                                aria-label={t('shop.btn.buy')}
                                className="absolute top-3 end-3 z-20 bg-white/90 backdrop-blur-sm text-zafting-text p-2.5 rounded-full shadow-md hover:scale-110 hover:bg-white transition-all duration-200"
                             >
                                 <ShoppingBag size={16} />
                             </button>

                             {/* Hangtag: name + price, always visible */}
                             <div className="absolute bottom-3 start-3 end-3 z-20">
                                 <div className="inline-flex flex-col bg-[#E8E0D9]/95 backdrop-blur-sm border border-zafting-text/10 rounded-lg shadow-md px-3 py-1.5 rotate-[-1.5deg] group-hover:rotate-0 transition-transform duration-300 max-w-full">
                                     <h4 className="font-serif text-sm text-zafting-text truncate">{product.name}</h4>
                                     <p className="text-sm font-medium text-zafting-text">{formatPriceToman(product.price)}</p>
                                 </div>
                             </div>
                        </div>
                    </div>
                ))
                )}
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
                        role="button"
                        tabIndex={0}
                        className="group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-2xl"
                        onClick={(e) => handleProductClick(product, e)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleProductClick(product, e);
                          }
                        }}
                     >
                         <div className="relative aspect-square bg-white/10 rounded-2xl overflow-hidden mb-4 border border-white/10">
                             <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-overlay group-hover:mix-blend-normal transition-all duration-300" />
                             <div className="absolute top-2 end-2 bg-white text-red-600 font-bold px-2 py-1 rounded text-xs shadow-sm">
                               {product.price > 0 && typeof product.discountPrice === 'number'
                                 ? `-${Math.round(((product.price - product.discountPrice) / product.price) * 100)}%`
                                 : '-'}
                             </div>
                         </div>
                         <div>
                             <h4 className="font-serif text-lg">{product.name}</h4>
                             <div className="flex gap-3 items-baseline">
                                 <span className="text-xl font-medium">{formatPriceToman(product.discountPrice)}</span>
                                 <span className="text-sm opacity-60 line-through">{formatPriceToman(product.price)}</span>
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
