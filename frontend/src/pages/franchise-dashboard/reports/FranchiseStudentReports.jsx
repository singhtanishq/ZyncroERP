import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import api from "../../../lib/api/apiClient";
import DataTable from "../../../components/common/DataTable";
import StatusBadge from "../../../components/common/StatusBadge";
import { SkeletonCards, ErrorState } from "../../../components/common/States";
import { formatINR } from "../../../utils/format";

/**
 * Enrollment and fee report across all of the franchise's students.
 */
export default function FranchiseStudentReports() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboard, students] = await Promise.all([
        api.get("/franchise/dashboard"),
        api.get("/franchise/students", { params: { per_page: 100, page: 1 } }),
      ]);
      setSummary(dashboard.data.stats);
      setRows(students.data.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load reports.");
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
            <ClipboardList size={24} />
          </span>
          Student Reports
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm">
          Enrollment and fee position across all of your students.
        </p>
      </div>

      {loading ? (
        <SkeletonCards count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
              <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">Enrollments</span>
              <p className="mt-3 text-xl font-bold text-[rgb(var(--zx-text))]">
                {summary.active_enrollments} active · {summary.pending_enrollments} pending · {summary.completed_enrollments} completed
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
              <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">Fees Collected</span>
              <p className="mt-3 text-xl font-bold text-brand-teal-600 dark:text-brand-teal-300">{formatINR(summary.fees_paid)}</p>
            </div>
            <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
              <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">Outstanding</span>
              <p className="mt-3 text-xl font-bold text-amber-600 dark:text-amber-300">{formatINR(summary.fees_outstanding)}</p>
            </div>
          </div>

          <DataTable
            columns={[
              { key: "name", header: "Student", render: (r) => r.name || "—" },
              { key: "sid", header: "ID", render: (r) => <span className="font-mono text-xs">{r.sid}</span> },
              { key: "course_name", header: "Course", render: (r) => r.course_name || "—", sortable: false },
              { key: "enrollment_status", header: "Status", render: (r) => <StatusBadge status={r.enrollment_status} /> },
              { key: "fees_total", header: "Fees Total", render: (r) => formatINR(r.fees_total) },
              { key: "fees_paid", header: "Paid", render: (r) => formatINR(r.fees_paid) },
              { key: "fees_outstanding", header: "Outstanding", render: (r) => formatINR(r.fees_outstanding) },
            ]}
            rows={rows}
            loading={loading}
            error={error}
            onRetry={load}
            searchPlaceholder="Search students…"
            empty={{
              title: "No report data",
              description: "Reports will be available once students are enrolled through your franchise.",
            }}
          />
        </>
      )}
    </div>
  );
}
