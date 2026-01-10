import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import api from "../../../lib/api/apiClient";
import { EmptyState, ErrorState, LoadingState } from "../../../components/common/States";
import { formatDate } from "../../../utils/format";

/**
 * Student announcements whose audience includes this franchise's
 * students (matched through the course/batch access rules).
 */
export default function FranchiseAnnouncements() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/franchise/announcements");
      setRows(res.data.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-300">
            <Megaphone size={24} />
          </span>
          Announcements
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm">
          Student communications relevant to your franchise.
        </p>
      </div>

      {loading ? (
        <LoadingState rows={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
          <EmptyState
            icon={Megaphone}
            title="No announcements"
            description="Communications targeting your students will appear here."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((a) => (
            <article
              key={a.id}
              className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] hover:shadow-lg hover:shadow-brand-teal-500/5 transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <h2 className="font-bold text-[rgb(var(--zx-text))]">{a.title}</h2>
                <time className="text-xs text-[rgb(var(--zx-text-muted))] whitespace-nowrap">
                  {formatDate(a.published_at)}
                </time>
              </div>
              <p className="mt-3 text-sm text-[rgb(var(--zx-text-muted))] leading-relaxed whitespace-pre-line">
                {a.message}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {a.audience.map((aud) => (
                  <span
                    key={aud}
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-blue-500/10 text-brand-blue-700 dark:text-brand-blue-300"
                  >
                    {aud}
                  </span>
                ))}
                {a.published_by ? (
                  <span className="ml-auto text-xs font-semibold text-[rgb(var(--zx-text-muted))]">
                    Published by {a.published_by}
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
