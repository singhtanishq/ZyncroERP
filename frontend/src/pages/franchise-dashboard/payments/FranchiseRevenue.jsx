import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import api from "../../../lib/api/apiClient";
import { ErrorState, EmptyState } from "../../../components/common/States";
import StatusBadge from "../../../components/common/StatusBadge";
import { formatINR, formatDate } from "../../../utils/format";

/**
 * Revenue records maintained for this franchise by the administration,
 * with a collection summary.
 */
export default function FranchiseRevenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/franchise/payments");
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load revenue records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-300">
            <Wallet size={24} />
          </span>
          Revenue
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm">
          Revenue records maintained for your franchise by the administration.
        </p>
      </div>

      {loading ? (
        <div className="h-24 rounded-2xl bg-[rgb(var(--zx-surface-hover))] animate-pulse" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <SummaryCard label="Total Revenue" value={formatINR(data.summary.total)} />
            <SummaryCard label="Settled" value={formatINR(data.summary.paid)} />
            <SummaryCard label="Outstanding" value={formatINR(data.summary.outstanding)} highlight={data.summary.outstanding > 0} />
          </div>

          {data.data.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
              <EmptyState
                title="No revenue records yet"
                description="Records created by the administration for your franchise will appear here."
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] overflow-x-auto zx-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))]">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Recorded</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Total</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Paid</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Outstanding</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((p) => (
                    <tr key={p.id} className="border-b border-[rgb(var(--zx-border))] last:border-0 hover:bg-[rgb(var(--zx-surface-hover))] transition-colors">
                      <td className="px-4 py-3.5 text-[rgb(var(--zx-text-muted))]">{formatDate(p.created_at)}</td>
                      <td className="px-4 py-3.5 font-semibold text-[rgb(var(--zx-text))]">{formatINR(p.total_amount)}</td>
                      <td className="px-4 py-3.5 text-brand-teal-600 dark:text-brand-teal-300 font-semibold">{formatINR(p.paid_amount)}</td>
                      <td className="px-4 py-3.5 text-amber-600 dark:text-amber-300 font-semibold">{formatINR(p.outstanding)}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, highlight = false }) {
  return (
    <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
      <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">{label}</span>
      <p className={`mt-3 text-2xl font-bold ${highlight ? "text-amber-600 dark:text-amber-300" : "text-[rgb(var(--zx-text))]"}`}>
        {value}
      </p>
    </div>
  );
}
