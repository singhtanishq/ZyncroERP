import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Clock,
  CalendarClock,
  ExternalLink,
  X,
  Sparkles,
  Loader2,
  Inbox,
  Monitor,
  Hash,
  KeyRound,
  MessageSquareWarning,
  Eye,
  BookOpen,
  Layers
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function OnlineClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/student/online-classes");
      setClasses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const s = String(status || "").toLowerCase();
    
    if (s === "live") {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-rose-50/80 text-rose-700 border-rose-200/60 animate-pulse shadow-sm">
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
          Live Now
        </span>
      );
    }
    if (s === "completed") {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border bg-slate-50/80 text-slate-500 border-slate-200/60">
          Completed
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border bg-emerald-50/80 text-emerald-700 border-emerald-200/60">
        Scheduled
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 font-sans overflow-x-hidden pb-24">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-4">
            <div className="flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm text-white shrink-0">
              <Video size={24} />
            </div>
            Online Classes
          </h1>
          <p className="text-slate-500 mt-3 text-m max-w-2xl leading-relaxed">
            View your scheduled live sessions, join active classes, and review meeting instructions.
          </p>
        </motion.div>

        {/* CONTENT AREA */}
        <motion.div variants={itemVariants} className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {loading ? (
              <motion.div 
                key="loading-classes"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32 text-slate-500 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                <p className="font-medium tracking-wide">Fetching schedule...</p>
              </motion.div>
            ) : classes.length === 0 ? (
              <motion.div 
                key="empty-classes"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-32 flex flex-col items-center transition-all duration-500"
              >
                <div className="bg-slate-100/50 p-6 rounded-full mb-6">
                  <Inbox size={48} className="text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                  No Classes Scheduled
                </h3>
                <p className="mt-2 text-slate-500 font-medium text-center max-w-md">
                  There are currently no online classes scheduled for you. Please check back later.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="classes-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500"
              >
                {/* TABLE UI */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 text-xs uppercase tracking-wider font-bold">
                        <th className="p-5 pl-6">Session Details</th>
                        <th className="p-5">Program Details</th>
                        <th className="p-5">Schedule</th>
                        <th className="p-5">Status</th>
                        <th className="p-5 pr-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50">
                      {classes.map((item) => (
                        <tr 
                          key={item.id} 
                          className="group hover:bg-white/90 transition-all duration-300 cursor-pointer"
                          onClick={() => setSelectedClass(item)}
                        >
                          <td className="p-5 pl-6">
                            <div className="flex items-center gap-4">
                              <div className={`p-2.5 rounded-xl shrink-0 transition-colors duration-300 shadow-sm ${item.status === 'live' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100'}`}>
                                <Video size={18} />
                              </div>
                              <div className="flex flex-col whitespace-normal min-w-0 max-w-xs">
                                <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-900 transition-colors duration-300 line-clamp-2 leading-tight">
                                  {item.title || "Untitled Session"}
                                </h3>
                                {item.category && (
                                  <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-slate-500">
                                    <Hash size={12} className="text-slate-400" />
                                    {item.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-5">
                            <div className="flex flex-col gap-1.5 text-sm font-medium">
                              <span className="text-slate-700 flex items-center gap-2">
                                <BookOpen size={14} className="text-slate-400" /> 
                                {item.student_course?.name || "N/A"}
                              </span>
                              <span className="text-slate-500 flex items-center gap-2">
                                <Layers size={14} className="text-slate-400" /> 
                                {item.student_batch?.name || "N/A"}
                              </span>
                            </div>
                          </td>

                          <td className="p-5">
                            <div className="flex flex-col gap-1.5 text-sm font-medium">
                              <span className="text-slate-700 flex items-center gap-2">
                                <CalendarClock size={14} className="text-slate-400" /> 
                                {item.start_datetime ? new Date(item.start_datetime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "TBD"}
                              </span>
                              <span className="text-slate-500 flex items-center gap-2">
                                <Clock size={14} className="text-slate-400" /> 
                                {item.duration_minutes ? `${item.duration_minutes} Mins` : "N/A"}
                              </span>
                            </div>
                          </td>

                          <td className="p-5">
                            <StatusBadge status={item.status} />
                          </td>

                          <td className="p-5 pr-6 text-right">
                            <button
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-[0.98] bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:shadow-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedClass(item);
                              }}
                            >
                              <Eye size={16} />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {selectedClass && (
          <div className="fixed inset-0 z-[80] bg-slate-900/30 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden font-sans relative"
            >
              {/* MODAL HEADER */}
              <div className="px-6 py-5 border-b border-slate-100/50 bg-white/50 flex justify-between items-center shrink-0 z-10">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center p-2.5 rounded-xl shadow-sm shrink-0 ${selectedClass.status === 'live' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Video size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                      Session Details
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClass(null)}
                  className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200 shrink-0"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto overscroll-contain space-y-6">
                
                {/* CLASS TITLE BLOCK */}
                <div className="relative overflow-hidden group">
                  <h3 className="font-extrabold text-2xl md:text-3xl text-slate-800 tracking-tight leading-tight break-words">
                    {selectedClass.title || "Untitled Session"}
                  </h3>
                  
                  {selectedClass.description && (
                    <p className="text-sm font-medium text-slate-600 mt-3 leading-relaxed break-words">
                      {selectedClass.description}
                    </p>
                  )}
                </div>

                {/* LINE-BY-LINE FULL WIDTH DETAILS CONTAINER */}
                <div className="bg-slate-50/50 border border-slate-100/60 rounded-2xl flex flex-col overflow-hidden shadow-sm">
                  <InfoRow
                    icon={BookOpen}
                    label="Academic Program"
                    value={selectedClass.student_course?.name}
                  />
                  <InfoRow
                    icon={Layers}
                    label="Cohort Batch"
                    value={selectedClass.student_batch?.name}
                  />
                  <InfoRow
                    icon={CalendarClock}
                    label="Scheduled Date & Time"
                    value={
                      selectedClass.start_datetime
                        ? new Date(selectedClass.start_datetime).toLocaleString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "TBD"
                    }
                  />
                  <InfoRow
                    icon={Clock}
                    label="Estimated Duration"
                    value={selectedClass.duration_minutes ? `${selectedClass.duration_minutes} Minutes` : "Not Specified"}
                  />
                  <InfoRow
                    icon={Monitor}
                    label="Hosting Platform"
                    value={selectedClass.platform_name || "Online"}
                  />
                  <InfoRow
                    icon={Hash}
                    label="Meeting ID / Link Code"
                    value={selectedClass.meeting_id || "Not Required"}
                  />
                  <InfoRow
                    icon={KeyRound}
                    label="Meeting Password"
                    value={
                      <span className="font-mono bg-white px-2 py-1 rounded-lg text-slate-700 border border-slate-200/60 tracking-wider">
                        {selectedClass.meeting_password || "None"}
                      </span>
                    }
                    isLast
                  />
                </div>

                {/* REMARKS SECTION */}
                {selectedClass.remarks && (
                  <div className="bg-amber-50/50 border border-amber-100/60 rounded-2xl p-6 relative overflow-hidden group">
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 font-extrabold text-amber-800 text-lg mb-3">
                          <MessageSquareWarning size={20} className="text-amber-600" />
                          Important Notes
                        </div>
                        <p className="text-sm font-medium text-amber-900 leading-relaxed break-words bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-amber-200/50">
                          {selectedClass.remarks}
                        </p>
                     </div>
                  </div>
                )}

              </div>

              {/* MODAL FOOTER */}
              <div className="px-6 py-5 border-t border-slate-100/50 bg-slate-50/50 flex justify-end shrink-0">
                <a
                  href={selectedClass.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold transition-all shadow-sm focus:outline-none focus:ring-4 text-sm ${
                    selectedClass.status === 'completed'
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200/60'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow active:scale-[0.98] focus:ring-indigo-500/20'
                  }`}
                  onClick={(e) => {
                    if (selectedClass.status === 'completed') e.preventDefault();
                  }}
                >
                  Join Virtual Class <ExternalLink size={18} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ================= REUSABLE UI COMPONENTS =================

function InfoRow({ icon: Icon, label, value, isLast }) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:p-5 hover:bg-white/60 transition-colors ${
        !isLast ? "border-b border-slate-100/60" : ""
      }`}
    >
      <div className="flex items-center gap-2 shrink-0">
        <Icon size={16} className="text-indigo-400 shrink-0" />
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest break-words">
          {label}
        </span>
      </div>
      <div className="text-sm font-bold text-slate-800 text-left sm:text-right leading-snug break-words">
        {value || "-"}
      </div>
    </div>
  );
}