import React, { useEffect, useMemo, useState } from "react";
import ConfirmModal from "../../components/ConfirmModal";
import api from "../../lib/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  CalendarDays,
  BookOpen,
  CheckCircle2,
  Search,
  Sparkles,
  ChevronDown,
  Loader2,
  Inbox,
  Clock,
  Layers,
  ChevronRight
} from "lucide-react";

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

export default function EnrollCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");

  const [saving, setSaving] = useState(false);
  const [confirmItem, setConfirmItem] = useState(null);

  const [toast, setToast] = useState({
    msg: "",
    type: "success",
  });

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);

      const res = await api.get(
        "/student/enrollments/available-courses"
      );

      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (msg, type = "success") => {
    setToast({
      msg,
      type,
    });

    setTimeout(() => {
      setToast({
        msg: "",
        type: "success",
      });
    }, 3500);
  };

  const courseOptions = [
    {
      id: "all",
      name: "All Courses",
    },
    ...Array.from(
      new Map(
        courses.map((c) => [
          c.course_id,
          {
            id: c.course_id,
            name: c.course_name,
          },
        ])
      ).values()
    ),
  ];

  const batchOptions = [
    {
      id: "all",
      name: "All Batches",
    },
    ...Array.from(
      new Map(
        courses
          .filter(
            (c) =>
              selectedCourse === "all" ||
              String(c.course_id) === String(selectedCourse)
          )
          .map((b) => [
            b.batch_id,
            {
              id: b.batch_id,
              name: b.batch_name,
            },
          ])
      ).values()
    ),
  ];

  const filteredCourses = useMemo(() => {
    return courses.filter((item) => {
      const courseOk =
        selectedCourse === "all" ||
        String(item.course_id) === String(selectedCourse);

      const batchOk =
        selectedBatch === "all" ||
        String(item.batch_id) === String(selectedBatch);

      return courseOk && batchOk;
    });
  }, [courses, selectedCourse, selectedBatch]);

  async function enroll(item) {
    if (!item) return;

    try {
      setSaving(true);

      await api.post("/student/enrollments", {
        course_id: item.course_id,
        batch_id: item.batch_id,
      });

      await loadCourses();

      showToast(
        "Enrollment request submitted successfully.",
        "success"
      );
    } catch (err) {
      showToast(
        err?.response?.data?.message ||
          "Unable to submit enrollment.",
        "error"
      );
    } finally {
      setSaving(false);
      setConfirmItem(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 font-sans overflow-x-hidden pb-24">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
              <div className="flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm text-white shrink-0">
                <GraduationCap size={24} />
              </div>
              Enroll Course
            </h1>
            <p className="text-slate-500 mt-3 text-m max-w-2xl leading-relaxed">
              Browse available courses and submit a new enrollment request to begin your academic journey.
            </p>
          </div>
        </motion.div>

        {/* CONTROLS & FILTERS */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-xl p-4 rounded-3xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col md:flex-row gap-4 items-center z-30">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">
             Explore By
          </div>

          <div className="flex flex-col sm:flex-row w-full gap-4">
            <div className="relative group w-full">
              <BookOpen
                size={18}
                className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300 z-10"
              />
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedBatch("all");
                }}
                className="w-full appearance-none bg-white border border-slate-200/60 text-slate-700 pl-11 pr-10 py-3 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium text-sm cursor-pointer shadow-sm hover:border-indigo-200"
              >
                {courseOptions.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-4 top-3.5 text-slate-400 pointer-events-none"
              />
            </div>

            <div className="relative group w-full">
              <Layers
                size={18}
                className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300 z-10"
              />
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-200/60 text-slate-700 pl-11 pr-10 py-3 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium text-sm cursor-pointer shadow-sm hover:border-indigo-200"
              >
                {batchOptions.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-4 top-3.5 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </motion.div>

        {/* CONTENT AREA */}
        <motion.div variants={itemVariants} className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* LOADING STATE */}
            {loading ? (
              <motion.div 
                key="loading-courses"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32 text-slate-500 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                <p className="font-medium tracking-wide">Loading available courses...</p>
              </motion.div>
            ) : filteredCourses.length === 0 ? (
              /* EMPTY STATE */
              <motion.div 
                key="empty-courses"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-32 flex flex-col items-center transition-all duration-500"
              >
                <div className="bg-slate-100/50 p-6 rounded-full mb-6">
                  <GraduationCap size={48} className="text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                  No Courses Found
                </h3>
                <p className="mt-2 text-slate-500 font-medium text-center max-w-md">
                  No active courses match your selected filters. Please adjust your criteria.
                </p>
              </motion.div>
            ) : (
              /* COURSES GRID */
              <motion.div 
                key="courses-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredCourses.map((item, idx) => {
                  const isActive = item.enrollment_status === "active";
                    const isPending = item.enrollment_status === "pending";
                    const isCompleted = item.enrollment_status === "completed";

                    const isAvailable =
                      !isActive &&
                      !isPending &&
                      !isCompleted;

                  return (
                    <motion.div
                      key={item.batch_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 relative overflow-hidden group hover:bg-white/90 transition-all duration-300 flex flex-col"
                    >
                      {/* Very Subtle Decorative Glows */}
                      <div className="absolute -right-20 -top-20 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>

                      <div className="relative z-10 flex flex-col h-full gap-5">
                        
                        {/* Top: Icon & Status */}
                        <div className="flex items-start justify-between">
                          <div className="p-3 bg-slate-50 border border-slate-100/60 text-indigo-500 rounded-2xl shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors shadow-sm">
                            <BookOpen size={22} />
                          </div>
                          
                          {/* Minimal Status Badges */}
                          {isActive && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-emerald-50/50 text-emerald-600 border border-emerald-100/50">
                              <CheckCircle2 size={12} />
                              Active
                            </span>
                          )}

                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-amber-50/50 text-amber-600 border border-amber-100/50">
                              <Clock size={12} />
                              Pending
                            </span>
                          )}

                          {isCompleted && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                              <CheckCircle2 size={12} />
                              Completed
                            </span>
                          )}
                        </div>

                        {/* Title & Batch */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-extrabold text-xl text-slate-800 tracking-tight leading-tight group-hover:text-indigo-900 transition-colors line-clamp-2">
                            {item.course_name}
                          </h3>
                          <div className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-1 rounded-lg bg-slate-50/80 border border-slate-100/80 text-xs font-semibold text-slate-500 truncate max-w-full">
                            <Layers size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate">{item.batch_name}</span>
                          </div>
                        </div>

                        {/* Dates Info */}
                        <div className="bg-slate-50/50 border border-slate-100/60 rounded-xl p-3.5 mt-auto">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <CalendarDays size={14} className="text-indigo-400 shrink-0" />
                            <span className="truncate">
                              {new Date(item.start_date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                              {" — "}
                              {new Date(item.end_date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-1 pt-4 border-t border-slate-100/50">
                          <button
                            disabled={!isAvailable || saving}
                            onClick={() => setConfirmItem(item)}
                            className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
                              isActive
                                ? "bg-slate-50/80 text-slate-400 border border-slate-200/60 cursor-not-allowed shadow-none"
                                : isPending
                                ? "bg-amber-50/30 text-amber-600 border border-amber-200/50 cursor-not-allowed shadow-none"
                                : isCompleted
                                ? "bg-blue-50 text-blue-600 border border-blue-200 cursor-not-allowed shadow-none"
                                : saving && confirmItem?.batch_id === item.batch_id
                                ? "bg-indigo-400 text-white cursor-wait"
                                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow shadow-sm active:scale-[0.98]"
                            }`}
                          >
                            {isActive
                              ? "Already Enrolled"
                              : isPending
                              ? "Awaiting Approval"
                              : isCompleted
                              ? "Course Completed"
                              : saving && confirmItem?.batch_id === item.batch_id
                              ? <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                              : <><ChevronRight size={16} /> Request Enrollment</>}
                          </button>
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

      {/* CONFIRMATION MODAL */}
      <ConfirmModal
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        onConfirm={() => enroll(confirmItem)}
        title="Confirm Enrollment"
        message={
          confirmItem
            ? `Are you sure you want to request enrollment for "${confirmItem.course_name}" (${confirmItem.batch_name})?`
            : ""
        }
      />

      {/* MINIMAL TOAST */}
      <AnimatePresence>
        {toast.msg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <div
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl shadow-slate-200/50 border backdrop-blur-xl ${
                toast.type === "success"
                  ? "bg-white/90 border-emerald-100 text-emerald-700"
                  : "bg-white/90 border-rose-100 text-rose-700"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={20} className="text-emerald-500" />
              ) : (
                <Clock size={20} className="text-rose-500" />
              )}
              <span className="font-semibold text-sm tracking-wide">
                {toast.msg}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}