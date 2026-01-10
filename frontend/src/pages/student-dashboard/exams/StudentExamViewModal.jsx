import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  Layers,
  CalendarClock,
  Clock,
  Monitor,
  MapPin,
  ClipboardList,
  Hash,
  FileText,
  ExternalLink
} from "lucide-react";

export default function StudentExamViewModal({
  exam,
  onClose,
}) {
  if (!exam) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] bg-slate-900/30 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden font-sans relative"
        >
          {/* HEADER */}
          <div className="px-6 py-5 border-b border-slate-100/50 bg-white/50 flex justify-between items-center shrink-0 z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm shrink-0">
                <ClipboardList size={20} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  Examination Details
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200 shrink-0"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* BODY */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto overscroll-contain space-y-6">
            
            {/* EXAM TITLE BLOCK */}
            <div>
              <h3 className="font-extrabold text-2xl text-slate-800 leading-tight mb-3">
                {exam.name || "Untitled Examination"}
              </h3>
              {exam.exam_category && (
                <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 bg-slate-50/50 px-3 py-1.5 rounded-full border border-slate-100/60">
                  <Hash size={16} className="text-indigo-500" />
                  Category: <span className="text-slate-700 font-semibold uppercase">{exam.exam_category}</span>
                </div>
              )}
            </div>

            {/* GRANULAR INFO - COMPACT TABLE STYLE */}
            <div className="bg-slate-50/50 border border-slate-100/60 rounded-2xl flex flex-col overflow-hidden">
              <InfoRow
                icon={BookOpen}
                label="Academic Program"
                value={exam.course?.name}
              />
              <InfoRow
                icon={Layers}
                label="Cohort Batch"
                value={exam.batch?.name}
              />
              <InfoRow
                icon={CalendarClock}
                label="Scheduled Start"
                value={
                  exam.start_time
                    ? new Date(exam.start_time).toLocaleString("en-US", {
                        month: "short",
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
                label="Duration"
                value={exam.duration_minutes ? `${exam.duration_minutes} Minutes` : "Not Specified"}
                isLast
              />
            </div>

            {/* DESCRIPTION SECTION */}
            {exam.description && (
              <div className="bg-slate-50/50 rounded-2xl border border-slate-100/60 p-5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-2">
                  <FileText size={14} className="text-indigo-400" /> General Instructions
                </h4>
                <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {exam.description}
                </div>
              </div>
            )}

            {/* MODE-SPECIFIC SECTIONS */}
            {exam.mode === "online" && (
              <div className="bg-indigo-50/50 border border-indigo-100/60 rounded-2xl p-6 relative overflow-hidden group">
                 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-extrabold text-indigo-800 text-lg mb-4">
                        <Monitor size={20} className="text-indigo-600" />
                        Online Examination
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-[11px] font-bold text-indigo-400/80 uppercase tracking-widest mb-1">
                          Assessment Platform
                        </p>
                        <p className="font-bold text-indigo-900 text-base break-words">
                          {exam.platform_name || "Not Specified"}
                        </p>
                      </div>

                      {exam.platform_description && (
                        <p className="text-sm font-medium text-indigo-700/80 leading-relaxed mb-4">
                          {exam.platform_description}
                        </p>
                      )}
                    </div>

                    {exam.exam_link && (
                      <div className="shrink-0 w-full sm:w-auto pt-4 sm:pt-0 border-t border-indigo-100/60 sm:border-none mt-auto">
                        <a
                          href={exam.exam_link}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm hover:shadow focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 active:scale-[0.98] text-sm"
                        >
                          <ExternalLink size={16} />
                          Launch Portal
                        </a>
                      </div>
                    )}
                 </div>
              </div>
            )}

            {exam.mode === "offline" && (
              <div className="bg-amber-50/50 border border-amber-100/60 rounded-2xl p-6 relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 font-extrabold text-amber-800 text-lg mb-4">
                      <MapPin size={20} className="text-amber-600" />
                      Offline Examination
                    </div>
                    
                    <div>
                      <p className="text-[11px] font-bold text-amber-500/80 uppercase tracking-widest mb-1">
                        Exam Center Venue
                      </p>
                      <p className="font-bold text-amber-900 text-base break-words">
                        {exam.center_name || "Venue TBD"}
                      </p>
                    </div>

                    {exam.offline_notes && (
                      <div className="bg-white/60 backdrop-blur-sm border border-amber-200/50 p-4 rounded-xl mt-4">
                        <p className="text-[11px] font-bold text-amber-500/80 uppercase tracking-widest mb-1.5">
                          Venue Notes / Instructions
                        </p>
                        <p className="text-sm font-medium text-amber-800 leading-relaxed">
                          {exam.offline_notes}
                        </p>
                      </div>
                    )}
                 </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ================= REUSABLE UI COMPONENT =================

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