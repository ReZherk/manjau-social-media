import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalElements, onPageChange }: PaginationProps) {
  const safePage = Number.isInteger(page) && page >= 0 ? page : 0;
  const safeTotalPages = Number.isInteger(totalPages) && totalPages >= 0 ? totalPages : 0;
  const safeTotalElements = Number.isFinite(totalElements) && totalElements >= 0 ? totalElements : 0;
  const changePage = (nextPage: number) => {
    if (!Number.isInteger(nextPage) || nextPage < 0 || nextPage >= safeTotalPages) return;
    onPageChange(nextPage);
  };

  if (safeTotalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-text-muted">
        Total: {safeTotalElements} registros
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => changePage(safePage - 1)}
          disabled={safePage === 0}
          className="btn-secondary p-2"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-text-muted px-2">
          {safePage + 1} / {safeTotalPages}
        </span>
        <button
          onClick={() => changePage(safePage + 1)}
          disabled={safePage >= safeTotalPages - 1}
          className="btn-secondary p-2"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
