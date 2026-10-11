import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { useToast } from "../../../components/common/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Inbox,
  Hash,
  Layers,
  CreditCard,
  MessageSquareWarning,
  Eye
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

export default function MyCourses() {
  const { toast } = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      const res = await api.get("/student/my-courses");
      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function viewCourse(id) {
    try {
      setLoadingId(id);
      const res = await api.get(`/student/my-courses/${id}`);
      setSelectedCourse(res.data);
      setModalOpen(true);
    } catch (err) {
      toast(
        err?.response?.data?.message ||
          "Unable to load course details. Please try again.",
        "error"
      );
    } finally {
      setLoadingId(null);
    }
  }

  const StatusBadge = ({ status }) => {
    const s = String(status || "").toLowerCase();
    const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border";
    
    if (s === "active") {
      return (
        <span className={`${baseClasses} bg-emerald-50/80 text-emerald-700 border-emerald-200/60`}>
          <CheckCircle size={14} /> Active
        </span>
      );
    }
    if (s === "pending") {
      return (
        <span className={`${baseClasses} bg-amber-50/80 text-amber-700 border-amber-200/60`}>
          <Clock size={14} /> Pending
        </span>
      );
    }
    if (s === "completed") {
      return (
        <span className={`${baseClasses} bg-indigo-50/80 text-indigo-700 border-indigo-200/60`}>
          <AwardIcon size={14} /> Completed
        </span>
      );
    }
    
    return (
      <span className={`${baseClasses} bg-rose-50/80 text-rose-700 border-rose-200/60`}>
        <XCircle size={14} /> {status || "Cancelled"}
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
              <BookOpen size={24} />
            </div>
            My Courses
          </h1>
          <p className="text-slate-500 mt-3 text-m max-w-2xl leading-relaxed">
            View all your course enrollments, track your progress, and check your admission status.
          </p>
        </motion.div>

        {/* CONTENT AREA */}
        <motion.div variants={itemVariants} className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {loading ? (
              <motion.div 
                key="loading-courses"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32 text-slate-500 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                {/* LOADING STATE */}
                <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                <p className="font-medium tracking-wide">Fetching enrollments...</p>
              </motion.div>
            ) : courses.length === 0 ? (
              <motion.div 
                key="empty-courses"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-32 flex flex-col items-center transition-all duration-500"
              >
                {/* EMPTY STATE */}
                <div className="bg-slate-100/50 p-6 rounded-full mb-6">
                  <Inbox size={48} className="text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                  No Enrollments Found
                </h3>
                <p className="mt-2 text-slate-500 font-medium text-center max-w-md">
                  You have not been enrolled in any courses yet. Once assigned, your academic journey will appear here.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="course-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* COURSE GRID */}
                {courses.map((course, idx) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 relative overflow-hidden group hover:bg-white/90 transition-all duration-300 flex flex-col"
                  >
                    {/* Card Top: Icon, Title & Status */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="p-3 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors duration-300 shadow-sm">
                        <BookOpen size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <StatusBadge status={course.status} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg line-clamp-2 group-hover:text-indigo-900 transition-colors">
                          {course.course?.name || "Untitled Course"}
                        </h3>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="bg-slate-50/50 border border-slate-100/60 rounded-xl p-4 mt-auto space-y-3.5">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                          <Hash size={14} className="text-indigo-400" /> Code
                        </span>
                        <span className="text-sm font-semibold text-slate-700 truncate text-right">
                          {course.course?.code || "N/A"}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between gap-4 border-t border-slate-100/60 pt-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                          <Layers size={14} className="text-indigo-400" /> Batch
                        </span>
                        <span className="text-sm font-semibold text-slate-700 truncate text-right">
                          {course.batch?.name || "Not Assigned"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-t border-slate-100/60 pt-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                          <Clock size={14} className="text-indigo-400" /> Enrolled
                        </span>
                        <span className="text-sm font-semibold text-slate-700 truncate text-right">
                          {course.joined_at
                            ? new Date(course.joined_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 pt-5 border-t border-slate-100/50">
                      <button
                        onClick={() => viewCourse(course.id)}
                        disabled={loadingId === course.id}
                        className={`w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
                          loadingId === course.id 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
                        }`}
                      >
                        {loadingId === course.id ? (
                          <><Loader2 size={16} className="animate-spin text-indigo-500" /> Loading...</>
                        ) : (
                          <><Eye size={16} /> View Details</>
                        )}
                      </button>
                    </div>

                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {modalOpen && selectedCourse && (
          <div className="fixed inset-0 z-[80] bg-slate-900/30 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden font-sans relative"
            >
              {/* MODAL HEADER */}
              <div className="px-6 py-5 border-b border-slate-100/50 bg-white/50 flex justify-between items-center shrink-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                      Enrollment Ledger
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200 shrink-0"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto overscroll-contain space-y-6">
                
                {/* COURSE TITLE BLOCK */}
                <div>
                  <h3 className="font-extrabold text-2xl text-slate-800 leading-tight mb-3">
                    {selectedCourse.course?.name || "Untitled Course"}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 bg-slate-50/50 px-3 py-1.5 rounded-full border border-slate-100/60">
                    <Hash size={16} className="text-indigo-500" />
                    Code: <span className="text-slate-700 font-semibold uppercase">{selectedCourse.course?.code || "N/A"}</span>
                  </div>
                </div>

                {/* LINE-BY-LINE FULL WIDTH DETAILS CONTAINER */}
                <div className="bg-slate-50/50 border border-slate-100/60 rounded-2xl flex flex-col overflow-hidden">
                  <InfoRow
                    icon={Layers}
                    label="Cohort Batch"
                    value={selectedCourse.batch?.name}
                  />
                  <InfoRow
                    icon={CheckCircle}
                    label="Academic Status"
                    value={
                      <span className="capitalize">{selectedCourse.status || "-"}</span>
                    }
                  />
                  <InfoRow
                    icon={CreditCard}
                    label="Payment Status"
                    value={
                      <span className={`capitalize ${String(selectedCourse.payment_status).toLowerCase() === 'paid' ? 'text-emerald-600 font-black' : 'text-amber-600 font-bold'}`}>
                        {selectedCourse.payment_status || "-"}
                      </span>
                    }
                  />
                  <InfoRow
                    icon={Clock}
                    label="Joined Date"
                    value={
                      selectedCourse.joined_at
                        ? new Date(selectedCourse.joined_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A"
                    }
                    isLast={!selectedCourse.completion_date}
                  />
                  {selectedCourse.completion_date && (
                    <InfoRow
                      icon={AwardIcon}
                      label="Completion Date"
                      value={
                        <span className="text-emerald-700 font-black">
                          {new Date(selectedCourse.completion_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      }
                      isLast
                    />
                  )}
                </div>

                {/* REMARKS SECTION */}
                {selectedCourse.remarks && (
                  <div className="bg-amber-50/50 border border-amber-100/60 rounded-2xl p-6 relative overflow-hidden group">
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 font-extrabold text-amber-800 text-lg mb-3">
                          <MessageSquareWarning size={20} className="text-amber-600" />
                          Administrative Remarks
                        </div>
                        <p className="text-sm font-medium text-amber-900 leading-relaxed bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-amber-200/50">
                          {selectedCourse.remarks}
                        </p>
                     </div>
                  </div>
                )}

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

// Custom Award Icon for Completed status
function AwardIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}