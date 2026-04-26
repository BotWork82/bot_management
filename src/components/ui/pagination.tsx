import React from "react";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
};

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange, pageSizeOptions = [10, 20, 50], className = "" }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const createPageArray = () => {
    const delta = 2; // window radius
    const range: number[] = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) range.push(i);
    // ensure first and last pages visible
    if (range[0] > 2) {
      range.unshift(-1); // gap
      range.unshift(1);
    } else if (range[0] === 2) {
      range.unshift(1);
    } else if (range[0] === 1) {
      // nothing
    }
    if (range[range.length - 1] < totalPages - 1) {
      range.push(-2); // gap
      range.push(totalPages);
    } else if (range[range.length - 1] === totalPages - 1) {
      range.push(totalPages);
    }
    return range;
  };

  const pages = createPageArray();

  const startItem = Math.min(total, (page - 1) * pageSize + 1);
  const endItem = Math.min(total, page * pageSize);

  return (
    <div className={`flex items-center justify-between gap-4 py-4 ${className}`}>
      <div className="text-xs text-muted-foreground">
        {total === 0 ? "Aucun élément" : `Affichage ${startItem}–${endItem} sur ${total}`}
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className={`h-8 px-3 rounded-md border bg-white text-sm ${page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"}`}
            aria-label="Précédent"
          >
            Prev
          </button>

          {pages.map((p, idx) =>
            p > 0 ? (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`h-8 px-3 rounded-md border text-sm ${p === page ? "bg-blue-600 text-white" : "bg-white hover:bg-slate-50"}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            ) : (
              <span key={`gap-${idx}`} className="px-2 text-sm text-muted-foreground">…</span>
            )
          )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className={`h-8 px-3 rounded-md border bg-white text-sm ${page >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"}`}
            aria-label="Suivant"
          >
            Next
          </button>
        </div>

        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
            }}
            className="h-8 px-2 rounded-md border bg-white text-sm"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt} / page</option>
            ))}
          </select>
        )}

        {/* mobile simple controls */}
        <div className="flex sm:hidden items-center gap-2">
          <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="h-8 w-8 rounded-md border flex items-center justify-center">◀</button>
          <div className="text-sm">{page} / {totalPages}</div>
          <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="h-8 w-8 rounded-md border flex items-center justify-center">▶</button>
        </div>
      </div>
    </div>
  );
}
