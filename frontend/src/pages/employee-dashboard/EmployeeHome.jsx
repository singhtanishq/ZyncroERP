import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Award, CalendarDays, Mail, Phone, Building2, ChevronRight } from "lucide-react";
import api from "../../lib/api/apiClient";
import { ErrorState } from "../../components/common/States";
import StatusBadge from "../../components/common/StatusBadge";
import { formatDate } from "../../utils/format";

/**
 * Employee dashboard — corporate profile, employment details and
 * certificate highlights.
 */
export default function EmployeeHome() {
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
      setError(e?.response?.data?.message || "Failed to load your dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="h-48 rounded-2xl bg-[rgb(var(--zx-surface-hover))] animate-pulse" />
        <div className="h-40 rounded-2xl bg-[rgb(var(--zx-surface-hover))] animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  const { user, profile, stats, certificates } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--zx-text))]">
          Welcome, {user.name.split(" ")[0]}
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-sm">
          Your employment overview and records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PROFILE CARD */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-teal-500 to-brand-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-brand-teal-500/20 shrink-0">
              {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[rgb(var(--zx-text))]">{user.name}</h2>
              <p className="text-sm text-[rgb(var(--zx-text-muted))] flex items-center gap-1.5 mt-0.5">
                <Mail size={13} /> {user.email}
              </p>
            </div>
          </div>

          {profile ? (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Detail icon={Briefcase} label="Employee ID" value={profile.employee_id} mono />
              <Detail icon={Briefcase} label="Corporate Role" value={profile.corporate_role || "—"} />
              <Detail icon={Building2} label="Department" value={profile.department || "—"} />
              <Detail icon={CalendarDays} label="Joining Date" value={formatDate(profile.joining_date)} />
              <Detail icon={Mail} label="Work Email" value={profile.email || "—"} />
              <Detail icon={Phone} label="Phone" value={profile.phone || "—"} />
              <div className="sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">Employment Status</span>
                <div className="mt-1.5">
                  <StatusBadge status={profile.status} />
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-[rgb(var(--zx-text-muted))]">
              Your corporate employment profile has not been linked yet. Please contact the administration.
            </p>
          )}
        </div>

        {/* SIDE CARDS */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">Certificates</span>
              <Award className="text-brand-teal-500" size={18} />
            </div>
            <p className="mt-3 text-3xl font-bold text-[rgb(var(--zx-text))]">{stats.certificates}</p>
            <Link
              to="/employee/certificates"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-teal-600 dark:text-brand-teal-300 hover:underline"
            >
              View certificates <ChevronRight size={12} />
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
            <span className="text-xs font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))]">Account Since</span>
            <p className="mt-3 text-lg font-bold text-[rgb(var(--zx-text))]">{formatDate(user.joined_at)}</p>
          </div>
        </div>
      </div>

      {/* RECENT CERTIFICATES */}
      {certificates.length > 0 ? (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-4">
            Latest Certificates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {certificates.slice(0, 3).map((c) => (
              <div key={c.id} className="p-6 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] flex flex-col">
                <Award size={22} className="text-brand-teal-500" />
                <p className="mt-3 font-bold text-[rgb(var(--zx-text))]">{c.certificate_name}</p>
                <p className="mt-1 text-xs font-mono text-[rgb(var(--zx-text-muted))]">{c.certificate_number}</p>
                <a
                  href={c.view_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-teal-600 dark:text-brand-teal-300 hover:underline"
                >
                  View certificate <ChevronRight size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Detail({ icon: Icon, label, value, mono = false }) {
  return (
    <div>
      <span className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] flex items-center gap-1.5">
        <Icon size={12} /> {label}
      </span>
      <p className={`mt-1 text-sm font-semibold text-[rgb(var(--zx-text))] ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
