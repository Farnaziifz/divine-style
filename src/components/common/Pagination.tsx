interface Props {
  page: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}

export const Pagination = ({ page, total, limit, onPageChange }: Props) => {
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
        className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
      >
        قبلی
      </button>
      {numbers.map((n) => (
        <button
          key={n}
          onClick={() => onPageChange(n)}
          className={`px-3 py-1.5 rounded-lg border ${
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
        className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
      >
        بعدی
      </button>
    </div>
  );
};

