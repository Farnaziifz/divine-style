import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Product } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { Search as SearchIcon, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
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

type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; lastPage: number };
};

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t, direction, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [inputValue, setInputValue] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

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
    setInputValue(query);
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setTotalPages(1);
      setTotal(0);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          search: query,
          page: String(currentPage),
          limit: String(itemsPerPage),
        });
        const res = await fetch(`${apiBaseUrl}/products?${params.toString()}`);
        const json = (await res.json()) as PaginatedResponse<ApiProduct>;
        setProducts((json.data || []).map(toUiProduct));
        setTotalPages(json.meta?.lastPage || 1);
        setTotal(json.meta?.total || 0);
      } catch (error) {
        console.error('Failed to fetch search results', error);
        setProducts([]);
        setTotalPages(1);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [apiBaseUrl, query, currentPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    setSearchParams(trimmed ? { q: trimmed } : {});
  };

  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;
  const BackArrowIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const handleProductClick = (product: Product) => {
    navigate(`/${language}/product/${product.id}`);
  };

  return (
    <div className="min-h-screen bg-[#E8E0D9] pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-3xl mx-auto mb-12">
        <h1 className="font-serif text-4xl md:text-6xl text-zafting-text mb-8 text-center">
          {t('search.title')}
        </h1>
        <form onSubmit={handleSubmit} className="relative">
          <SearchIcon
            size={20}
            className="absolute top-1/2 -translate-y-1/2 start-5 text-zafting-text/50"
          />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('search.placeholder')}
            autoFocus
            className="w-full ps-14 pe-32 py-5 rounded-full border border-zafting-text/20 bg-white/70 outline-none text-lg focus:border-zafting-text transition-colors"
          />
          <button
            type="submit"
            className="absolute top-1/2 -translate-y-1/2 end-2 flex items-center gap-2 bg-zafting-text text-zafting-bg px-6 py-3 rounded-full text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            {t('search.submit')}
          </button>
        </form>
      </div>

      {!query.trim() ? (
        <div className="text-center py-20 text-zafting-text/50">
          <span className="text-sm uppercase tracking-widest">{t('search.prompt')}</span>
        </div>
      ) : isLoading ? (
        <div className="text-center py-20 text-zafting-text/60">
          <span className="text-sm uppercase tracking-widest">{t('loading')}</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-zafting-text/60">
          <span className="text-sm uppercase tracking-widest">{t('search.noResults')}</span>
        </div>
      ) : (
        <>
          <p className="text-center text-sm text-zafting-text/50 mb-10 uppercase tracking-widest">
            {t('search.resultsCount').replace('{count}', String(total))}
          </p>

          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
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
        </>
      )}
    </div>
  );
};
