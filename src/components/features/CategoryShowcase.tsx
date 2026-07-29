import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getApiBaseUrl, resolveImageUrl } from '../../utils/imageUrl';

type ApiCategory = {
  id: string;
  title: string;
  slug: string;
  image?: string | null;
  parentId?: string | null;
};

type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; lastPage: number };
};

const MAX_CATEGORIES = 6;

const fallbackCategoryImages = [
  'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1596472537510-d3c761bb6aac?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551163943-3f6a2b03d289?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1200&auto=format&fit=crop',
];

export const CategoryShowcase: React.FC = () => {
  const { t, direction, language } = useLanguage();
  const navigate = useNavigate();
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/categories?page=1&limit=100`);
        const json = (await res.json()) as PaginatedResponse<ApiCategory>;
        if (cancelled) return;
        const unique = new Map<string, ApiCategory>();
        (json.data || []).forEach((c) => unique.set(c.id, c));
        const list = Array.from(unique.values());
        const ids = new Set(list.map((c) => c.id));
        const roots = list.filter((c) => !c.parentId || !ids.has(c.parentId));
        setCategories((roots.length > 0 ? roots : list).slice(0, MAX_CATEGORIES));
      } catch (error) {
        console.error('Failed to fetch categories', error);
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  if (!isLoading && categories.length === 0) return null;

  return (
    <section className="px-6 py-20 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end mb-12">
        <h2 className="font-serif text-4xl md:text-6xl text-zafting-text">
          {t('shop.cat.title')}
        </h2>
        <button
          type="button"
          onClick={() => navigate(`/${language}/shop`)}
          className="hidden sm:flex items-center gap-2 text-sm uppercase tracking-widest text-zafting-text/70 hover:text-zafting-text transition-colors cursor-pointer"
        >
          {t('cat.viewAll')}
          <ArrowIcon size={16} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-zafting-text/60">
          <span className="text-sm uppercase tracking-widest">{t('loading')}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat, idx) => {
            const img = resolveImageUrl(cat.image) || fallbackCategoryImages[idx % fallbackCategoryImages.length];
            return (
              <div
                key={cat.id}
                role="button"
                tabIndex={0}
                className={`group relative h-[220px] md:h-[320px] rounded-4xl overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${idx % 2 === 0 ? 'mt-0' : 'md:mt-8'}`}
                onClick={() => navigate(`/${language}/category/${cat.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/${language}/category/${cat.id}`);
                  }
                }}
              >
                <img
                  src={img}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />
                <div className="absolute bottom-0 inset-s-0 w-full p-5 flex justify-between items-end">
                  <div className="bg-zafting-bg/90 backdrop-blur-md px-5 py-2.5 rounded-full">
                    <h3 className="font-serif text-base md:text-lg text-zafting-text">{cat.title}</h3>
                  </div>
                  <div className="w-11 h-11 bg-white text-zafting-text rounded-full flex items-center justify-center transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate(`/${language}/shop`)}
        className="sm:hidden mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-full border border-zafting-text/20 text-sm uppercase tracking-widest text-zafting-text cursor-pointer"
      >
        {t('cat.viewAll')}
        <ArrowIcon size={16} />
      </button>
    </section>
  );
};
