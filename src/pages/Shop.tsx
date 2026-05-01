import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, ArrowLeft, ArrowDownLeft, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { PRODUCTS } from '../constants';

type ApiCategory = {
  id: string;
  title: string;
  slug: string;
  image?: string | null;
  parentId?: string | null;
};

type ApiCollection = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
};

type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
};

type UiCollectionCard = {
  id: string;
  image: string;
  tag: string;
  desc: string;
  bgColor: string;
  textColor: string;
};

export const Shop: React.FC = () => {
  const { t, direction, language } = useLanguage();
  const navigate = useNavigate();
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;
  
  // Reuse existing products for imagery
  const heroImage = PRODUCTS[2].image; // Marianne (Gown)
  const bottomImage = PRODUCTS[0].image; // Clara

  // Collection Data
  const fallbackCollections: UiCollectionCard[] = [
    {
      id: 'fallback-1',
      image: PRODUCTS[3].image,
      tag: t('collection.light.tag'),
      desc: t('collection.light.desc'),
      bgColor: 'bg-[#8CA2B0]',
      textColor: 'text-white',
    },
    {
      id: 'fallback-2',
      image: PRODUCTS[2].image,
      tag: t('collection.evening.tag'),
      desc: t('collection.evening.desc'),
      bgColor: 'bg-[#6B5B54]',
      textColor: 'text-[#E8E0D9]',
    },
    {
      id: 'fallback-3',
      image: PRODUCTS[1].image,
      tag: t('collection.casual.tag'),
      desc: t('collection.casual.desc'),
      bgColor: 'bg-[#2A2A2A]',
      textColor: 'text-[#E8E0D9]',
    },
  ];

  // Categories Data
  const fallbackCategoryImages = useMemo(
    () => [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596472537510-d3c761bb6aac?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551163943-3f6a2b03d289?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1200&auto=format&fit=crop',
    ],
    []
  );

  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_URL || 'https://api.d-style.ir',
    []
  );

  const getImageUrl = (path?: string | null) => {
    if (!path) return undefined;
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
      return path;
    }
    return `${apiBaseUrl}${path}`;
  };

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const [collectionCards, setCollectionCards] = useState<UiCollectionCard[]>(fallbackCollections);
  const [isCollectionsLoading, setIsCollectionsLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);

  const nextCollection = () => {
    if (collectionCards.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % collectionCards.length);
  };

  const getCardStyle = (index: number) => {
    // Calculate effective position in the circular queue relative to activeIndex
    // We want 3 visible states: 0 (Active), 1 (Back 1), 2 (Back 2)
    const len = collectionCards.length;
    // (index - activeIndex + len) % len gives us the distance from active
    const position = (index - activeIndex + len) % len;

    // We only want to render specific positions effectively
    if (position === 0) {
        return {
            zIndex: 30,
            transform: 'scale(1) translateX(0) rotate(0deg)',
            opacity: 1
        };
    } else if (position === 1) {
        // Behind
        return {
            zIndex: 20,
            transform: `scale(0.95) translateX(${direction === 'rtl' ? '-20px' : '20px'}) rotate(-3deg)`,
            opacity: 0.8
        };
    } else {
        // Way behind or just moving to back
        return {
            zIndex: 10,
            transform: `scale(0.9) translateX(${direction === 'rtl' ? '-40px' : '40px'}) rotate(-6deg)`,
            opacity: 0.6
        };
    }
  };

  useEffect(() => {
    const fetchCollections = async () => {
      setIsCollectionsLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/collections?page=1&limit=20`);
        const json = (await res.json()) as PaginatedResponse<ApiCollection>;
        const list = (json.data || [])
          .filter((c) => c.isDeleted !== true)
          .filter((c) => c.isActive !== false);

        const palette = [
          { bgColor: 'bg-[#8CA2B0]', textColor: 'text-white' },
          { bgColor: 'bg-[#6B5B54]', textColor: 'text-[#E8E0D9]' },
          { bgColor: 'bg-[#2A2A2A]', textColor: 'text-[#E8E0D9]' },
        ];

        const mapped: UiCollectionCard[] = list.slice(0, 6).map((c, idx) => {
          const colors = palette[idx % palette.length];
          return {
            id: c.id,
            image: getImageUrl(c.image) || fallbackCollections[idx % fallbackCollections.length].image,
            tag: `#${c.title}`,
            desc: c.description || '',
            bgColor: colors.bgColor,
            textColor: colors.textColor,
          };
        });

        setCollectionCards(mapped.length ? mapped : fallbackCollections);
        setActiveIndex(0);
      } catch (error) {
        console.error('Failed to fetch collections', error);
        setCollectionCards(fallbackCollections);
        setActiveIndex(0);
      } finally {
        setIsCollectionsLoading(false);
      }
    };

    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/categories?page=1&limit=100`);
        const json = (await res.json()) as PaginatedResponse<ApiCategory>;
        const unique = new Map<string, ApiCategory>();
        (json.data || []).forEach((c) => unique.set(c.id, c));
        const list = Array.from(unique.values());
        const ids = new Set(list.map((c) => c.id));

        const roots = list.filter((c) => !c.parentId || !ids.has(c.parentId));
        setCategories(roots.length > 0 ? roots : list);
      } catch (error) {
        console.error('Failed to fetch categories', error);
        setCategories([]);
      } finally {
        setIsCategoriesLoading(false);
      }
    };
    fetchCategories();
    fetchCollections();
  }, [apiBaseUrl]);

  return (
    <div className="w-full bg-[#E8E0D9] min-h-screen pt-20">
      
      {/* 2. Collections Section */}
      <section className="px-6 pb-20 max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-block px-4 py-1 border border-zafting-text/30 rounded-full text-xs uppercase tracking-widest mb-6">
              #collection
            </div>
            <h2 className="font-serif text-4xl md:text-6xl text-zafting-text leading-[0.9]">
              {t('collection.title')}
            </h2>
          </div>
          <button
            type="button"
            onClick={nextCollection}
            disabled={isCollectionsLoading || collectionCards.length <= 1}
            className="w-12 h-12 rounded-full bg-[#2A2A2A] text-white flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ArrowIcon size={20} />
          </button>
        </div>

        {isCollectionsLoading ? (
          <div className="flex justify-center py-16 text-zafting-text/60">
            <span className="text-sm uppercase tracking-widest">{t('loading') || 'Loading...'}</span>
          </div>
        ) : (
          <div className="relative h-[420px] md:h-[460px]">
            {collectionCards.slice(0, 3).map((c, idx) => {
              const style = getCardStyle(idx);
              return (
                <div
                  key={c.id}
                  className="absolute inset-0 transition-all duration-500 ease-out cursor-pointer"
                  style={style}
                  onClick={() => navigate(`/${language}/collection/${c.id}`)}
                >
                  <div className={`w-full h-full rounded-4xl overflow-hidden relative ${c.bgColor}`}>
                    <img
                      src={c.image}
                      alt={c.tag}
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between">
                      <div className={`inline-flex ${c.textColor} text-xs uppercase tracking-widest`}>
                        {c.tag}
                      </div>
                      <div className={`max-w-xl ${c.textColor}`}>
                        <p className="font-sans text-sm md:text-base opacity-90 leading-7">
                          {c.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>


   

      {/* 4. Category Grid Section (NEW) */}
      <section className="px-6 pb-32 max-w-[1600px] mx-auto">
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-serif text-4xl md:text-6xl text-zafting-text">
                {t('shop.cat.title')}
            </h2>
          </div>

          {isCategoriesLoading ? (
            <div className="flex justify-center py-16 text-zafting-text/60">
              <span className="text-sm uppercase tracking-widest">{t('loading') || 'Loading...'}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {categories.map((cat, idx) => {
                const img = getImageUrl(cat.image) || fallbackCategoryImages[idx % fallbackCategoryImages.length];
                return (
                  <div 
                    key={cat.id} 
                    className={`group relative h-[300px] md:h-[400px] rounded-4xl overflow-hidden cursor-pointer ${idx % 2 === 0 ? 'mt-0' : 'md:mt-8'}`}
                    onClick={() => navigate(`/${language}/category/${cat.id}`)}
                  >
                    <img 
                      src={img} 
                      alt={cat.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500"></div>
                    <div className="absolute bottom-0 inset-s-0 w-full p-6 flex justify-between items-end">
                      <div className="bg-zafting-bg/90 backdrop-blur-md px-6 py-3 rounded-full">
                        <h3 className="font-serif text-lg md:text-xl text-zafting-text">{cat.title}</h3>
                      </div>
                      <div className="w-12 h-12 bg-white text-zafting-text rounded-full flex items-center justify-center transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <ArrowUpRight size={20} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </section>

    </div>
  );
};
