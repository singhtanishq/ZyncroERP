import { useEffect, useState } from "react";
import { Percent, Info } from "lucide-react";
import api from "../../../lib/api/apiClient";
import { ErrorState } from "../../../components/common/States";
import { formatINR } from "../../../utils/format";

/**
 * The commission rate applied to this franchise along with the current
 * estimated share of collected fees.
 */
export default function FranchiseCommission() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/franchise/commission");
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load commission details.");
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
            <Percent size={24} />
          </span>
          Commission
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm">
          Your commission rate and the current estimated share of collected fees.
        </p>
      </div>

      {loading ? (
        <div className="h-40 rounded-2xl bg-[rgb(var(--zx-surface-hover))] animate-pulse" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
            <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">Commission Rate</span>
            <p className="mt-3 text-3xl font-bold text-brand-teal-600 dark:text-brand-teal-300">
              {data.commission_rate}%
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
            <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">Collected Fees</span>
            <p className="mt-3 text-3xl font-bold text-[rgb(var(--zx-text))]">{formatINR(data.collected_fees)}</p>
          </div>
          <div className="p-6 rounded-2xl border border-brand-teal-500/30 bg-brand-teal-500/5">
            <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">Estimated Commission</span>
            <p className="mt-3 text-3xl font-bold text-[rgb(var(--zx-text))]">{formatINR(data.estimated_commission)}</p>
          </div>

          <div className="md:col-span-3 flex items-start gap-3 p-5 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] text-sm text-[rgb(var(--zx-text-muted))]">
            <Info size={16} className="mt-0.5 shrink-0 text-brand-blue-500" />
            The estimated commission is calculated from fees actually collected from your
            students at the configured rate. The administration settles the final amounts
            recorded in the revenue section.
          </div>
        </div>
      )}
    </div>
  );
}
