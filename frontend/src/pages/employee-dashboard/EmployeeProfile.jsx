import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Award, Megaphone, Users, ChevronRight, CalendarDays, Mail, Phone, Building2 } from "lucide-react";
import api from "../../lib/api/apiClient";
import { ErrorState } from "../../components/common/States";
import StatusBadge from "../../components/common/StatusBadge";
import { formatDate } from "../../utils/format";

/**
 * Full employment profile for the authenticated employee.
 */
export default function EmployeeProfile() {
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
      setError(e?.response?.data?.message || "Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="h-64 rounded-2xl bg-[rgb(var(--zx-surface-hover))] animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  const { user, profile, stats } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-300">
            <Briefcase size={24} />
          </span>
          My Employment
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm">
          Your corporate profile and employment record.
        </p>
      </div>

      {!profile ? (
        <div className="p-8 rounded-2xl border border-dashed border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] text-sm text-[rgb(var(--zx-text-muted))]">
          Your corporate employment profile has not been linked yet. Please contact the administration.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 md:p-8 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-[rgb(var(--zx-border))]">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-teal-500 to-brand-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-brand-teal-500/20 shrink-0">
                {profile.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[rgb(var(--zx-text))]">{profile.name}</h2>
                <p className="text-sm text-[rgb(var(--zx-text-muted))]">
                  {profile.corporate_role || "—"} · {profile.department || "—"}
                </p>
                <div className="mt-2"><StatusBadge status={profile.status} /></div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Detail icon={Briefcase} label="Employee ID" value={profile.employee_id} mono />
              <Detail icon={Briefcase} label="Corporate Role" value={profile.corporate_role || "—"} />
              <Detail icon={Building2} label="Department" value={profile.department || "—"} />
              <Detail icon={CalendarDays} label="Joining Date" value={formatDate(profile.joining_date)} />
              <Detail icon={Mail} label="Work Email" value={profile.email || "—"} />
              <Detail icon={Phone} label="Phone" value={profile.phone || "—"} />
            </div>
          </div>

          <div className="space-y-6">
            <QuickLink to="/employee/certificates" icon={Award} label="My Certificates" value={stats.certificates} />
            <QuickLink to="/employee/announcements" icon={Megaphone} label="Announcements" />
            <QuickLink to="/employee/directory" icon={Users} label="Team Directory" />
            <QuickLink to="/employee/account" icon={Mail} label="Account Settings" />
          </div>
        </div>
      )}
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

function QuickLink({ to, icon: Icon, label, value }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-5 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] hover:border-brand-teal-500/50 hover:shadow-lg hover:shadow-brand-teal-500/5 transition-all group"
    >
      <span className="p-2.5 rounded-xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-300">
        <Icon size={18} />
      </span>
      <span className="flex-1 font-semibold text-sm text-[rgb(var(--zx-text))] group-hover:text-brand-teal-600 dark:group-hover:text-brand-teal-300 transition-colors">
        {label}
      </span>
      {value !== undefined ? (
        <span className="text-sm font-bold text-[rgb(var(--zx-text))]">{value}</span>
      ) : null}
      <ChevronRight size={16} className="text-[rgb(var(--zx-text-muted))] group-hover:text-brand-teal-500 transition-colors" />
    </Link>
  );
}
