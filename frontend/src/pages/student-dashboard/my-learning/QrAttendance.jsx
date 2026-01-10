import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Clock,
  Calendar,
  Sparkles,
  BookOpen,
  ChevronDown,
  Layers,
  CheckCircle2,
  Loader2,
  Inbox,
  ScanLine,
  CalendarClock
} from "lucide-react";

import StudentAttendanceQrModal from "../../../components/student-dashboard/StudentAttendanceQrModal";

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

export default function QrAttendance() {
  const [liveSession, setLiveSession] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState("");
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({
    total_sessions: 0,
    present: 0,
    percentage: 0,
  });
  const [showQr, setShowQr] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    loadLiveAttendance();
    loadEnrollments();
  }, []);

  useEffect(() => {
    loadHistory();
  }, [selectedEnrollment]);

  async function loadLiveAttendance() {
    try {
      const res = await api.get("/student/attendance/live");
      if (res.data.active) {
        setLiveSession(res.data.session);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function loadEnrollments() {
    try {
      const res = await api.get("/student/attendance/enrollments");
      const unique = [];
      const seen = new Set();

      (res.data || []).forEach((item) => {
        const key = item.course_id + "-" + item.batch_id;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      });

      setEnrollments(unique);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadHistory() {
    try {

      setLoadingHistory(true);

      const params = {};

      if (selectedEnrollment) {

        const [courseId, batchId] =
          selectedEnrollment.split("|");

        params.course_id = courseId;
        params.batch_id = batchId;

      }

      const res = await api.get(
        "/student/attendance/history",
        {
          params,
        }
      );

      setHistory(
        res.data.history || []
      );

      setSummary(
        res.data.summary || {
          total_sessions: 0,
          present: 0,
          percentage: 0,
        }
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoadingHistory(false);

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
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-4">
            <div className="flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm text-white shrink-0">
              <QrCode size={24} />
            </div>
            QR Attendance
          </h1>
          <p className="text-slate-500 mt-3 text-m max-w-2xl leading-relaxed">
            Mark your presence using dynamic QR codes and track your overall attendance history across courses.
          </p>
        </motion.div>

        {/* LIVE ATTENDANCE BANNER */}
        <motion.div variants={itemVariants}>
          {liveSession ? (
            <div className="bg-emerald-600 rounded-3xl p-6 md:p-8 text-white shadow-[0_8px_30px_rgb(16,185,129,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/20">
                  <ScanLine size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-2xl tracking-tight">Active Attendance Session</h3>
                  <p className="text-emerald-100 font-medium text-sm mt-0.5">An instructor has initiated a live attendance check.</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowQr(true)}
                className="relative z-10 shrink-0 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-extrabold transition-all shadow-md active:scale-[0.98] bg-white text-emerald-700 hover:bg-emerald-50 w-full md:w-auto focus:outline-none focus:ring-4 focus:ring-white/20"
              >
                <QrCode size={20} />
                Scan QR Code Now
              </button>
            </div>
          ) : (
            <div className="bg-white/60 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 md:p-8 text-slate-500 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                  <QrCode size={28} className="text-slate-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-800 tracking-tight">No Active Sessions</h3>
                  <p className="text-slate-500 font-medium text-sm mt-0.5">There are no ongoing attendance checks at the moment.</p>
                </div>
              </div>
              
              <button
                disabled
                className="shrink-0 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold bg-slate-100/80 text-slate-400 cursor-not-allowed w-full md:w-auto border border-slate-200/50"
              >
                Ongoing Attendance
              </button>
            </div>
          )}
        </motion.div>

        {/* CONTROLS & FILTERS */}
        <motion.div variants={itemVariants} className="relative group max-w-xl z-20">
          <BookOpen
            size={20}
            className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300 z-10"
          />
          <select
            value={selectedEnrollment}
            onChange={(e) => setSelectedEnrollment(e.target.value)}
            className="w-full appearance-none pl-12 pr-10 py-3.5 bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all duration-300 text-slate-700 font-medium cursor-pointer"
          >
            <option value="">All Academic Enrollments</option>
            {enrollments.map((enrollment) => (
              <option
                key={enrollment.id}
                value={`${enrollment.course_id}|${enrollment.batch_id}`}
              >
                {enrollment.course_name}
                  {" • "}
                  {enrollment.batch_name}
                  {" ("}
                  {enrollment.status.charAt(0).toUpperCase() +
                  enrollment.status.slice(1)}
                  {")"}
              </option>
            ))}
          </select>
          <ChevronDown
            size={20}
            className="absolute right-4 top-3.5 text-slate-400 pointer-events-none"
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid md:grid-cols-3 gap-5"
        >

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              Total Sessions
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
              {summary.total_sessions}
            </h2>

          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              Present
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-emerald-600">
              {summary.present}
            </h2>

          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              Attendance
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-indigo-600">
              {summary.percentage}%
            </h2>

          </div>

        </motion.div>

        {/* HISTORY CONTENT AREA */}
        <motion.div variants={itemVariants} className="min-h-[400px]">
          <div className="flex items-center gap-2 font-extrabold text-slate-800 text-lg mb-6 px-2">
            <CalendarClock size={20} className="text-indigo-500" /> Attendance Ledger
          </div>

          <AnimatePresence mode="wait">
            
            {/* LOADING STATE */}
            {loadingHistory ? (
              <motion.div 
                key="loading-history"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32 text-slate-500 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                <p className="font-medium tracking-wide">Fetching attendance records...</p>
              </motion.div>
            ) : history.length === 0 ? (
              /* EMPTY STATE */
              <motion.div 
                key="empty-history"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-32 flex flex-col items-center transition-all duration-500"
              >
                <div className="bg-slate-100/50 p-6 rounded-full mb-6">
                  <Inbox size={48} className="text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                  No Records Found
                </h3>
                <p className="mt-2 text-slate-500 font-medium text-center max-w-md">
                  You don't have any attendance history for the selected criteria yet.
                </p>
              </motion.div>
            ) : (
              /* HISTORY TABLE */
              <motion.div 
                key="history-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 text-xs uppercase tracking-wider font-bold">
                        <th className="p-5 pl-6">Program Details</th>
                        <th className="p-5">Session Date</th>
                        <th className="p-5">Marked Time</th>
                        <th className="p-5 pr-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50">
                      {history.map((item) => (
                        <tr 
                          key={item.id} 
                          className="group hover:bg-white/90 transition-all duration-300"
                        >
                          <td className="p-5 pl-6">
                            <div className="flex items-center gap-4">
                              <div className="bg-slate-50 border border-slate-100 text-slate-400 rounded-xl p-2.5 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors duration-300 shadow-sm">
                                <BookOpen size={18} />
                              </div>
                              <div className="flex flex-col whitespace-normal min-w-0 max-w-sm">
                                <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-900 transition-colors duration-300 line-clamp-2 leading-tight">
                                  {item.course_name}
                                </h3>
                                <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-slate-500">
                                  <Layers size={12} className="text-slate-400" />
                                  {item.batch_name}
                                </span>
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-5">
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                              <Calendar size={14} className="text-slate-400" />
                              {item.session_date}
                            </span>
                          </td>

                          <td className="p-5">
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                              <Clock size={14} className="text-slate-400" />
                              {new Date(item.marked_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </td>

                          <td className="p-5 pr-6 text-right">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border shadow-sm ${
                                item.status === "present"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              <CheckCircle2 size={14} />

                              {item.status}
                            </span>
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

      {/* QR MODAL */}
      <StudentAttendanceQrModal
        open={showQr}
        session={liveSession}
        onClose={() => setShowQr(false)}
      />

    </div>
  );
}