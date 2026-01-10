import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import api from "../../../lib/api/apiClient";
import DataTable from "../../../components/common/DataTable";
import { formatDate } from "../../../utils/format";

/**
 * Faculty members belonging to this franchise.
 */
export default function FranchiseFaculty() {
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
      const res = await api.get("/franchise/faculty", {
        params: { search: search || undefined },
      });
      setRows(res.data.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load faculty.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-300">
            <GraduationCap size={24} />
          </span>
          Our Faculty
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm">
          Faculty members who belong to your franchise.
        </p>
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Faculty",
            render: (r) => (
              <div>
                <p className="font-semibold text-[rgb(var(--zx-text))]">{r.name}</p>
                <p className="text-xs text-[rgb(var(--zx-text-muted))]">{r.email || "—"}</p>
              </div>
            ),
          },
          { key: "code", header: "Code", render: (r) => <span className="font-mono text-xs">{r.code}</span> },
          { key: "phone", header: "Phone", render: (r) => r.phone || "—", sortable: false },
          { key: "specialization", header: "Specialization", render: (r) => r.specialization || "—", sortable: false },
          { key: "assignments_count", header: "Assignments", render: (r) => r.assignments_count },
          { key: "join_date", header: "Joined", render: (r) => formatDate(r.join_date), sortable: false },
        ]}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={load}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search faculty by name, email or code…"
        empty={{
          icon: GraduationCap,
          title: "No faculty members yet",
          description: "Faculty assigned to your franchise by the administration will appear here.",
        }}
      />
    </div>
  );
}
