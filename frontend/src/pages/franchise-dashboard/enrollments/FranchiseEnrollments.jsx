import { useEffect, useState } from "react";
import { BookOpenCheck } from "lucide-react";
import api from "../../../lib/api/apiClient";
import DataTable from "../../../components/common/DataTable";
import StatusBadge from "../../../components/common/StatusBadge";
import { formatDate } from "../../../utils/format";

const STATUS_FILTERS = ["all", "pending", "active", "completed", "cancelled"];

/**
 * All enrollments belonging to this franchise's students.
 */
export default function FranchiseEnrollments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, per_page: 10 });

  useEffect(() => {
    const t = setTimeout(load, search || page > 1 ? 350 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, status]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/franchise/enrollments", {
        params: { search: search || undefined, status, page, per_page: 10 },
      });
      setRows(res.data.data);
      setMeta(res.data.meta);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load enrollments.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-300">
            <BookOpenCheck size={24} />
          </span>
          Enrollments
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm">
          Every course enrollment made through your franchise.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setStatus(f);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider capitalize transition-colors ${
              status === f
                ? "bg-brand-teal-500 text-white shadow-sm"
                : "bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] hover:text-brand-teal-600 dark:hover:text-brand-teal-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <DataTable
        columns={[
          {
            key: "student_name",
            header: "Student",
            render: (r) => (
              <div>
                <p className="font-semibold text-[rgb(var(--zx-text))]">{r.student_name || "—"}</p>
                <p className="text-xs font-mono text-[rgb(var(--zx-text-muted))]">{r.sid}</p>
              </div>
            ),
          },
          { key: "course_name", header: "Course", render: (r) => r.course_name || "—" },
          { key: "batch_name", header: "Batch", render: (r) => r.batch_name || "—", sortable: false },
          { key: "joined_at", header: "Joined", render: (r) => formatDate(r.joined_at), sortable: false },
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "payment_status", header: "Payment", render: (r) => <StatusBadge status={r.payment_status} /> },
        ]}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={load}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by student, email or course…"
        pagination={{
          page,
          pageSize: meta.per_page,
          total: meta.total,
          onPageChange: setPage,
        }}
        empty={{
          icon: BookOpenCheck,
          title: "No enrollments found",
          description: "Enrollments from your students will appear here.",
        }}
      />
    </div>
  );
}
