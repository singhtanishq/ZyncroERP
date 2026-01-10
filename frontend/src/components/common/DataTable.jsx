/**
 * Generic professional data table used across all modules.
 *
 * Props:
 *  - columns: [{ key, header, className?, render?(row), sortable? }]
 *  - rows: array of row objects
 *  - loading, error: state flags
 *  - empty: { icon?, title?, description?, action? }
 *  - searchValue/onSearchChange: optional client-side search box
 *  - serverSearch: render a plain input that calls onSearchChange
 *    (parent debounces and passes it to the API) instead of filtering
 *  - pagination: { page, pageSize, total, onPageChange } (optional)
 *  - onRowClick: optional row handler
 *  - rowActions: render(row) for a trailing actions column
 */
import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState, LoadingState, ErrorState } from "./States";

export default function DataTable({
  columns,
  rows = [],
  keyField = "id",
  loading = false,
  error = null,
  onRetry = null,
  empty = {},
  searchValue = undefined,
  onSearchChange = null,
  searchPlaceholder = "Search…",
  pagination = null,
  onRowClick = null,
  rowActions = null,
  className = "",
}) {
  const [internalSearch, setInternalSearch] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const isControlledSearch = searchValue !== undefined && onSearchChange;
  const searchText = isControlledSearch ? searchValue : internalSearch;

  const processedRows = useMemo(() => {
    let data = rows;

    // Client-side filtering only when no server-side search handler given.
    if (!isControlledSearch && searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      data = data.filter((row) =>
        columns.some((col) => {
          const value = col.render ? null : row[col.key];
          return value != null && String(value).toLowerCase().includes(q);
        })
      );
    }

    if (sort.key) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortable !== false) {
        data = [...data].sort((a, b) => {
          const av = a[sort.key];
          const bv = b[sort.key];
          const res =
            typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av ?? "").localeCompare(String(bv ?? ""), undefined, { numeric: true });
          return sort.dir === "asc" ? res : -res;
        });
      }
    }

    return data;
  }, [rows, columns, searchText, isControlledSearch, sort]);

  const toggleSort = (key) => {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const showSearch = isControlledSearch || !onSearchChange;

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;

  return (
    <div className={`space-y-4 ${className}`}>
      {showSearch ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--zx-text-muted))]" />
            <input
              type="search"
              value={searchText ?? ""}
              onChange={(e) =>
                isControlledSearch ? onSearchChange(e.target.value) : setInternalSearch(e.target.value)
              }
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] placeholder:text-[rgb(var(--zx-text-muted))] focus:outline-none focus:ring-2 focus:ring-brand-teal-500/40 focus:border-brand-teal-500 transition"
            />
          </div>
        </div>
      ) : null}

      {loading ? (
        <LoadingState rows={4} label="" className="pt-2" />
      ) : error ? (
        <ErrorState message={String(error)} onRetry={onRetry} />
      ) : processedRows.length === 0 ? (
        <EmptyState {...empty} />
      ) : (
        <div className="rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] overflow-hidden">
          <div className="overflow-x-auto zx-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))]">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))] whitespace-nowrap ${col.thClassName || ""}`}
                    >
                      {col.sortable === false || !col.key ? (
                        col.header
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleSort(col.key)}
                          className="inline-flex items-center gap-1 hover:text-[rgb(var(--zx-text))] transition-colors"
                        >
                          {col.header}
                          {sort.key === col.key ? (
                            sort.dir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                          ) : null}
                        </button>
                      )}
                    </th>
                  ))}
                  {rowActions ? (
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">
                      Actions
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {processedRows.map((row, idx) => (
                  <tr
                    key={row[keyField] ?? idx}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`border-b border-[rgb(var(--zx-border))] last:border-0 transition-colors bg-[rgb(var(--zx-surface))] hover:bg-[rgb(var(--zx-surface-hover))] ${onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3.5 text-[rgb(var(--zx-text))] ${col.tdClassName || ""}`}>
                        {col.render ? col.render(row) : row[col.key] ?? "—"}
                      </td>
                    ))}
                    {rowActions ? (
                      <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {rowActions(row)}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination && !loading && !error && pagination.total > 0 ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p className="text-[rgb(var(--zx-text-muted))]">
            Showing{" "}
            <span className="font-semibold text-[rgb(var(--zx-text))]">
              {(pagination.page - 1) * pagination.pageSize + 1}–
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </span>{" "}
            of <span className="font-semibold text-[rgb(var(--zx-text))]">{pagination.total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="p-2 rounded-lg border border-[rgb(var(--zx-border))] disabled:opacity-40 hover:bg-[rgb(var(--zx-surface-hover))] transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-[rgb(var(--zx-surface-hover))] text-xs font-semibold">
              Page {pagination.page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className="p-2 rounded-lg border border-[rgb(var(--zx-border))] disabled:opacity-40 hover:bg-[rgb(var(--zx-surface-hover))] transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
