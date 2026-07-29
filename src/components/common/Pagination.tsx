import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  page: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}

export const Pagination = ({ page, total, limit, onPageChange }: Props) => {
  const { language } = useLanguage();
  const lastPage = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < lastPage;

  const numbers = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(lastPage, page + 2); i++) {
    numbers.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!canPrev}
        className="min-h-11 px-4 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
      >
        {language === 'fa' ? 'قبلی' : 'Previous'}
      </button>
      {numbers.map((n) => (
        <button
          key={n}
          onClick={() => onPageChange(n)}
          className={`min-h-11 min-w-11 px-3 flex items-center justify-center rounded-lg border ${
            n === page
              ? 'bg-zafting-accent text-white border-zafting-accent'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!canNext}
        className="min-h-11 px-4 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
      >
        {language === 'fa' ? 'بعدی' : 'Next'}
      </button>
    </div>
  );
};
