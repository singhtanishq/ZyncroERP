import { X, QrCode, Activity, Clock, ArrowRight, Layers, ChevronRight } from "lucide-react";

export default function OngoingAttendanceModal({
  open,
  sessions,
  onClose,
  onSelect,
}) {
  if (!open) return null;

  const list = Array.isArray(sessions) ? sessions : [];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm text-emerald-600">
               <Activity size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-xl tracking-tight">Active Sessions</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{list.length} attendances currently running</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* EMPTY STATE */}
          {list.length === 0 && (
            <div className="text-center py-12 px-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                <QrCode size={24} className="text-slate-300" />
              </div>
              <p className="text-lg font-bold text-slate-700">No active sessions</p>
              <p className="text-slate-500 text-sm mt-1 max-w-[200px] mx-auto">Start a new attendance session to see it listed here.</p>
            </div>
          )}

          {/* LIST */}
          <div className="space-y-3">
            {list.map((s) => (
              <button
                key={s.session_id}
                onClick={() => onSelect(s)}
                className="group w-full text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200 relative overflow-hidden active:scale-[0.99]"
              >
                {/* Active Indicator Strip */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                    <Layers size={12} />
                    {s.batch_name || "Batch"}
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Live</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-indigo-700 transition-colors leading-tight">
                  {s.course_name || "Unknown Course"}
                </h3>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Clock size={14} className="text-slate-400" />
                    <span>Expires: <span className="font-mono text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{new Date(s.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all text-xs font-bold uppercase tracking-wide">
                    View QR <ChevronRight size={14} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}