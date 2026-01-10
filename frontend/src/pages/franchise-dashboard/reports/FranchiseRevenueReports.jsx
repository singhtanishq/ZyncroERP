import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../../../lib/api/apiClient";
import { ErrorState, EmptyState } from "../../../components/common/States";
import { formatINR } from "../../../utils/format";

/**
 * Monthly fee collection across the franchise's students over the last
 * 12 months.
 */
export default function FranchiseRevenueReports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/franchise/revenue-report");
      setRows(res.data.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load revenue report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const chartData = rows.map((r) => ({
    month: r.month,
    collected: Number(r.collected),
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-300">
            <BarChart3 size={24} />
          </span>
          Revenue Reports
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm">
          Monthly fee collection across your students (last 12 months).
        </p>
      </div>

      {loading ? (
        <div className="h-80 rounded-2xl bg-[rgb(var(--zx-surface-hover))] animate-pulse" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : chartData.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
          <EmptyState
            title="No revenue data yet"
            description="Fee collections for your students will be charted here as they come in."
          />
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--zx-border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgb(var(--zx-text-muted))" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "rgb(var(--zx-text-muted))" }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(v) => [formatINR(v), "Collected"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid rgb(var(--zx-border))", background: "rgb(var(--zx-surface))", color: "rgb(var(--zx-text))" }}
                />
                <Bar dataKey="collected" fill="#159690" radius={[6, 6, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
