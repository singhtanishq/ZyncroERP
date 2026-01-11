import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Users,
  Building2,
  Wallet,
  History,
  TrendingUp,
  Clock,
  ChevronRight,
  Receipt,
  ArrowUpRight
} from "lucide-react";
import apiClient from "../../../lib/api/apiClient";
import { SkeletonCards, ErrorState } from "../../../components/common/States";
import StatusBadge from "../../../components/common/StatusBadge";

/**
 * Internal payment management overview. The external payment portal has
 * been retired — all payment activity is managed inside the ERP.
 */

const MODULES = [
  {
    to: "/dashboard/payments/student-fees",
    icon: Users,
    title: "Student Fees",
    description: "Track per-student fee status and record payments against enrollments.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "group-hover:border-blue-500/30",
  },
  {
    to: "/dashboard/payments/franchise",
    icon: Building2,
    title: "Franchise Payments",
    description: "Manage franchise revenue sharing, dues and the commission rate.",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
    border: "group-hover:border-purple-500/30",
  },
  {
    to: "/dashboard/payments/faculty",
    icon: Wallet,
    title: "Faculty Payouts",
    description: "Review salaries and mark monthly faculty payouts as paid.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "group-hover:border-emerald-500/30",
  },
  {
    to: "/dashboard/payments/history",
    icon: History,
    title: "Payment History",
    description: "Browse recorded payment activity across the organization.",
    color: "text-brand-teal-600 dark:text-brand-teal-400",
    bg: "bg-brand-teal-500/10",
    border: "group-hover:border-brand-teal-500/30",
  },
];

export default function ManagePayments() {
  const [stats, setStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get("/admin/dashboard");
      setStats(data.stats);
      setRecentPayments(data.recent?.payments ?? data.recentPayments ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load payment overview.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
      
      {/* Decorative Background Glows - kept very subtle */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <div className="relative z-10 flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-600 dark:text-brand-teal-400 uppercase w-max mb-1">
          <CreditCard size={14} strokeWidth={2.5} />
          Financial Hub
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
          Payment Management
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] text-[15px] max-w-2xl leading-relaxed mt-1">
          Centralized control for all organizational transactions. Record student fees, settle franchise revenue shares, and process payouts securely.
        </p>
      </div>

      {/* SUMMARY */}
      {loading ? (
        <SkeletonCards count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 relative z-10">
          {/* Revenue Card */}
          <div className="group relative p-6 rounded-3xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] hover:shadow-xl hover:shadow-brand-teal-500/5 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">
                Total Revenue
              </span>
              <div className="p-2.5 rounded-xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-400">
                <TrendingUp size={20} strokeWidth={2.5} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight">
                ₹{Number(stats?.revenue ?? 0).toLocaleString("en-IN")}
              </p>
              <p className="mt-1.5 text-[13px] text-[rgb(var(--zx-text-muted))] font-medium flex items-center gap-1.5">
                <ArrowUpRight size={14} className="text-brand-teal-500" strokeWidth={2.5} /> Recorded in ledger
              </p>
            </div>
          </div>

          {/* Pending Payments Card */}
          <div className="group relative p-6 rounded-3xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">
                Pending Payments
              </span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock size={20} strokeWidth={2.5} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight">
                {stats?.pending_payments ?? 0}
              </p>
              <p className="mt-1.5 text-[13px] text-[rgb(var(--zx-text-muted))] font-medium">
                Transactions awaiting completion
              </p>
            </div>
          </div>

          {/* Franchises Card */}
          <div className="group relative p-6 rounded-3xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 sm:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">
                Active Franchises
              </span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Building2 size={20} strokeWidth={2.5} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight">
                {stats?.franchises ?? 0}
              </p>
              <p className="mt-1.5 text-[13px] text-[rgb(var(--zx-text-muted))] font-medium">
                Revenue-sharing partners
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE LINKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
        {MODULES.map(({ to, icon: Icon, title, description, color, bg, border }) => (
          <Link
            key={to}
            to={to}
            className={`group flex items-start gap-4 p-5 rounded-3xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] ${border} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
          >
            <span className={`p-4 rounded-[1.25rem] ${bg} ${color} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
              <Icon size={22} strokeWidth={2.5} />
            </span>
            <span className="flex-1 min-w-0 pt-1">
              <span className={`block text-[17px] font-bold text-[rgb(var(--zx-text))] transition-colors`}>
                {title}
              </span>
              <span className="mt-1 block text-[14px] text-[rgb(var(--zx-text-muted))] leading-relaxed font-medium">
                {description}
              </span>
            </span>
            <div className="pt-2">
              <div className="w-8 h-8 rounded-full bg-[rgb(var(--zx-border))] flex items-center justify-center group-hover:bg-[rgb(var(--zx-text))] transition-colors">
                <ChevronRight
                  size={16}
                  strokeWidth={2.5}
                  className="text-[rgb(var(--zx-text-muted))] group-hover:text-[rgb(var(--zx-surface))] transition-colors"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* RECENT PAYMENTS */}
      {!loading && !error && (
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] flex items-center gap-2">
              <Receipt size={16} /> Recent Ledger Activity
            </h2>
            {recentPayments.length > 0 && (
              <Link to="/dashboard/payments/history" className="text-xs font-bold text-brand-teal-600 hover:text-brand-teal-700 dark:text-brand-teal-400 uppercase tracking-wider flex items-center gap-1 transition-colors">
                View All <ChevronRight size={14} strokeWidth={2.5} />
              </Link>
            )}
          </div>
          
          {recentPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 rounded-3xl border border-dashed border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] text-center">
              <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--zx-border))] flex items-center justify-center text-[rgb(var(--zx-text-muted))] mb-4">
                <Receipt size={24} />
              </div>
              <h3 className="text-[17px] font-bold text-[rgb(var(--zx-text))]">No Transactions Yet</h3>
              <p className="mt-1.5 text-[14px] font-medium text-[rgb(var(--zx-text-muted))] max-w-sm">
                Payment activity will appear here once transactions are recorded in the ledger.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] overflow-hidden shadow-sm">
              <div className="overflow-x-auto zx-scroll">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))]">
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Reference</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Payer</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Amount</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Status</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgb(var(--zx-border))]">
                    {recentPayments.map((p) => (
                      <tr key={p.id} className="group hover:bg-[rgb(var(--zx-surface-hover))] transition-colors">
                        <td className="px-5 py-4 font-mono text-xs font-semibold text-[rgb(var(--zx-text-muted))] group-hover:text-[rgb(var(--zx-text))] transition-colors">
                          {p.merchant_txn_no || p.pg_txn_id || `#${p.id}`}
                        </td>
                        <td className="px-5 py-4 text-[rgb(var(--zx-text))] font-medium">
                          {p.name || p.email || "—"}
                        </td>
                        <td className="px-5 py-4 font-bold text-[rgb(var(--zx-text))]">
                          ₹{Number(p.amount ?? 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-5 py-4 text-[rgb(var(--zx-text-muted))] text-[13px] font-medium">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}