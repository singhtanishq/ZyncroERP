import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import api from "../../../lib/api/apiClient";
import DataTable from "../../../components/common/DataTable";
import StatusBadge from "../../../components/common/StatusBadge";
import { formatINR } from "../../../utils/format";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

/**
 * Students enrolled through this franchise, with their enrollment and
 * fee status. Search and pagination are handled server-side.
 */
export default function FranchiseStudents() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, per_page: 10 });

  useEffect(() => {
    const t = setTimeout(load, search === "" && page === 1 && status === "all" ? 0 : 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, status]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/franchise/students", {
        params: {
          search: search || undefined,
          status,
          page,
          per_page: 10,
        },
      });
      setRows(res.data.data);
      setMeta(res.data.meta);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-300">
            <Users size={24} />
          </span>
          My Students
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm">
          Students enrolled through your franchise and their current status.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => {
              setStatus(f.value);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              status === f.value
                ? "bg-brand-teal-500 text-white shadow-sm"
                : "bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] hover:text-brand-teal-600 dark:hover:text-brand-teal-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Student",
            render: (r) => (
              <div>
                <p className="font-semibold text-[rgb(var(--zx-text))]">{r.name || "—"}</p>
                <p className="text-xs text-[rgb(var(--zx-text-muted))]">{r.email || "—"}</p>
              </div>
            ),
          },
          {
            key: "sid",
            header: "Student ID",
            render: (r) => <span className="font-mono text-xs">{r.sid}</span>,
          },
          { key: "course_name", header: "Course", render: (r) => r.course_name || "—" },
          { key: "batch_name", header: "Batch", render: (r) => r.batch_name || "—", sortable: false },
          {
            key: "enrollment_status",
            header: "Enrollment",
            render: (r) => <StatusBadge status={r.enrollment_status} />,
          },
          {
            key: "payment_status",
            header: "Payment",
            render: (r) => <StatusBadge status={r.payment_status} />,
          },
          {
            key: "fees_outstanding",
            header: "Outstanding",
            render: (r) => (
              <span className={r.fees_outstanding > 0 ? "font-semibold text-amber-600 dark:text-amber-300" : "text-[rgb(var(--zx-text-muted))]"}>
                {formatINR(r.fees_outstanding)}
              </span>
            ),
          },
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
        searchPlaceholder="Search by name, email or student ID…"
        pagination={{
          page,
          pageSize: meta.per_page,
          total: meta.total,
          onPageChange: setPage,
        }}
        empty={{
          icon: Users,
          title: "No students found",
          description: "Students enrolled through your franchise will appear here.",
        }}
      />
    </div>
  );
}
