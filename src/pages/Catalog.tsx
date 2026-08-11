import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { Filter, SlidersHorizontal, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';
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
  variants?: ApiProductVariant[];
};

type ApiCategory = {
  id: string;
  title: string;
  parentId?: string | null;
};

type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; lastPage: number };
};

export const Catalog: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t, direction, language } = useLanguage();

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  type SortOption = 'newest' | 'price_asc' | 'price_desc';
  const [sort, setSort] = useState<SortOption>('newest');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceDraft, setPriceDraft] = useState<{ min: string; max: string }>({ min: '', max: '' });

  const itemsPerPage = 12;
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const getImageUrl = (path?: string | null) => resolveImageUrl(path) ?? '';

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
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/categories?page=1&limit=100`);
        if (!res.ok) return;
        const json = (await res.json()) as PaginatedResponse<ApiCategory>;
        const list = json.data || [];
        const ids = new Set(list.map((c) => c.id));
        const roots = list.filter((c) => !c.parentId || !ids.has(c.parentId));
        setCategories(roots.length > 0 ? roots : list);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, [apiBaseUrl]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(itemsPerPage),
          sort,
        });
        if (selectedCategoryId) params.set('categoryId', selectedCategoryId);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        const res = await fetch(`${apiBaseUrl}/products?${params.toString()}`);
        const json = (await res.json()) as PaginatedResponse<ApiProduct>;
        setProducts((json.data || []).map(toUiProduct));
        setTotalPages(json.meta?.lastPage || 1);
        setTotal(json.meta?.total || 0);
      } catch (error) {
        console.error('Failed to fetch catalog products', error);
        setProducts([]);
        setTotalPages(1);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [apiBaseUrl, selectedCategoryId, currentPage, sort, minPrice, maxPrice]);

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const BackArrowIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const handleProductClick = (product: Product) => {
    navigate(`/${language}/product/${product.id}`);
  };

  return (
    <div className="min-h-screen bg-[#E8E0D9] pt-28 pb-20">
      {/* Header & Filters */}
      <header className="px-6 md:px-12 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h1 className="font-serif text-5xl md:text-7xl text-zafting-text">
          {t('catalog.title')}
        </h1>

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

      {/* Category Chips */}
      {categories.length > 1 && (
        <div className="mb-12 overflow-x-auto px-6 md:px-12 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-3 min-w-max">
            <button
              onClick={() => { setSelectedCategoryId(null); setCurrentPage(1); }}
              className={`px-5 py-2 rounded-full text-sm whitespace-nowrap border transition-colors cursor-pointer ${
                selectedCategoryId === null
                  ? 'bg-zafting-text text-zafting-bg border-zafting-text'
                  : 'border-zafting-text/20 hover:bg-zafting-text/10'
              }`}
            >
              {t('catalog.allCategories')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategoryId(cat.id); setCurrentPage(1); }}
                className={`px-5 py-2 rounded-full text-sm whitespace-nowrap border transition-colors cursor-pointer ${
                  cat.id === selectedCategoryId
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

      {/* Product Grid */}
      <section className="px-6 md:px-12">
        {!isLoading && (
          <p className="text-sm text-zafting-text/50 mb-8 uppercase tracking-widest">
            {t('search.resultsCount').replace('{count}', String(total))}
          </p>
        )}

        {isLoading ? (
          <div className="text-center py-24 text-zafting-text/60">
            <span className="text-sm uppercase tracking-widest">{t('loading')}</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-zafting-text/60">
            <span className="text-sm uppercase tracking-widest">{t('empty')}</span>
          </div>
        ) : (
          <div className="max-w-[1600px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                role="button"
                tabIndex={0}
                className="group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zafting-text rounded-lg"
                onClick={() => handleProductClick(product)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleProductClick(product);
                  }
                }}
              >
                <div className="relative aspect-[2/3] bg-white shadow-md rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />

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

                  <div className="absolute bottom-3 start-3 end-3 z-20">
                    <div className="inline-flex flex-col bg-[#E8E0D9]/95 backdrop-blur-sm border border-zafting-text/10 rounded-lg shadow-md px-3 py-1.5 max-w-full">
                      <h4 className="font-serif text-sm text-zafting-text truncate">{product.name}</h4>
                      {typeof product.discountPrice === 'number' && product.discountPrice < product.price ? (
                        <div className="flex items-baseline gap-2">
                          <p className="text-sm font-medium text-zafting-text">{formatPriceToman(product.discountPrice)}</p>
                          <p className="text-xs opacity-50 line-through">{formatPriceToman(product.price)}</p>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-zafting-text">{formatPriceToman(product.price)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-16 text-sm font-sans">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-10 h-10 rounded-full border border-zafting-text/30 flex items-center justify-center disabled:opacity-30 hover:bg-zafting-text hover:text-white transition-colors"
            >
              <BackArrowIcon size={16} />
            </button>
            <span className="opacity-60">
              {t('cat.page')} {currentPage} {t('cat.page.of')} {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-10 h-10 rounded-full border border-zafting-text/30 flex items-center justify-center disabled:opacity-30 hover:bg-zafting-text hover:text-white transition-colors"
            >
              <ArrowIcon size={16} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
