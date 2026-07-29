import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { blogService, type BlogCategory, type PaginatedResponse, type BlogPost } from '../services/blog.service';
import { Pagination } from '../components/common/Pagination';
import { Link, useSearchParams } from 'react-router-dom';
import { resolveImageUrl } from '../utils/imageUrl';

// الگوی دقیق گرید نمونه (۶ کارت):
// 1) کارت افقی بزرگ (۲ ستون)
// 2) کارت عمودی
// 3) کارت عمودی
// 4) کارت عمودی
// 5) کارت عمودی
// 6) کارت افقی بزرگ (۲ ستون)
const cardPattern = [
  'lg:col-span-2 lg:row-span-1',
  'lg:col-span-1 lg:row-span-2',
  'lg:col-span-1 lg:row-span-2',
  'lg:col-span-1 lg:row-span-2',
  'lg:col-span-1 lg:row-span-2',
  'lg:col-span-2 lg:row-span-1',
];

const cardAspectPattern = [
  'aspect-[16/10] lg:aspect-auto',
  'aspect-[3/4] lg:aspect-auto',
  'aspect-[3/4] lg:aspect-auto',
  'aspect-[3/4] lg:aspect-auto',
  'aspect-[3/4] lg:aspect-auto',
  'aspect-[16/10] lg:aspect-auto',
];

const fallbackGradients = [
  'from-[#7ec8c6] to-[#d8ecec]',
  'from-[#0f253f] to-[#1d3557]',
  'from-[#d8b294] to-[#efdfd1]',
  'from-[#7bc8e6] to-[#d4edf8]',
  'from-[#f3b8c8] to-[#fde5ec]',
  'from-[#8fcbf2] to-[#d5eefc]',
];

export const Journal = () => {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [posts, setPosts] = useState<PaginatedResponse<BlogPost> | null>(null);
  const [loading, setLoading] = useState(true);

  const page = Number(searchParams.get('page') || '1');
  const categorySlug = searchParams.get('category') || '';
  // این گرید بر اساس الگوی ۶ کارته طراحی شده است (برای صفحه‌بندی دقیق)
  const limit = 6;

  useEffect(() => {
    blogService.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    blogService
      .getPosts({
        page,
        limit,
        ...(categorySlug ? { categorySlug } : {}),
      })
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  }, [page, categorySlug]);

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('category', slug);
    else next.delete('category');
    next.set('page', '1');
    setSearchParams(next);
  };
  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  const cards = useMemo(() => posts?.data ?? [], [posts]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-10">
      <div className="mb-9 space-y-3">
        <h1 className="font-serif text-4xl text-zafting-text md:text-5xl">
          {language === 'fa' ? 'مجله مد.' : 'Fashion Journal.'}
        </h1>
        <p className="max-w-xl text-sm leading-7 text-zafting-text/70 md:text-base">
          {language === 'fa'
            ? 'جدیدترین و بهترین مقاله‌های سبک زندگی و مد که توسط تیم تحریریه انتخاب شده‌اند.'
            : 'The latest lifestyle and fashion stories, curated by our editorial team.'}
        </p>
      </div>

      {/* Categories filter */}
      <div className="mb-10 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setCategory('')}
          className={`px-4 py-2 rounded-full border text-sm transition-colors ${
            !categorySlug
              ? 'bg-zafting-text text-zafting-bg border-zafting-text'
              : 'border-zafting-text/20 text-zafting-text hover:bg-zafting-text/5'
          }`}
        >
          {language === 'fa' ? 'همه' : 'All'}
        </button>
        {categories.map((c: BlogCategory) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.slug)}
            className={`px-4 py-2 rounded-full border text-sm transition-colors ${
              categorySlug === c.slug
                ? 'bg-zafting-text text-zafting-bg border-zafting-text'
                : 'border-zafting-text/20 text-zafting-text hover:bg-zafting-text/5'
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:auto-rows-[170px] lg:grid-cols-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-zafting-text/60">
            {language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}
          </div>
        ) : cards.length === 0 ? (
          <div className="col-span-full py-16 text-center text-zafting-text/60">
            {language === 'fa' ? 'مطلبی یافت نشد' : 'No posts found'}
          </div>
        ) : (
          <>
            {cards.map((p: BlogPost, idx: number) => {
              const pIdx = idx % cardPattern.length;
              const cardSpanClass = cardPattern[pIdx];
              const cardAspectClass = cardAspectPattern[pIdx];
              const fallbackClass = fallbackGradients[pIdx];
              const imageUrl = resolveImageUrl(p.coverImageUrl);
              const hasImage = Boolean(imageUrl);
              return (
                <div key={p.id} className={`sm:col-span-1 ${cardSpanClass}`}>
                  <Link
                    to={`/${language}/journal/${p.slug}`}
                    className={`group relative block overflow-hidden rounded-2xl shadow-[0_10px_30px_-20px_rgba(16,24,40,0.5)] ${cardAspectClass} lg:h-full`}
                  >
                    {hasImage ? (
                      <img
                        src={imageUrl || ''}
                        alt={p.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-linear-to-br ${fallbackClass}`} />
                    )}

                    <div
                      className={`absolute inset-0 ${
                        hasImage
                          ? 'bg-linear-to-t from-black/55 via-black/25 to-transparent'
                          : 'bg-linear-to-t from-black/20 via-transparent to-transparent'
                      }`}
                    />

                    <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5">
                      <div>
                        {p.category?.title ? (
                          <span className="inline-flex rounded-md bg-white/85 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-gray-700 backdrop-blur">
                            {p.category.title}
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <h3 className="line-clamp-3 text-xl font-extrabold leading-tight text-white sm:text-[32px] sm:leading-[1.12]">
                          {p.title}
                        </h3>
                        <span className="mt-4 inline-flex rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700">
                          {language === 'fa' ? 'مطالعه مقاله' : 'Read Article'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Pagination */}
      {posts ? (
        <Pagination
          page={posts.meta.page}
          limit={posts.meta.limit}
          total={posts.meta.total}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
};
