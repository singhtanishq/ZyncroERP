import { useEffect, useState } from "react";
import { Award, ExternalLink, Download } from "lucide-react";
import api from "../../lib/api/apiClient";
import { EmptyState, ErrorState, LoadingState } from "../../components/common/States";
import { formatDate } from "../../utils/format";

/**
 * Certificates issued to the authenticated employee.
 */
export default function EmployeeCertificates() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/employee/dashboard");
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const certificates = data?.certificates ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-300">
            <Award size={24} />
          </span>
          My Certificates
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm">
          Certificates issued to you by the organization.
        </p>
      </div>

      {loading ? (
        <LoadingState rows={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : certificates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
          <EmptyState
            icon={Award}
            title="No certificates yet"
            description="Certificates issued to you will appear here."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {certificates.map((c) => (
            <div key={c.id} className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] flex flex-col">
              <Award size={22} className="text-brand-teal-500" />
              <p className="mt-3 font-bold text-[rgb(var(--zx-text))]">{c.certificate_name}</p>
              <p className="mt-1 text-xs font-mono text-[rgb(var(--zx-text-muted))]">{c.certificate_number}</p>
              <p className="mt-1 text-xs text-[rgb(var(--zx-text-muted))]">Issued {formatDate(c.issued_date)}</p>
              <div className="mt-4 flex items-center gap-3">
                <a
                  href={c.view_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-brand-teal-500 hover:bg-brand-teal-600 transition-colors"
                >
                  <ExternalLink size={13} /> View
                </a>
                <a
                  href={c.download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[rgb(var(--zx-text))] border border-[rgb(var(--zx-border))] hover:bg-[rgb(var(--zx-surface-hover))] transition-colors"
                >
                  <Download size={13} /> Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
