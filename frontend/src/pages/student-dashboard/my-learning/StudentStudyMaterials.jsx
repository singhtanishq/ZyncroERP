import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Video,
  StickyNote,
  BookOpen,
  Layers,
  ExternalLink,
  Loader2,
  Sparkles,
  Inbox,
  AlignLeft,
  PlayCircle,
  DownloadCloud
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

export default function StudentStudyMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get("/student/study-materials");
      setMaterials(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine premium styling based on material type
  const getTheme = (type) => {
    const t = String(type).toLowerCase();
    
    if (t === "pdf") {
      return {
        glow: "bg-gradient-to-br from-rose-500 to-pink-600",
        iconBg: "bg-rose-50 text-rose-600",
        badge: "bg-rose-50/80 text-rose-700 border-rose-200/60",
        icon: <FileText size={28} strokeWidth={2.5} />,
        label: "PDF Document"
      };
    }
    
    if (t === "video") {
      return {
        glow: "bg-gradient-to-br from-blue-500 to-indigo-600",
        iconBg: "bg-blue-50 text-blue-600",
        badge: "bg-blue-50/80 text-blue-700 border-blue-200/60",
        icon: <PlayCircle size={28} strokeWidth={2.5} />,
        label: "Video Lesson"
      };
    }
    
    // Default / Notes
    return {
      glow: "bg-gradient-to-br from-amber-500 to-orange-500",
      iconBg: "bg-amber-50 text-amber-600",
      badge: "bg-amber-50/80 text-amber-700 border-amber-200/60",
      icon: <StickyNote size={28} strokeWidth={2.5} />,
      label: "Text Notes"
    };
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
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-4">
            <div className="flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm text-white shrink-0">
              <BookOpen size={24} />
            </div>
            Study Materials
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-3 text-m max-w-2xl leading-relaxed">
            Access digital notes, video tutorials, and assigned reading materials provided by your instructors.
          </p>
        </motion.div>

        {/* CONTENT AREA */}
        <motion.div variants={itemVariants} className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {loading ? (
              <motion.div 
                key="loading-materials"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32 text-[rgb(var(--zx-text-muted))] bg-[rgb(var(--zx-surface))] backdrop-blur-2xl rounded-3xl border border-[rgb(var(--zx-border))] shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                {/* LOADING STATE */}
                <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                <p className="font-medium tracking-wide">Loading library...</p>
              </motion.div>
            ) : materials.length === 0 ? (
              <motion.div 
                key="empty-materials"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[rgb(var(--zx-surface))] backdrop-blur-2xl rounded-3xl border border-[rgb(var(--zx-border))] shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-32 flex flex-col items-center transition-all duration-500"
              >
                {/* EMPTY STATE */}
                <div className="bg-[rgb(var(--zx-surface-hover))] p-6 rounded-full mb-6">
                  <BookOpen size={48} className="text-[rgb(var(--zx-text-muted))]" />
                </div>
                <h3 className="text-2xl font-bold text-[rgb(var(--zx-text))] tracking-tight">
                  No Materials Available
                </h3>
                <p className="mt-2 text-[rgb(var(--zx-text-muted))] font-medium text-center max-w-md">
                  Your instructors haven't uploaded any study materials for your enrolled courses yet.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="materials-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* MATERIALS GRID */}
                {materials.map((m, idx) => {
                  const theme = getTheme(m.type);

                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-[rgb(var(--zx-surface))] backdrop-blur-2xl rounded-3xl border border-[rgb(var(--zx-border))] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 relative overflow-hidden group hover:bg-[rgb(var(--zx-surface-hover))] transition-all duration-300 flex flex-col"
                    >
                      {/* Decorative Background Glows */}
                      <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700 blur-3xl pointer-events-none ${theme.glow}`}></div>

                      <div className="relative z-10 flex flex-col h-full gap-6">
                        
                        {/* Top Row: Icon, Title & Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className={`p-3 rounded-2xl shrink-0 mt-1 border border-[rgb(var(--zx-border))] shadow-sm ${theme.iconBg}`}>
                              {theme.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="mb-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${theme.badge}`}>
                                  {theme.label}
                                </span>
                              </div>
                              <h3 className="font-bold text-[rgb(var(--zx-text))] text-xl tracking-tight leading-tight break-words group-hover:text-indigo-900 transition-colors duration-300">
                                {m.title || "Untitled Document"}
                              </h3>

                              {/* NEW PROGRAM PILLS ADDED HERE */}
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] px-2.5 py-1 rounded-lg">
                                  <BookOpen size={12} className="text-indigo-400" />
                                  {m.student_course?.name || "N/A"}
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] px-2.5 py-1 rounded-lg">
                                  <Layers size={12} className="text-indigo-400" />
                                  {m.student_batch?.name || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description Section */}
                        {m.description && (
                          <div className="bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] rounded-2xl p-4">
                             <p className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <AlignLeft size={14} className="text-indigo-400" /> Description
                             </p>
                             <p className="text-sm font-medium text-[rgb(var(--zx-text-muted))] leading-relaxed break-words">
                               {m.description}
                             </p>
                          </div>
                        )}

                        {/* Action / Content Section */}
                        <div className="mt-auto pt-4 border-t border-[rgb(var(--zx-border))]">
                          
                          {/* VIDEO TYPE */}
                          {m.type === "video" && (
                            <a
                              href={m.video_url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98] bg-blue-600 text-white hover:bg-blue-700 hover:shadow text-sm group-hover:shadow-md"
                            >
                              <Video size={16} />
                              Watch Video Tutorial
                              <ExternalLink size={14} className="ml-1 opacity-70" />
                            </a>
                          )}

                          {/* PDF TYPE */}
                          {m.type === "pdf" && (
                            <a
                              href={`/api/student/study-materials/${m.id}/view`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98] bg-rose-600 text-white hover:bg-rose-700 hover:shadow text-sm group-hover:shadow-md"
                            >
                              <DownloadCloud size={16} />
                              View / Download PDF
                              <ExternalLink size={14} className="ml-1 opacity-70" />
                            </a>
                          )}

                          {/* NOTES TYPE */}
                          {m.type === "notes" && (
                            <div className="bg-amber-50/50 border border-amber-100/60 rounded-2xl p-5 text-sm font-medium text-amber-900 leading-relaxed custom-dashboard-scroll max-h-48 overflow-y-auto whitespace-pre-wrap break-words">
                              {m.notes}
                            </div>
                          )}

                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* CUSTOM SCROLLBAR FOR NOTES */}
      <style>{`
        .custom-dashboard-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}