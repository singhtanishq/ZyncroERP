import { X, Clock, Video, Users, Calendar, Link2, Lock, FileText, Info } from "lucide-react";

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white w-[600px] rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
             <h2 className="text-xl font-bold text-slate-800">Lecture Details</h2>
             <p className="text-xs text-slate-500 font-medium mt-0.5">Comprehensive view of the scheduled session.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* TITLE */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Lecture Title</div>
              <div className="text-xl font-bold text-slate-900 leading-tight">{data.title}</div>
            </div>

            {/* DESCRIPTION */}
            {data.description && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-start gap-2">
                    <FileText size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</div>
                        <div className="text-sm text-slate-600 leading-relaxed">{data.description}</div>
                    </div>
                </div>
              </div>
            )}

            {/* META GRID */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-3 items-center p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Calendar size={18} />
                </div>
                <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Date</div>
                    <div className="text-sm font-semibold text-slate-700">{start.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                </div>
              </div>

              <div className="flex gap-3 items-center p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Clock size={18} />
                </div>
                <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Time</div>
                    <div className="text-sm font-semibold text-slate-700">{start.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</div>
                </div>
              </div>

              <div className="flex gap-3 items-center p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Clock size={18} />
                </div>
                <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Duration</div>
                    <div className="text-sm font-semibold text-slate-700">{data.duration_minutes} minutes</div>
                </div>
              </div>

              <div className="flex gap-3 items-center p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Info size={18} />
                </div>
                <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Status</div>
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-600">
                        {data.status}
                    </div>
                </div>
              </div>
            </div>

            {/* PLATFORM CARD */}
            <div className="border border-indigo-100 bg-indigo-50/30 rounded-xl p-5 space-y-4">
              <div className="flex gap-2 items-center font-bold text-indigo-900 border-b border-indigo-100 pb-2">
                <Video size={18} className="text-indigo-600" />
                Meeting Platform Details
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <div className="text-xs text-indigo-400 font-bold uppercase mb-0.5">Platform</div>
                  <div className="font-semibold text-slate-700">{data.platform_name}</div>
                </div>

                {data.meeting_id && (
                  <div>
                    <div className="text-xs text-indigo-400 font-bold uppercase mb-0.5">Meeting ID</div>
                    <div className="font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-indigo-100 inline-block">
                        {data.meeting_id}
                    </div>
                  </div>
                )}

                {data.meeting_password && (
                  <div>
                     <div className="text-xs text-indigo-400 font-bold uppercase mb-0.5 flex items-center gap-1">
                        <Lock size={10} /> Password
                     </div>
                     <div className="font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-indigo-100 inline-block">
                        {data.meeting_password}
                     </div>
                  </div>
                )}
                
                <div className="col-span-1 md:col-span-2">
                  <div className="text-xs text-indigo-400 font-bold uppercase mb-1">Meeting Link</div>
                  <a
                    href={data.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 w-full p-3 bg-white border border-indigo-200 rounded-lg text-indigo-600 font-semibold hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all shadow-sm group"
                  >
                    <Link2 size={16} className="group-hover:text-white transition-colors" />
                    Join Meeting Now
                  </a>
                </div>

                {data.remarks && (
                  <div className="col-span-1 md:col-span-2 pt-2 border-t border-indigo-100 mt-1">
                    <div className="text-xs text-indigo-400 font-bold uppercase mb-0.5">Remarks</div>
                    <div className="text-slate-600 italic">{data.remarks}</div>
                  </div>
                )}
              </div>
            </div>

            {/* ACCESS */}
            <div className="flex gap-3 items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="p-2 bg-white border border-slate-200 rounded-full text-slate-500">
                 <Users size={18} />
              </div>
              <div>
                 <div className="text-xs text-slate-400 font-bold uppercase">Who can view?</div>
                 <div className="text-sm font-semibold text-slate-700">{accessLabel()}</div>
              </div>
            </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm transition-all text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}