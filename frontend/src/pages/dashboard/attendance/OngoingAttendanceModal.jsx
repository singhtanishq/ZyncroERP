import { X, QrCode, Activity, Clock, Layers, ChevronRight } from "lucide-react";
import AppModal from "../../../components/common/AppModal";

export default function OngoingAttendanceModal({
  open,
  sessions,
  onClose,
  onSelect,
}) {
  if (!open) return null;

  const list = Array.isArray(sessions) ? sessions : [];

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Active Sessions"
      size="md"
      footer={
        <button
          onClick={onClose}
          className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface-hover))] py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-[0.98]"
        >
          Close
        </button>
      }
    >
      <div className="space-y-4">
        {/* SUBHEADING / COUNT */}
        <div className="flex items-center justify-between -mt-2 pb-2 border-b border-[rgb(var(--zx-border))]">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-500">
               <Activity size={18} className="animate-pulse" />
            </div>
            <p className="text-xs text-[rgb(var(--zx-text-muted))] font-semibold uppercase tracking-wider">
              {list.length} attendances currently running
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar space-y-3 pr-1">
          {/* EMPTY STATE */}
          {list.length === 0 && (
            <div className="text-center py-12 px-6 bg-[rgb(var(--zx-surface-hover))]/50 rounded-2xl border border-dashed border-[rgb(var(--zx-border))]">
              <div className="w-16 h-16 bg-[rgb(var(--zx-surface))] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[rgb(var(--zx-border))] shadow-sm text-[rgb(var(--zx-text-muted))]">
                <QrCode size={24} />
              </div>
              <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No active sessions</p>
              <p className="text-[rgb(var(--zx-text-muted))] text-sm mt-1 max-w-[220px] mx-auto">Start a new attendance session to see it listed here.</p>
            </div>
          )}

          {/* LIST */}
          {list.map((s) => (
            <button
              key={s.session_id}
              onClick={() => onSelect(s)}
              className="group w-full text-left bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-2xl p-4 hover:border-brand-teal-500/40 hover:shadow-lg transition-all duration-200 relative overflow-hidden active:scale-[0.99]"
            >
              {/* Active Indicator Strip */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-teal-500 uppercase tracking-wider bg-brand-teal-500/10 px-2.5 py-1 rounded-lg border border-brand-teal-500/20">
                  <Layers size={12} />
                  {s.batch_name || "Batch"}
                </div>
                
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Live</span>
                </div>
              </div>

              <h3 className="font-bold text-[rgb(var(--zx-text))] text-base mb-2 group-hover:text-brand-teal-500 transition-colors leading-tight">
                {s.course_name || "Unknown Course"}
              </h3>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgb(var(--zx-border))]">
                <div className="flex items-center gap-2 text-xs text-[rgb(var(--zx-text-muted))] font-medium">
                  <Clock size={14} className="text-[rgb(var(--zx-text-muted))]" />
                  <span>Expires: <span className="font-mono text-[rgb(var(--zx-text))] font-bold bg-[rgb(var(--zx-surface-hover))] px-2 py-0.5 rounded border border-[rgb(var(--zx-border))]">{new Date(s.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                </div>
                
                <div className="flex items-center gap-1 text-[rgb(var(--zx-text-muted))] group-hover:text-brand-teal-500 group-hover:translate-x-1 transition-all text-xs font-bold uppercase tracking-wide">
                  View QR <ChevronRight size={14} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </AppModal>
  );
}