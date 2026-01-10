import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import StudentExamViewModal from "./StudentExamViewModal";

import {
  ClipboardList,
  Eye,
  CalendarClock,
  BookOpen,
  Layers,
  Loader2,
  Inbox,
  Hash
} from "lucide-react";

export default function MyExams() {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const res = await api.get("/student/exams");
      setExams(Array.isArray(res.data) ? res.data : []);
    } catch {
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const s = String(status || "").toLowerCase();
    const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border";
    
    if (s === "live") {
      return (
        <span className={`${baseClasses} bg-rose-50/80 text-rose-700 border-rose-200/60 shadow-sm animate-pulse`}>
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-1.5 shrink-0"></span>
          {status}
        </span>
      );
    }
    if (s === "upcoming") {
      return (
        <span className={`${baseClasses} bg-indigo-50/80 text-indigo-700 border-indigo-200/60`}>
          {status}
        </span>
      );
    }
    if (s === "past" || s === "completed") {
      return (
        <span className={`${baseClasses} bg-slate-100/60 text-slate-600 border-slate-200/60`}>
          {status}
        </span>
      );
    }
    if (s === "cancelled") {
      return (
        <span className={`${baseClasses} bg-slate-50 text-slate-400 border-slate-200/50`}>
          {status}
        </span>
      );
    }

    return (
      <span className={`${baseClasses} bg-slate-100/60 text-slate-600 border-slate-200/60`}>
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 font-sans overflow-x-hidden pb-24">
      
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-4">
          <div className="flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm text-white shrink-0">
            <ClipboardList size={24} />
          </div>
          My Exams
        </h1>
        <p className="text-slate-500 mt-3 text-m max-w-2xl leading-relaxed">
          View your upcoming, live, and completed examinations. Access secure exam environments and review schedules.
        </p>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
          <p className="font-medium tracking-wide">Fetching examination data...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-32 flex flex-col items-center transition-all duration-500">
          <div className="bg-slate-100/50 p-6 rounded-full mb-6">
            <Inbox size={48} className="text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
            No Exams Scheduled
          </h3>
          <p className="mt-2 text-slate-500 font-medium text-center max-w-md">
            There are currently no examinations mapped to your profile. New schedules will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-5 pl-6">Examination</th>
                  <th className="p-5">Program Details</th>
                  <th className="p-5">Schedule</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {exams.map((exam) => (
                  <tr 
                    key={exam.id} 
                    className="group hover:bg-white/90 transition-all duration-300"
                  >
                    <td className="p-5 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-50 border border-slate-100 text-slate-400 rounded-xl p-2.5 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors duration-300 shadow-sm">
                          <ClipboardList size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-base group-hover:text-indigo-900 transition-colors duration-300">
                            {exam.name || "Untitled Examination"}
                          </span>
                          {exam.exam_category && (
                            <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-slate-500">
                              <Hash size={12} className="text-slate-400" />
                              {exam.exam_category}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-5">
                      <div className="flex flex-col gap-1.5 text-sm font-medium">
                        <span className="text-slate-700 flex items-center gap-2">
                          <BookOpen size={14} className="text-slate-400" /> 
                          {exam.course?.name || "N/A"}
                        </span>
                        <span className="text-slate-500 flex items-center gap-2">
                          <Layers size={14} className="text-slate-400" /> 
                          {exam.batch?.name || "N/A"}
                        </span>
                      </div>
                    </td>

                    <td className="p-5">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                        <CalendarClock size={14} className="text-slate-400" />
                        {exam.start_time ? new Date(exam.start_time).toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : "TBD"}
                      </span>
                    </td>

                    <td className="p-5">
                      <StatusBadge status={exam.status} />
                    </td>

                    <td className="p-5 pr-6 text-right">
                      <button
                        onClick={() => setSelectedExam(exam)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-[0.98] bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:shadow-md"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      {selectedExam && (
        <StudentExamViewModal
          exam={selectedExam}
          onClose={() => setSelectedExam(null)}
        />
      )}
    </div>
  );
}