/**
 * Shared page states used by every module: loading skeletons, empty
 * results, and error recoveries.
 */
import { Loader2, Inbox, AlertTriangle, RefreshCw } from "lucide-react";

export function LoadingState({ label = "Loading…", rows = 3, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label={label}>
      <div className="flex items-center justify-center py-6 text-[rgb(var(--zx-text-muted))]">
        <Loader2 className="animate-spin" size={22} />
        <span className="ml-2 text-sm font-medium">{label}</span>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-xl bg-[rgb(var(--zx-surface-hover))] animate-pulse"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 4, className = "" }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 ${className}`} role="status" aria-label="Loading summary">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-28 rounded-2xl bg-[rgb(var(--zx-surface-hover))] animate-pulse"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title = "Nothing here yet", description = "", action = null, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-14 px-6 ${className}`}>
      <div className="p-4 rounded-2xl bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))]">
        <Icon size={28} strokeWidth={1.6} />
      </div>
      <h3 className="mt-4 text-sm font-bold text-[rgb(var(--zx-text))]">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-[rgb(var(--zx-text-muted))] max-w-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message = "Something went wrong while loading this data.", onRetry = null, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-14 px-6 ${className}`}>
      <div className="p-4 rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
        <AlertTriangle size={28} strokeWidth={1.6} />
      </div>
      <h3 className="mt-4 text-sm font-bold text-[rgb(var(--zx-text))]">Unable to load data</h3>
      <p className="mt-1 text-sm text-[rgb(var(--zx-text-muted))] max-w-sm">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-teal-500 hover:bg-brand-teal-600 transition-colors"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      ) : null}
    </div>
  );
}
