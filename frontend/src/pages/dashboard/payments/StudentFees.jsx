import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import { 
  ReceiptIndianRupee, 
  ChevronDown, 
  CheckCircle2, 
  Inbox, 
  Save, 
  Check,
  User,
  BookOpen,
  Wallet
} from "lucide-react";

export default function StudentFees() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/student-fees");
      setData(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleExpand = (s) => {
    if (expandedId === s.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(s.id);
    setEditAmount(s.paid_fees);
  };

  const executeUpdate = async (id, amount) => {
    try {
        await api.post(`/student-fees/${id}`, {
            paid_fees: amount,
        });
        showToast("Payment records updated");
        setConfirm(null);
        setExpandedId(null);
        load();
    } catch (e) {
        showToast("Failed to update fees");
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
        case 'paid': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
        case 'partial': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        case 'unpaid': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        default: return 'bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border-[rgb(var(--zx-border))]';
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 space-y-8 animate-fade-in font-sans">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
            <ReceiptIndianRupee size={14} strokeWidth={2.5} />
            Financial Operations
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Student Fee Management
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Track student tuition balances, update partial payments, and manage full clearances across all batches.
          </p>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] relative z-10">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))]">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Student ID</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Course</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Total Fees</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Paid Amount</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--zx-border))]">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
                    <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
                    <span className="font-medium text-sm">Loading students fees...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-20 text-center text-[rgb(var(--zx-text-muted))]">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((s) => (
                <React.Fragment key={s.id}>
                  <tr 
                    className={`cursor-pointer transition-colors ${expandedId === s.id ? "bg-brand-teal-500/5" : "hover:bg-[rgb(var(--zx-surface-hover))]"}`}
                    onClick={() => handleExpand(s)}
                  >
                    <td className="px-6 py-5 text-sm font-bold text-brand-teal-500 uppercase tracking-tight">#{s.sid}</td>
                    <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-bold text-[rgb(var(--zx-text))] text-sm">
                            <User size={14} className="text-[rgb(var(--zx-text-muted))]" /> {s.name}
                        </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))] font-medium">
                        <div className="flex items-center gap-2">
                            <BookOpen size={14} className="text-[rgb(var(--zx-text-muted))]" /> {s.course}
                        </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-[rgb(var(--zx-text))]">₹{s.total_fees}</td>
                    <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))] font-medium">₹{s.paid_fees}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className={`p-2 rounded-xl inline-flex transition-transform duration-200 ${expandedId === s.id ? 'rotate-180 bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20' : 'text-[rgb(var(--zx-text-muted))]'}`}>
                        <ChevronDown size={18} />
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED SECTION */}
                  {expandedId === s.id && (
                    <tr className="bg-[rgb(var(--zx-surface-hover))]/50 animate-in fade-in duration-200">
                      <td colSpan="7" className="px-6 py-6 border-b border-[rgb(var(--zx-border))]">
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Update Paid Amount</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--zx-text-muted))] font-bold text-sm">₹</span>
                                        <input
                                            type="number"
                                            value={editAmount}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setEditAmount(e.target.value)}
                                            className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl pl-8 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-teal-500 w-44 transition-all shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirm({ type: 'update', id: s.id, name: s.name, amount: editAmount });
                                        }}
                                        disabled={editAmount === ""}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 ${
                                            editAmount !== "" 
                                            ? "bg-[rgb(var(--zx-surface))] border-[rgb(var(--zx-border))] text-brand-teal-500 hover:border-brand-teal-500 shadow-sm" 
                                            : "bg-[rgb(var(--zx-surface-hover))] border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] cursor-not-allowed shadow-none"
                                        }`}
                                    >
                                        <Save size={16} /> Save Amount
                                    </button>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-[rgb(var(--zx-border))] mx-2 hidden md:block"></div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Quick Action</label>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirm({ type: 'full', id: s.id, name: s.name, amount: s.total_fees });
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-teal-500 text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-teal-600 transition-all shadow-lg shadow-brand-teal-500/20 active:scale-95"
                                >
                                    <Check size={16} /> Mark Fully Paid (₹{s.total_fees})
                                </button>
                            </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.type === 'full' ? "Clear All Dues" : "Update Fee Record"}
        message={
          <div className="space-y-3">
            <span className="block text-[rgb(var(--zx-text-muted))] font-medium">
                Are you sure you want to update the payment for <span className="font-bold text-[rgb(var(--zx-text))]">"{confirm?.name}"</span>?
            </span>
            <div className="p-4 bg-brand-teal-500/10 border border-brand-teal-500/20 rounded-2xl flex items-center gap-3">
                <Wallet size={18} className="text-brand-teal-500" />
                <span className="text-sm font-bold text-brand-teal-500">New Paid Amount: ₹{confirm?.amount}</span>
            </div>
          </div>
        }
        onConfirm={() => executeUpdate(confirm.id, confirm.amount)}
        onClose={() => setConfirm(null)}
      />

      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[rgb(var(--zx-border))] backdrop-blur-xl">
            <div className="bg-emerald-500/20 text-emerald-500 rounded-full p-1 border border-emerald-500/30">
              <CheckCircle2 size={14} strokeWidth={3} />
            </div>
            <span className="text-sm font-bold tracking-wide">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}