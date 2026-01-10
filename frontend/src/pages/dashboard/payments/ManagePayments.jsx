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
} from "lucide-react";
import apiClient from "../../../lib/api/apiClient";
import { SkeletonCards, ErrorState } from "../../../components/common/States";
import StatusBadge from "../../../components/common/StatusBadge";

/**
 * Internal payment management overview. The external payment portal has
 * been retired — all payment activity is managed inside the ERP:
 * student fees, franchise payments, faculty payouts and the payment
 * ledger recorded in the payments database.
 */

const MODULES = [
  {
    to: "/dashboard/payments/student-fees",
    icon: Users,
    title: "Student Fees",
    description: "Track per-student fee status and record payments against enrollments.",
  },
  {
    to: "/dashboard/payments/franchise",
    icon: Building2,
    title: "Franchise Payments",
    description: "Manage franchise revenue sharing, dues and the commission rate.",
  },
  {
    to: "/dashboard/payments/faculty",
    icon: Wallet,
    title: "Faculty Payouts",
    description: "Review salaries and mark monthly faculty payouts as paid.",
  },
  {
    to: "/dashboard/payments/history",
    icon: History,
    title: "Payment History",
    description: "Browse recorded payment activity across the organization.",
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
      // The admin dashboard endpoint already aggregates payment stats.
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
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-300">
            <CreditCard size={26} />
          </span>
          Payment Management
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm max-w-2xl">
          All payments are managed internally — record student fee payments, settle
          franchise revenue shares and process faculty payouts from the modules below.
        </p>
      </div>

      {/* SUMMARY */}
      {loading ? (
        <SkeletonCards count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">
                Total Revenue
              </span>
              <TrendingUp className="text-brand-teal-500" size={18} />
            </div>
            <p className="mt-3 text-2xl font-bold text-[rgb(var(--zx-text))]">
              ₹{Number(stats?.revenue ?? 0).toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-[rgb(var(--zx-text-muted))]">
              Successful transactions in the payment ledger
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">
                Pending Payments
              </span>
              <Clock className="text-amber-500" size={18} />
            </div>
            <p className="mt-3 text-2xl font-bold text-[rgb(var(--zx-text))]">
              {stats?.pending_payments ?? 0}
            </p>
            <p className="mt-1 text-xs text-[rgb(var(--zx-text-muted))]">
              Transactions awaiting completion
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">
                Active Franchises
              </span>
              <Building2 className="text-brand-blue-500" size={18} />
            </div>
            <p className="mt-3 text-2xl font-bold text-[rgb(var(--zx-text))]">
              {stats?.franchises ?? 0}
            </p>
            <p className="mt-1 text-xs text-[rgb(var(--zx-text-muted))]">
              Revenue-sharing partners in good standing
            </p>
          </div>
        </div>
      )}

      {/* MODULE LINKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MODULES.map(({ to, icon: Icon, title, description }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-start gap-4 p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] hover:border-brand-teal-500/50 hover:shadow-lg hover:shadow-brand-teal-500/5 transition-all"
          >
            <span className="p-3 rounded-xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-300 shrink-0">
              <Icon size={22} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-bold text-[rgb(var(--zx-text))] group-hover:text-brand-teal-600 dark:group-hover:text-brand-teal-300 transition-colors">
                {title}
              </span>
              <span className="mt-1 block text-sm text-[rgb(var(--zx-text-muted))]">{description}</span>
            </span>
            <ChevronRight
              size={18}
              className="mt-1 text-[rgb(var(--zx-text-muted))] group-hover:text-brand-teal-500 group-hover:translate-x-1 transition-all shrink-0"
            />
          </Link>
        ))}
      </div>

      {/* RECENT PAYMENTS */}
      {!loading && !error ? (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-4">
            Recent Ledger Activity
          </h2>
          {recentPayments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[rgb(var(--zx-border))] p-8 text-center text-sm text-[rgb(var(--zx-text-muted))]">
              No payment transactions recorded yet.
            </div>
          ) : (
            <div className="rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] overflow-x-auto zx-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))]">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Reference</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Payer</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Amount</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((p) => (
                    <tr key={p.id} className="border-b border-[rgb(var(--zx-border))] last:border-0">
                      <td className="px-4 py-3.5 font-mono text-xs text-[rgb(var(--zx-text))]">{p.merchant_txn_no || p.pg_txn_id || `#${p.id}`}</td>
                      <td className="px-4 py-3.5 text-[rgb(var(--zx-text))]">{p.name || p.email || "—"}</td>
                      <td className="px-4 py-3.5 font-semibold text-[rgb(var(--zx-text))]">₹{Number(p.amount ?? 0).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3.5 text-[rgb(var(--zx-text-muted))]">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
