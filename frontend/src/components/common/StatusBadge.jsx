/**
 * Shared status → badge styling for consistent status indicators across
 * all dashboards. Color is never the only signal — the label text always
 * reads out the status.
 */

const TONES = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  red: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20",
  teal: "bg-brand-teal-50 text-brand-teal-700 ring-brand-teal-600/20 dark:bg-brand-teal-500/10 dark:text-brand-teal-300 dark:ring-brand-teal-400/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20",
};

const STATUS_MAP = {
  // generic
  active: "green",
  approved: "green",
  paid: "green",
  present: "green",
  verified: "green",
  completed: "green",
  success: "green",
  issued: "green",

  pending: "amber",
  partial: "amber",
  unpaid: "amber",
  draft: "amber",
  upcoming: "amber",
  scheduled: "amber",
  submitted: "amber",
  verification_pending: "amber",
  postponed: "amber",

  inactive: "slate",
  cancelled: "slate",
  canceled: "slate",
  withdrawn: "slate",

  failed: "red",
  rejected: "red",
  overdue: "red",
  live: "red",
  absent: "red",
  late: "red",

  // role-ish labels
  admin: "violet",
  faculty: "blue",
  student: "teal",
  franchise: "violet",
  employee: "blue",
};

export function toneForStatus(status) {
  if (!status) return "slate";
  return STATUS_MAP[String(status).toLowerCase()] || "slate";
}

export default function StatusBadge({ status, tone, className = "" }) {
  const resolved = tone || toneForStatus(status);
  const label = String(status ?? "—")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap ${TONES[resolved]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
