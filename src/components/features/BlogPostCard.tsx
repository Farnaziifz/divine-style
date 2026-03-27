import { Link } from 'react-router-dom';

interface CardProps {
  lang: string;
  slug: string;
  title: string;
  category?: string | null;
  imageUrl?: string | null;
  large?: boolean;
}

export const BlogPostCard = ({ lang, slug, title, category, imageUrl, large }: CardProps) => {
  const img = imageUrl || null;
  return (
    <Link
      to={`/${lang}/journal/${slug}`}
      className={`relative rounded-2xl overflow-hidden shadow-sm bg-gradient-to-br from-gray-100 to-gray-200 group ${
        large ? 'aspect-[4/3]' : 'aspect-[3/4]'
      }`}
    >
      {img ? (
        <img
          src={img}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

      <div className="absolute top-4 start-4">
        {category ? (
          <span className="inline-flex items-center rounded-full bg-white/70 backdrop-blur px-3 py-1 text-xs font-medium text-gray-800">
            {category}
          </span>
        ) : null}
      </div>

      <div className="absolute bottom-4 start-4 end-4">
        <h3 className="text-white drop-shadow font-bold leading-snug text-lg md:text-xl">
          {title}
        </h3>

        <span className="inline-flex items-center mt-3 rounded-lg bg-white/80 backdrop-blur px-3 py-1 text-[11px] font-medium text-gray-700">
          {lang === 'fa' ? 'مشاهده' : 'Read more'}
        </span>
      </div>
    </Link>
  );
};
