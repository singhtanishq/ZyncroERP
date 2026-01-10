import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ClipboardList, 
  Calendar, 
  Clock, 
  BookOpen, 
  Layers, 
  Monitor, 
  MapPin, 
  Link2, 
  FileText, 
  Info,
  Tag
} from "lucide-react";

export default function ViewExamModal({ exam, onClose }) {
  if (!exam) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm text-indigo-600">
                <ClipboardList size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Exam Details</h2>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Comprehensive Overview</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Exam Name</div>
              <div className="text-xl font-bold text-slate-900 leading-tight">{exam.name}</div>
              
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                  exam.status === 'upcoming' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  exam.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  exam.status === 'live' ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {exam.status}
                </span>
                
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200">
                  <Tag size={10} /> {exam.exam_category}
                </span>
              </div>
            </div>

            {exam.description && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-3">
                <FileText size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed">{exam.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen size={12} /> Course
                </div>
                <div className="font-semibold text-slate-700 text-sm">{exam.course?.name || "-"}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers size={12} /> Batch
                </div>
                <div className="font-semibold text-slate-700 text-sm">{exam.batch?.name || "-"}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar size={12} /> Start Time
                </div>
                <div className="font-semibold text-slate-700 text-sm">{formatDate(exam.start_time)}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock size={12} /> Duration
                </div>
                <div className="font-semibold text-slate-700 text-sm">{exam.duration_minutes} Minutes</div>
              </div>
            </div>

            <div className={`rounded-xl p-5 border ${
              exam.mode === 'online' 
                ? "bg-indigo-50/50 border-indigo-100" 
                : "bg-amber-50/50 border-amber-100"
            }`}>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-black/5">
                {exam.mode === 'online' ? <Monitor size={18} className="text-indigo-600" /> : <MapPin size={18} className="text-amber-600" />}
                <h3 className={`font-bold text-sm uppercase tracking-wide ${exam.mode === 'online' ? "text-indigo-900" : "text-amber-900"}`}>
                  {exam.mode} Mode Details
                </h3>
              </div>

              {exam.mode === "online" && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-indigo-900/60 font-medium">Platform:</span>
                    <span className="font-bold text-indigo-900">{exam.platform_name}</span>
                  </div>
                  
                  {exam.platform_description && (
                    <div className="text-indigo-800 bg-white/60 p-3 rounded-lg border border-indigo-100">
                      {exam.platform_description}
                    </div>
                  )}

                  <div className="pt-2">
                    <a 
                      href={exam.exam_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
                    >
                      <Link2 size={16} /> Open Exam Link
                    </a>
                  </div>
                </div>
              )}

              {exam.mode === "offline" && (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="block text-amber-900/60 font-medium text-xs uppercase tracking-wide mb-1">Exam Center</span>
                    <div className="font-bold text-amber-900 bg-white/60 p-2 rounded-lg border border-amber-100">
                      {exam.center_name}
                    </div>
                  </div>
                  
                  {exam.offline_notes && (
                    <div>
                      <span className="block text-amber-900/60 font-medium text-xs uppercase tracking-wide mb-1">Instructions</span>
                      <div className="text-amber-900 bg-white/60 p-3 rounded-lg border border-amber-100 leading-relaxed">
                        {exam.offline_notes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10">
            <button
              onClick={onClose}
              className="w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-[0.98]"
            >
              Close Details
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}