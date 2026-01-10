import { useEffect, useState } from "react";
import { Wallet, Receipt, CalendarCheck, Landmark } from "lucide-react";
import api from "../../../lib/api/apiClient";
import { EmptyState, ErrorState, LoadingState } from "../../../components/common/States";
import StatusBadge from "../../../components/common/StatusBadge";
import { formatINR } from "../../../utils/format";

/**
 * The authenticated faculty member's salary and payout history.
 */
export default function FacultyMyPayouts() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/faculty/payouts");
            setData(res.data);
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to load your payouts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-3">
                    <span className="p-2.5 rounded-2xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-300">
                        <Wallet size={24} />
                    </span>
                    My Payouts
                </h1>
                <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm max-w-xl">
                    Your monthly salary and payout history as recorded by the administration.
                </p>
            </div>

            {loading ? (
                <LoadingState rows={3} />
            ) : error ? (
                <ErrorState message={error} onRetry={load} />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">Monthly Salary</span>
                                <Landmark size={16} className="text-brand-teal-500" />
                            </div>
                            <p className="mt-3 text-2xl font-bold text-[rgb(var(--zx-text))]">{formatINR(data.salary)}</p>
                        </div>

                        <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">Months Paid</span>
                                <CalendarCheck size={16} className="text-emerald-500" />
                            </div>
                            <p className="mt-3 text-2xl font-bold text-[rgb(var(--zx-text))]">{data.summary.paid_months}</p>
                        </div>

                        <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">Total Received</span>
                                <Receipt size={16} className="text-amber-500" />
                            </div>
                            <p className="mt-3 text-2xl font-bold text-[rgb(var(--zx-text))]">{formatINR(data.summary.total_received)}</p>
                        </div>
                    </div>

                    {data.records.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
                            <EmptyState
                                icon={Receipt}
                                title="No payout records yet"
                                description="Once the administration processes your monthly payouts, they will appear here."
                            />
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] overflow-x-auto zx-scroll">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))]">
                                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Month</th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Amount</th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Status</th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))]">Paid On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.records.map((r) => (
                                        <tr key={r.id} className="border-b border-[rgb(var(--zx-border))] last:border-0 hover:bg-[rgb(var(--zx-surface-hover))] transition-colors">
                                            <td className="px-4 py-3.5 font-semibold text-[rgb(var(--zx-text))]">{r.month}</td>
                                            <td className="px-4 py-3.5 font-semibold text-[rgb(var(--zx-text))]">{formatINR(r.amount)}</td>
                                            <td className="px-4 py-3.5"><StatusBadge status={r.status} /></td>
                                            <td className="px-4 py-3.5 text-[rgb(var(--zx-text-muted))]">{r.paid_at ? new Date(r.paid_at).toLocaleDateString() : "—"}</td>
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
