import {
  X,
  Megaphone,
  CalendarDays,
  Globe,
  BookOpen,
  Layers,
} from "lucide-react";

export default function CommunicationViewModal({
  open,
  communication,
  onClose,
}) {
  if (!open || !communication) return null;

  function audience() {
    
    const courseName = communication.student_course?.name || communication.accessRules?.[0]?.course?.name;
    const batchName = communication.student_batch?.name || communication.accessRules?.[0]?.batch?.name;

    const pillBase = "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide border backdrop-blur-md transition-colors duration-300";

    if (courseName && batchName) {
      return (
        <span className={`${pillBase} bg-purple-50/80 text-purple-700 border-purple-200/60`}>
          <Layers size={14} />
          {courseName}
          <span className="opacity-50 mx-0.5">•</span>
          {batchName}
        </span>
      );
    }

    if (courseName) {
      return (
        <span className={`${pillBase} bg-emerald-50/80 text-emerald-700 border-emerald-200/60`}>
          <BookOpen size={14} />
          {courseName}
        </span>
      );
    }

    return (
      <span className={`${pillBase} bg-slate-100/80 text-slate-700 border-slate-200/60`}>
        <Globe size={14} />
        All Students
      </span>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
      
      <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300 ease-out flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-100/50 bg-white/50 flex justify-between items-start shrink-0">
          
          <div className="flex items-start gap-5 pr-4">
            <div className="flex items-center justify-center p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm text-white shrink-0">
              <Megaphone size={24} />
            </div>
            
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {communication.title}
              </h2>
              
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {audience()}
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 bg-slate-50/50 px-3 py-1.5 rounded-full border border-slate-100/60">
                  <CalendarDays size={14} />
                  {new Date(communication.created_at).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200 shrink-0"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
          
        </div>

        {/* BODY */}
        <div className="px-8 py-8 overflow-y-auto overscroll-contain">
          <div className="whitespace-pre-wrap text-slate-700 text-[16px] leading-relaxed font-medium">
            {communication.message}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 border-t border-slate-100/50 bg-slate-50/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wide shadow-sm hover:shadow focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 active:scale-[0.98]"
          >
            Close
          </button>
        </div>
        
      </div>
    </div>
  );
}