import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../lib/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  UploadCloud,
  BookOpen,
  GraduationCap,
  Sparkles,
  Loader2,
  Inbox,
  CheckCircle2,
  Clock,
  Layers,
  Wallet,
  ShieldCheck,
  AlertCircle
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

export default function MakePayment() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const res = await api.get("/student/payments/enrollments");
      setEnrollments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const isPaid = (status) => String(status).toLowerCase() === "paid";

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
              <CreditCard size={24} />
            </div>
            Fee Payments
          </h1>
          <p className="text-slate-500 mt-3 text-m max-w-2xl leading-relaxed">
            Review your course enrollments and payment status, then submit your payment proof for verification by the administration.
          </p>
        </motion.div>

        {/* CONTENT AREA */}
        <motion.div variants={itemVariants} className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {loading ? (
              <motion.div 
                key="loading-payments"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32 text-slate-500 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                {/* LOADING STATE */}
                <Loader2 size={40} className="animate-spin text-emerald-500 mb-4" />
                <p className="font-medium tracking-wide">Fetching payment records...</p>
              </motion.div>
            ) : enrollments.length === 0 ? (
              <motion.div 
                key="empty-payments"
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
                  No Records Found
                </h3>
                <p className="mt-2 text-slate-500 font-medium text-center max-w-md">
                  You currently do not have any enrollments requiring payment tracking.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="payments-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-6"
              >
                {/* PAYMENTS GRID */}
                {enrollments.map((item, idx) => {
                  const paid = isPaid(item.payment_status);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 relative overflow-hidden group hover:bg-white/90 transition-all duration-300 flex flex-col"
                    >
                      {/* Decorative Background Glows */}
                      <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700 blur-3xl pointer-events-none ${paid ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-amber-500 to-orange-500'}`}></div>

                      <div className="relative z-10 flex flex-col h-full gap-6">
                        
                        {/* Top Row: Title & Badge */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className={`p-3 rounded-2xl shrink-0 mt-1 border shadow-sm transition-colors duration-300 ${paid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                              <Wallet size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="mb-3">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${paid ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60' : 'bg-amber-50/80 text-amber-700 border-amber-200/60'}`}>
                                  {paid ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                  {paid ? "Payment Settled" : "Payment Pending"}
                                </span>
                              </div>
                              <h3 className="font-extrabold text-2xl text-slate-800 tracking-tight leading-tight break-words">
                                {item.course_name || "Untitled Course"}
                              </h3>
                            </div>
                          </div>
                        </div>

                        {/* Line-by-Line List Container */}
                        <div className="flex flex-col bg-slate-50/50 rounded-2xl border border-slate-100/60 mt-auto overflow-hidden shadow-sm">
                          
                          <InfoRow
                            icon={Layers}
                            label="Cohort Batch"
                            value={item.batch_name}
                          />
                          
                          <InfoRow
                            icon={GraduationCap}
                            label="Enrollment Status"
                            value={<span className="capitalize">{item.enrollment_status}</span>}
                          />

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:p-5 hover:bg-white/60 transition-colors">
                            <div className="flex items-center gap-2 shrink-0">
                              <ShieldCheck size={16} className="text-indigo-400 shrink-0" />
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest break-words">
                                Payment Status
                              </span>
                            </div>
                            <div className="text-sm font-bold text-slate-800 text-left sm:text-right leading-snug break-words">
                               {paid ? (
                                 <span className="text-emerald-600 font-black uppercase tracking-wider text-sm">Completed</span>
                               ) : (
                                 <span className="text-amber-600 font-bold uppercase tracking-wider text-sm">Due</span>
                               )}
                            </div>
                          </div>

                        </div>

                        {/* Action CTA */}
                        <div className="mt-2 pt-6 border-t border-slate-100/60">
                          {paid ? (
                            <button
                              disabled
                              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all bg-slate-100/80 border border-slate-200/60 text-slate-400 cursor-not-allowed text-sm md:text-base"
                            >
                              <CheckCircle2 size={18} />
                              Payment Successfully Completed
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate("/student/payments/upload-payment-proof", { state: { enrollmentId: item.id } })}
                              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98] bg-brand-teal-500 text-white hover:bg-brand-teal-600 hover:shadow text-sm md:text-base"
                            >
                              <UploadCloud size={18} />
                              Submit Payment Proof
                            </button>
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