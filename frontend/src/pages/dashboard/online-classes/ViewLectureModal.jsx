import { Clock, Video, Users, Calendar, Link2, Lock, FileText, Info } from "lucide-react";
import AppModal from "../../../components/common/AppModal";

export default function ViewLectureModal({ open, onClose, data }) {
  if (!open || !data) return null;

  const start = new Date(data.start_datetime);

  const accessLabel = () => {
    if (!data.access_rules || data.access_rules.length === 0) return "All";

    const rule = data.access_rules[0];
    if (rule.access_type === "all") return "All Students";
    if (rule.access_type === "course") return rule.course?.name || "Course";
    if (rule.access_type === "batch")
      return `${rule.course?.name} (${rule.batch?.name})`;

    return "All";
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Lecture Details"
      size="lg"
      footer={
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
        >
          Close
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* SUBHEADER CONTEXT */}
        <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2">
          Comprehensive view of the scheduled session.
        </p>

        {/* TITLE */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1">Lecture Title</div>
          <div className="text-xl font-extrabold text-[rgb(var(--zx-text))] leading-tight">{data.title}</div>
        </div>

        {/* DESCRIPTION */}
        {data.description && (
          <div className="bg-[rgb(var(--zx-surface-hover))]/50 rounded-2xl p-4 border border-[rgb(var(--zx-border))]">
            <div className="flex items-start gap-3">
                <FileText size={16} className="text-brand-teal-500 mt-0.5 shrink-0" />
                <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1">Description</div>
                    <div className="text-sm text-[rgb(var(--zx-text))] leading-relaxed font-medium">{data.description}</div>
                </div>
            </div>
          </div>
        )}

        {/* META GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex gap-3 items-center p-3.5 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] shadow-sm">
            <div className="p-2 bg-brand-teal-500/10 text-brand-teal-500 rounded-xl border border-brand-teal-500/20">
                <Calendar size={18} />
            </div>
            <div>
                <div className="text-[10px] text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-wider">Date</div>
                <div className="text-sm font-bold text-[rgb(var(--zx-text))]">{start.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
            </div>
          </div>

          <div className="flex gap-3 items-center p-3.5 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] shadow-sm">
            <div className="p-2 bg-brand-blue-500/10 text-brand-blue-500 rounded-xl border border-brand-blue-500/20">
                <Clock size={18} />
            </div>
            <div>
                <div className="text-[10px] text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-wider">Time</div>
                <div className="text-sm font-bold text-[rgb(var(--zx-text))]">{start.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</div>
            </div>
          </div>

          <div className="flex gap-3 items-center p-3.5 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] shadow-sm">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                <Clock size={18} />
            </div>
            <div>
                <div className="text-[10px] text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-wider">Duration</div>
                <div className="text-sm font-bold text-[rgb(var(--zx-text))]">{data.duration_minutes} minutes</div>
            </div>
          </div>

          <div className="flex gap-3 items-center p-3.5 rounded-2xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] shadow-sm">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                <Info size={18} />
            </div>
            <div>
                <div className="text-[10px] text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-wider">Status</div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20 mt-0.5">
                    {data.status}
                </div>
            </div>
          </div>
        </div>

        {/* PLATFORM CARD */}
        <div className="border border-brand-teal-500/20 bg-brand-teal-500/5 rounded-2xl p-5 space-y-4">
          <div className="flex gap-2 items-center font-bold text-[rgb(var(--zx-text))] border-b border-brand-teal-500/20 pb-3 text-sm">
            <Video size={18} className="text-brand-teal-500" />
            Meeting Platform Details
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <div className="text-[10px] text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-wider mb-0.5">Platform</div>
              <div className="font-bold text-[rgb(var(--zx-text))]">{data.platform_name}</div>
            </div>

            {data.meeting_id && (
              <div>
                <div className="text-[10px] text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-wider mb-0.5">Meeting ID</div>
                <div className="font-mono font-bold text-[rgb(var(--zx-text))] bg-[rgb(var(--zx-surface))] px-2.5 py-1 rounded-lg border border-[rgb(var(--zx-border))] inline-block text-xs">
                    {data.meeting_id}
                </div>
              </div>
            )}

            {data.meeting_password && (
              <div>
                 <div className="text-[10px] text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <Lock size={10} /> Password
                 </div>
                 <div className="font-mono font-bold text-[rgb(var(--zx-text))] bg-[rgb(var(--zx-surface))] px-2.5 py-1 rounded-lg border border-[rgb(var(--zx-border))] inline-block text-xs">
                    {data.meeting_password}
                 </div>
              </div>
            )}
            
            <div className="col-span-1 md:col-span-2">
              <div className="text-[10px] text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-wider mb-1">Meeting Link</div>
              <a
                href={data.meeting_link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full p-3.5 bg-brand-teal-500 border border-transparent rounded-xl text-white font-bold hover:bg-brand-teal-600 transition-all shadow-md shadow-brand-teal-500/20 group text-sm active:scale-[0.98]"
              >
                <Link2 size={16} />
                Join Meeting Now
              </a>
            </div>

            {data.remarks && (
              <div className="col-span-1 md:col-span-2 pt-3 border-t border-brand-teal-500/20 mt-1">
                <div className="text-[10px] text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-wider mb-1">Remarks</div>
                <div className="text-[rgb(var(--zx-text))] italic text-xs font-medium">{data.remarks}</div>
              </div>
            )}
          </div>
        </div>

        {/* ACCESS */}
        <div className="flex gap-3 items-center p-4 bg-[rgb(var(--zx-surface-hover))]/50 border border-[rgb(var(--zx-border))] rounded-2xl">
          <div className="p-2.5 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl text-brand-teal-500">
             <Users size={18} />
          </div>
          <div>
             <div className="text-[10px] text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-wider">Who can view?</div>
             <div className="text-sm font-bold text-[rgb(var(--zx-text))]">{accessLabel()}</div>
          </div>
        </div>
      </div>
    </AppModal>
  );
}