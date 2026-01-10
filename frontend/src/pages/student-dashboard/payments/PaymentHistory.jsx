import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Search,
  X,
  Inbox,
  User,
  Mail,
  Phone,
  CalendarClock,
  IndianRupee,
  Sparkles,
  Loader2,
  Hash,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt
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

function PaymentModal({ payment, onClose }) {
  if (!payment) return null;

  const isSuccess = payment.status === "SUCCESS";
  const isFailed = payment.status === "FAILED";

  return (
    <AnimatePresence>
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
                <Receipt size={20} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  Transaction Details
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

          {/* MODAL BODY */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto overscroll-contain space-y-6">
            
            {/* AMOUNT & STATUS CARD */}
            <div className="bg-white rounded-2xl border border-slate-100/60 p-6 shadow-sm relative overflow-hidden group">
              <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-5 pointer-events-none transition-transform duration-700 group-hover:scale-150 blur-3xl ${isSuccess ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : isFailed ? 'bg-gradient-to-br from-rose-500 to-pink-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Total Amount
                  </p>
                  <h3 className="font-black text-4xl md:text-5xl text-slate-800 tracking-tighter flex items-center gap-1">
                    <IndianRupee size={36} className="text-slate-400" />
                    {payment.amount}
                  </h3>
                </div>

                <div className="shrink-0">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest border shadow-sm ${
                    isSuccess ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                    isFailed ? 'bg-rose-50 text-rose-700 border-rose-200/60' :
                    'bg-amber-50 text-amber-700 border-amber-200/60'
                  }`}>
                    {isSuccess ? <CheckCircle2 size={18} /> : isFailed ? <XCircle size={18} /> : <Clock size={18} />}
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>

            {/* LINE-BY-LINE COMPACT DETAILS */}
            <div className="bg-slate-50/50 border border-slate-100/60 rounded-2xl flex flex-col overflow-hidden">
              <InfoRow
                icon={Hash}
                label="Transaction ID"
                value={`#${payment.id}`}
              />
              <InfoRow
                icon={User}
                label="Payer Name"
                value={payment.name}
              />
              <InfoRow
                icon={Mail}
                label="Email Address"
                value={payment.email}
              />
              <InfoRow
                icon={Phone}
                label="Mobile Number"
                value={payment.mobile}
              />
              <InfoRow
                icon={CalendarClock}
                label="Transaction Date"
                value={
                  payment.created_at
                    ? new Date(payment.created_at).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"
                }
                isLast
              />
            </div>

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

export default function StudentPaymentHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/student/payment-history");
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

  const filteredRows = rows.filter((row) => {
    const term = search.toLowerCase();
    return (
      row.name?.toLowerCase().includes(term) ||
      row.email?.toLowerCase().includes(term) ||
      row.mobile?.includes(term)
    );
  });

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
              <History size={24} />
            </div>
            Payment History
          </h1>
          <p className="text-slate-500 mt-3 text-m max-w-2xl leading-relaxed">
            View and search all payment transactions and official receipts associated with your student account.
          </p>
        </motion.div>

        {/* CONTROLS & FILTERS */}
        <motion.div variants={itemVariants} className="relative group max-w-xl z-20">
          <Search
            size={20}
            className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300 z-10"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or mobile..."
            className="w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all duration-300 placeholder:text-slate-400 text-slate-700 font-medium"
          />
        </motion.div>

        {/* CONTENT AREA */}
        <motion.div variants={itemVariants} className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {loading ? (
              <motion.div 
                key="loading-history"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32 text-slate-500 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                {/* LOADING STATE */}
                <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                <p className="font-medium tracking-wide">Fetching transactions...</p>
              </motion.div>
            ) : filteredRows.length === 0 ? (
              <motion.div 
                key="empty-history"
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
                  No Transactions Found
                </h3>
                <p className="mt-2 text-slate-500 font-medium text-center max-w-md">
                  {search ? "No payments match your search criteria. Try a different term." : "You do not have any payment history on record yet."}
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="history-table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500 mt-4"
              >
                {/* LEDGER TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 text-xs uppercase tracking-wider font-bold">
                        <th className="p-5 pl-6">Transaction ID</th>
                        <th className="p-5">Payer Details</th>
                        <th className="p-5">Amount</th>
                        <th className="p-5">Status</th>
                        <th className="p-5 pr-6 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50">
                      {filteredRows.map((payment) => {
                        const isSuccess = payment.status === "SUCCESS";
                        const isFailed = payment.status === "FAILED";

                        return (
                          <tr
                            key={payment.id}
                            onClick={() => setSelected(payment)}
                            className="group hover:bg-white/90 transition-all duration-300 cursor-pointer"
                          >
                            <td className="p-5 pl-6">
                              <span className="inline-flex items-center gap-1.5 font-mono text-indigo-600 text-sm font-black bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 group-hover:bg-white transition-colors duration-300">
                                <Hash size={14} /> {payment.id}
                              </span>
                            </td>

                            <td className="p-5">
                              <div className="flex flex-col gap-1">
                                <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-900 transition-colors duration-300">
                                  {payment.name}
                                </div>
                                <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                  <Mail size={12} className="text-slate-400" />
                                  {payment.email}
                                </div>
                              </div>
                            </td>

                            <td className="p-5">
                              <div className="font-black text-slate-800 text-base flex items-center gap-0.5">
                                <IndianRupee size={16} className="text-slate-500" />
                                {payment.amount}
                              </div>
                            </td>

                            <td className="p-5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                isSuccess ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60' :
                                isFailed ? 'bg-rose-50/80 text-rose-700 border-rose-200/60' :
                                'bg-amber-50/80 text-amber-700 border-amber-200/60'
                              }`}>
                                {isSuccess ? <CheckCircle2 size={14} /> : isFailed ? <XCircle size={14} /> : <Clock size={14} />}
                                {payment.status}
                              </span>
                            </td>

                            <td className="p-5 pr-6 text-right">
                              <span className="text-sm font-medium text-slate-600 flex items-center justify-end gap-1.5">
                                <CalendarClock size={14} className="text-slate-400" />
                                {new Date(payment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* MODAL OVERLAY */}
      {selected && (
        <div className="relative z-[100]">
          <PaymentModal
            payment={selected}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
}