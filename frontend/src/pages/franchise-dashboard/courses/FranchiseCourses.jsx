import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import api from "../../../lib/api/apiClient";
import DataTable from "../../../components/common/DataTable";
import StatusBadge from "../../../components/common/StatusBadge";
import { formatINR } from "../../../utils/format";

/**
 * Courses the franchise's students are enrolled in, with scoped
 * enrollment and fee-collection figures.
 */
export default function FranchiseCourses() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/franchise/courses", {
        params: { search: search || undefined },
      });
      setRows(res.data.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-300">
            <BookOpen size={24} />
          </span>
          Courses
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm">
          Programs your students are enrolled in, with collection figures.
        </p>
      </div>

      <DataTable
        columns={[
          {
            key: "course_name",
            header: "Course",
            render: (r) => (
              <div>
                <p className="font-semibold text-[rgb(var(--zx-text))]">{r.course_name}</p>
                <p className="text-xs font-mono text-[rgb(var(--zx-text-muted))]">{r.course_code}</p>
              </div>
            ),
          },
          { key: "course_amount", header: "Fee", render: (r) => formatINR(r.course_amount) },
          { key: "enrollments", header: "Enrollments" },
          { key: "active_enrollments", header: "Active" },
          {
            key: "collected",
            header: "Collected",
            render: (r) => (
              <span className="font-semibold text-brand-teal-600 dark:text-brand-teal-300">
                {formatINR(r.collected)}
              </span>
            ),
          },
          { key: "course_status", header: "Status", render: (r) => <StatusBadge status={r.course_status} /> },
        ]}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={load}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by course name or code…"
        empty={{
          icon: BookOpen,
          title: "No courses yet",
          description: "Courses will appear once your students enroll.",
        }}
      />
    </div>
  );
}
