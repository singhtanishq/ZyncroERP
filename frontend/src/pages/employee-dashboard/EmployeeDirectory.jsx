import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import api from "../../lib/api/apiClient";
import DataTable from "../../components/common/DataTable";
import { formatDate } from "../../utils/format";

/**
 * Company directory: active colleagues with their roles and departments.
 */
export default function EmployeeDirectory() {
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
      const res = await api.get("/employee/directory", {
        params: { search: search || undefined },
      });
      setRows(res.data.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load the directory.");
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
          Team Directory
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm">
          Active colleagues across the organization.
        </p>
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Colleague",
            render: (r) => (
              <div>
                <p className="font-semibold text-[rgb(var(--zx-text))]">{r.name}</p>
                <p className="text-xs font-mono text-[rgb(var(--zx-text-muted))]">{r.employee_id}</p>
              </div>
            ),
          },
          { key: "corporate_role", header: "Role", render: (r) => r.corporate_role || "—", sortable: false },
          { key: "department", header: "Department", render: (r) => r.department || "—" },
          { key: "joining_date", header: "Joined", render: (r) => formatDate(r.joining_date), sortable: false },
        ]}
        rows={rows}
        loading={loading}
        error={error}
        onRetry={load}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, role, department or ID…"
        empty={{
          icon: Users,
          title: "No colleagues found",
          description: "Active employees will appear here.",
        }}
      />
    </div>
  );
}
