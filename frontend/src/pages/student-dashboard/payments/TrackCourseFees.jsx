import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Sparkles,
  Loader2,
  Inbox,
  BookOpen,
  Layers,
  IndianRupee,
  Wallet,
  Landmark,
  ShieldCheck,
  FileCheck,
  UserCheck
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

export default function TrackCourseFees() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/student/track-fees");
      setRows(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
              <Landmark size={24} />
            </div>
            Track Course Fees
          </h1>
          <p className="text-slate-500 mt-3 text-m max-w-2xl leading-relaxed">
            Monitor your financial obligations, track paid amounts, and verify your enrollment and document statuses.
          </p>
        </motion.div>

        {/* CONTENT AREA */}
        <motion.div variants={itemVariants} className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {loading ? (
              <motion.div 
                key="loading-fees"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32 text-slate-500 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                {/* LOADING STATE */}
                <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                <p className="font-medium tracking-wide">Fetching financial records...</p>
              </motion.div>
            ) : rows.length === 0 ? (
              <motion.div 
                key="empty-fees"
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
                  No Fee Records Found
                </h3>
                <p className="mt-2 text-slate-500 font-medium text-center max-w-md">
                  You do not have any course enrollments with active fee tracking at this time.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="fees-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-6"
              >
                {/* FEE TRACKING GRID */}
                {rows.map((row, idx) => {
                  const balance = Number(row.balance_fees) || 0;
                  const isCleared = balance <= 0;

                  return (
                    <motion.div
                      key={row.enrollment_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 relative overflow-hidden group hover:bg-white/90 transition-all duration-300 flex flex-col"
                    >
                      {/* Decorative Background Glows */}
                      <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700 blur-3xl pointer-events-none ${isCleared ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-amber-500 to-orange-500'}`}></div>

                      <div className="relative z-10 flex flex-col h-full gap-8">
                        
                        {/* Top Row: Course & Batch */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl shrink-0 mt-1 shadow-sm">
                              <BookOpen size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-extrabold text-2xl text-slate-800 tracking-tight leading-tight break-words group-hover:text-indigo-900 transition-colors">
                                {row.course_name || "Untitled Course"}
                              </h3>
                              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-xl bg-slate-50/80 border border-slate-200/60 shrink-0">
                                <Layers size={14} className="text-slate-400 shrink-0" />
                                <span className="text-xs font-bold text-slate-600 tracking-wide uppercase break-words">
                                  {row.batch_name || "Unassigned Batch"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Middle Row: Financial Breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <MoneyCard
                            label="Course Fee"
                            value={row.total_fees}
                            icon={Landmark}
                            colorTheme="slate"
                          />
                          <MoneyCard
                            label="Paid Amount"
                            value={row.paid_fees}
                            icon={Wallet}
                            colorTheme="emerald"
                          />
                          <MoneyCard
                            label="Balance Due"
                            value={row.balance_fees}
                            icon={CreditCard}
                            colorTheme={isCleared ? "slate" : "rose"}
                          />
                        </div>

                        {/* Bottom Row: Line-by-Line Statuses */}
                        <div className="flex flex-col bg-slate-50/50 rounded-2xl border border-slate-100/60 mt-auto overflow-hidden shadow-sm">
                          <StatusRow
                            icon={FileCheck}
                            label="Payment Proof"
                            status={row.document_status}
                            isFirst
                          />
                          <StatusRow
                            icon={ShieldCheck}
                            label="Fee Status"
                            status={row.fee_status}
                          />
                          <StatusRow
                            icon={UserCheck}
                            label="Enrollment Status"
                            status={row.enrollment_status}
                            isLast
                          />
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
    </div>
  );
}

// ================= REUSABLE UI COMPONENTS =================

function MoneyCard({ label, value, icon: Icon, colorTheme }) {
  const themes = {
    slate: "text-slate-600 bg-slate-50/80 border-slate-200/60",
    emerald: "text-emerald-600 bg-emerald-50/80 border-emerald-200/60",
    rose: "text-rose-600 bg-rose-50/80 border-rose-200/60"
  };
  
  const textColors = {
    slate: "text-slate-800",
    emerald: "text-emerald-700",
    rose: "text-rose-700"
  };

  const currentTheme = themes[colorTheme] || themes.slate;
  const textColor = textColors[colorTheme] || textColors.slate;

  return (
    <div className={`rounded-2xl border p-4 flex flex-col justify-center relative overflow-hidden shadow-sm ${currentTheme}`}>
      <div className="flex items-center gap-2 mb-2 opacity-80">
        <Icon size={16} />
        <span className="text-[11px] font-bold uppercase tracking-widest break-words">
          {label}
        </span>
      </div>
      <div className={`font-black text-2xl tracking-tight flex items-center gap-0.5 ${textColor}`}>
        <IndianRupee size={18} strokeWidth={3} className="opacity-60" />
        {value}
      </div>
    </div>
  );
}

function StatusRow({ icon: Icon, label, status, isFirst, isLast }) {
  const normalized = String(status).toLowerCase();

  let StatusIcon = Clock;
  let badgeTheme = "bg-amber-50/80 text-amber-700 border-amber-200/60";

  if (["verified", "paid", "active"].includes(normalized)) {
    StatusIcon = CheckCircle2;
    badgeTheme = "bg-emerald-50/80 text-emerald-700 border-emerald-200/60";
  } else if (["rejected", "cancelled"].includes(normalized)) {
    StatusIcon = XCircle;
    badgeTheme = "bg-rose-50/80 text-rose-700 border-rose-200/60";
  }

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 hover:bg-white/60 transition-colors ${
        !isLast ? "border-b border-slate-100/60" : ""
      }`}
    >
      <div className="flex items-center gap-2 shrink-0">
        <Icon size={16} className="text-indigo-400 shrink-0" />
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest break-words">
          {label}
        </span>
      </div>
      <div className="flex justify-start sm:justify-end">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border shadow-sm ${badgeTheme}`}>
          <StatusIcon size={14} />
          {status || "Pending"}
        </span>
      </div>
    </div>
  );
}