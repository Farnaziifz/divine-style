import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { blogService, type BlogPostDetail } from '../services/blog.service';
import { useLanguage } from '../contexts/LanguageContext';
import { resolveImageUrl } from '../utils/imageUrl';

export const JournalPost = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError('');
    blogService
      .getPostBySlug(slug)
      .then((res) => setPost(res))
      .catch(() => setError(language === 'fa' ? 'مطلب یافت نشد' : 'Post not found'))
      .finally(() => setLoading(false));
  }, [slug, language]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="py-24 text-center text-zafting-text/60">
          {language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (!post || error) {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="space-y-4 py-20 text-center">
          <p className="text-zafting-text/70">{error || (language === 'fa' ? 'مطلب یافت نشد' : 'Post not found')}</p>
          <Link
            to={`/${language}/journal`}
            className="inline-flex rounded-lg bg-zafting-text px-4 py-2 text-sm text-zafting-bg"
          >
            {language === 'fa' ? 'بازگشت به مجله' : 'Back to journal'}
          </Link>
        </div>
      </div>
    );
  }

  const coverSrc = resolveImageUrl(post.coverImageUrl);

  return (
    <article className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <Link
        to={`/${language}/journal`}
        className="mb-6 inline-flex text-sm text-zafting-text/70 hover:text-zafting-text"
      >
        {language === 'fa' ? '← بازگشت به مجله' : '← Back to journal'}
      </Link>

      <header className="mb-8">
        {post.category?.title ? (
          <span className="mb-3 inline-flex rounded-md bg-zafting-accent/10 px-2.5 py-1 text-xs font-semibold text-zafting-accent">
            {post.category.title}
          </span>
        ) : null}
        <h1 className="font-serif text-3xl leading-tight text-zafting-text sm:text-4xl">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="mt-4 text-base leading-7 text-zafting-text/75">{post.excerpt}</p>
        ) : null}
      </header>

      {coverSrc ? (
        <img
          src={coverSrc}
          alt={post.coverImageAlt || post.title}
          className="mb-8 h-auto w-full rounded-2xl object-cover"
        />
      ) : null}

      <div
        className="prose prose-slate max-w-none leading-8 prose-headings:font-serif"
        dangerouslySetInnerHTML={{ __html: post.content || '' }}
      />
    </article>
  );
};
