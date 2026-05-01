import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
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

type ApiCollection = {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
};

type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; lastPage: number };
};

type UiProductCard = {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  discountPrice?: number;
  category: string;
};

export const Collection: React.FC = () => {
  const { id: collectionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, direction, language } = useLanguage();
  const BackArrowIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  const [collection, setCollection] = useState<ApiCollection | null>(null);
  const [products, setProducts] = useState<UiProductCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getImageUrl = (path?: string | null) => {
    return resolveImageUrl(path) ?? '';
  };

  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  const toUiProduct = (p: ApiProduct): UiProductCard => {
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
      title: p.title,
      description: p.description ?? '',
      image: getImageUrl(p.images?.[0]) || '',
      price,
      discountPrice,
      category: p.category?.title || '',
    };
  };

  useEffect(() => {
    const fetchCollectionAndProducts = async () => {
      if (!collectionId) return;
      setIsLoading(true);
      try {
        const [colRes, productsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/collections/${collectionId}`),
          fetch(`${apiBaseUrl}/products?collectionId=${collectionId}&page=1&limit=24`),
        ]);

        if (colRes.ok) {
          const col = (await colRes.json()) as ApiCollection;
          setCollection(col);
        } else {
          setCollection(null);
        }

        const json = (await productsRes.json()) as PaginatedResponse<ApiProduct>;
        setProducts((json.data || []).map(toUiProduct));
      } catch (error) {
        console.error('Failed to fetch collection/products', error);
        setCollection(null);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionAndProducts();
  }, [apiBaseUrl, collectionId]);

  return (
    <div className="min-h-screen bg-[#E8E0D9] pt-24 pb-20">
      <header className="px-6 md:px-12 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <button
            onClick={() => navigate(`/${language}/shop`)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity mb-3"
          >
            <BackArrowIcon size={14} />
            {t('shop.cat.title')}
          </button>
          <h1 className="font-serif text-5xl md:text-7xl text-zafting-text">
            {collection?.title || ''}
          </h1>
          {collection?.description ? (
            <p className="mt-4 text-zafting-text/70 max-w-2xl leading-relaxed">
              {collection.description}
            </p>
          ) : null}
        </div>
      </header>

      {isLoading ? (
        <div className="px-6 md:px-12 py-16 text-zafting-text/60">
          <span className="text-sm uppercase tracking-widest">{t('loading') || 'Loading...'}</span>
        </div>
      ) : products.length === 0 ? (
        <div className="px-6 md:px-12 py-16 text-zafting-text/70">
          {language === 'fa' ? 'محصولی برای این کالکشن پیدا نشد.' : 'No products found for this collection.'}
        </div>
      ) : (
        <section className="px-6 md:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {products.map((p, idx) => (
              <article
                key={p.id}
                className={`group relative rounded-4xl overflow-hidden border border-white/60 bg-white/40 backdrop-blur-sm cursor-pointer ${idx % 2 === 0 ? '' : 'sm:translate-y-2'}`}
                onClick={() => navigate(`/${language}/product/${p.id}`)}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
                  <div className="absolute top-5 end-5 w-11 h-11 bg-white/80 backdrop-blur-md text-zafting-text rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpRight size={18} />
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-serif text-xl text-zafting-text truncate">{p.title}</h3>
                      {p.category ? (
                        <p className="text-xs uppercase tracking-widest text-zafting-text/50 mt-2 truncate">
                          {p.category}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4">
                    {typeof p.discountPrice === 'number' && p.discountPrice < p.price ? (
                      <div className="flex items-baseline gap-3">
                        <span className="text-lg font-medium text-zafting-text">
                          {formatPriceToman(p.discountPrice)}
                        </span>
                        <span className="text-sm text-zafting-text/50 line-through">
                          {formatPriceToman(p.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-medium text-zafting-text">
                        {formatPriceToman(p.price)}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
