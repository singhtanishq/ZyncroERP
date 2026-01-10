import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  BookOpenCheck,
  Wallet,
  TrendingUp,
  Percent,
  ChevronRight,
} from "lucide-react";
import api from "../../lib/api/apiClient";
import { SkeletonCards, ErrorState, EmptyState } from "../../components/common/States";
import StatusBadge from "../../components/common/StatusBadge";

/**
 * Franchise dashboard overview — every figure comes from the franchise's
 * own students, faculty and payment records.
 */
export default function FranchiseHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/franchise/dashboard");
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        <SkeletonCards count={4} />
        <SkeletonCards count={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  const { franchise, stats, recent_enrollments } = data;

  const kpis = [
    {
      label: "My Students",
      value: stats.students,
      icon: Users,
      tone: "bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-300",
    },
    {
      label: "Active Enrollments",
      value: stats.active_enrollments,
      icon: BookOpenCheck,
      tone: "bg-brand-blue-500/10 text-brand-blue-600 dark:text-brand-blue-300",
    },
    {
      label: "Our Faculty",
      value: stats.faculty,
      icon: GraduationCap,
      tone: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
    },
    {
      label: "Collected Fees",
      value: `₹${Number(stats.fees_paid).toLocaleString("en-IN")}`,
      icon: Wallet,
      tone: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* GREETING */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--zx-text))]">
          {franchise.name}
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-sm flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[rgb(var(--zx-surface-hover))]">
            {franchise.code}
          </span>
          Franchise partner overview · owner {franchise.owner_name}
          <StatusBadge status={franchise.status} />
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] hover:shadow-lg hover:shadow-brand-teal-500/5 transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">
                {label}
              </span>
              <span className={`p-2.5 rounded-xl ${tone}`}>
                <Icon size={18} />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-[rgb(var(--zx-text))]">{value}</p>
          </div>
        ))}
      </div>

      {/* FINANCIAL SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">
            <TrendingUp size={14} className="text-brand-teal-500" />
            Fees Collected / Total
          </div>
          <p className="mt-3 text-xl font-bold text-[rgb(var(--zx-text))]">
            ₹{Number(stats.fees_paid).toLocaleString("en-IN")}{" "}
            <span className="text-sm font-medium text-[rgb(var(--zx-text-muted))]">
              / ₹{Number(stats.fees_total).toLocaleString("en-IN")}
            </span>
          </p>
          <div className="mt-3 h-2 rounded-full bg-[rgb(var(--zx-surface-hover))] overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-teal-500 transition-all"
              style={{
                width: `${stats.fees_total > 0 ? Math.min(100, (stats.fees_paid / stats.fees_total) * 100) : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">
            <Wallet size={14} className="text-amber-500" />
            Outstanding Fees
          </div>
          <p className="mt-3 text-xl font-bold text-[rgb(var(--zx-text))]">
            ₹{Number(stats.fees_outstanding).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-[rgb(var(--zx-text-muted))]">
            Across all my students' enrollments
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">
            <Percent size={14} className="text-brand-blue-500" />
            Commission Estimate
          </div>
          <p className="mt-3 text-xl font-bold text-[rgb(var(--zx-text))]">
            {stats.commission_rate}%{" "}
            <span className="text-sm font-medium text-[rgb(var(--zx-text-muted))]">
              ≈ ₹{Number((stats.fees_paid * stats.commission_rate) / 100).toLocaleString("en-IN")}
            </span>
          </p>
          <Link
            to="/franchise/commission"
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-teal-600 dark:text-brand-teal-300 hover:underline"
          >
            View commission details <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* RECENT ENROLLMENTS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">
            Recent Enrollments
          </h2>
          <Link
            to="/franchise/students"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal-600 dark:text-brand-teal-300 hover:underline"
          >
            View all students <ChevronRight size={12} />
          </Link>
        </div>

        {recent_enrollments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
            <EmptyState
              title="No enrollments yet"
              description="When students enroll through your franchise, their enrollment activity will appear here."
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] overflow-x-auto zx-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Student</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Course</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Batch</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Payment</th>
                </tr>
              </thead>
              <tbody>
                {recent_enrollments.map((e) => (
                  <tr key={e.id} className="border-b border-[rgb(var(--zx-border))] last:border-0 hover:bg-[rgb(var(--zx-surface-hover))] transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-[rgb(var(--zx-text))]">{e.student_name || "—"}</span>
                      <span className="ml-2 font-mono text-[11px] text-[rgb(var(--zx-text-muted))]">{e.sid}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[rgb(var(--zx-text))]">{e.course_name || "—"}</td>
                    <td className="px-4 py-3.5 text-[rgb(var(--zx-text))]">{e.batch_name || "—"}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={e.status} /></td>
                    <td className="px-4 py-3.5"><StatusBadge status={e.payment_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
