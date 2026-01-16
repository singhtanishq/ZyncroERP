import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import AppModal from "../../../components/common/AppModal";
import { 
  Banknote, 
  ChevronDown, 
  CheckCircle2, 
  Inbox, 
  Save, 
  Calendar,
  History,
  User,
  Wallet,
  Clock
} from "lucide-react";

// --- HISTORY MODAL COMPONENT ---
function PaymentHistoryModal({ data, onClose, name }) {
  return (
    <AppModal
      open={!!data}
      onClose={onClose}
      title="Payment History"
      size="md"
      footer={
        <button 
          type="button" 
          onClick={onClose} 
          className="px-6 py-2.5 rounded-xl bg-brand-teal-500 text-white text-sm font-semibold hover:bg-brand-teal-600 transition-all active:scale-95 shadow-lg shadow-brand-teal-500/25"
        >
          Close
        </button>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2 uppercase tracking-wide">
          {name}
        </p>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 custom-dashboard-scroll pr-1">
          {data.length === 0 ? (
            <div className="text-center py-10">
                <Clock className="mx-auto text-[rgb(var(--zx-text-muted))] opacity-40 mb-2" size={32} />
                <p className="text-sm text-[rgb(var(--zx-text-muted))] font-medium">No prior records found</p>
            </div>
          ) : (
            data.map((h, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-[rgb(var(--zx-surface-hover))]/50 rounded-2xl border border-[rgb(var(--zx-border))] transition-hover">
                <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-brand-teal-500" />
                    <span className="text-sm font-bold text-[rgb(var(--zx-text))]">{h.month}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md border ${
                    h.status === "paid" 
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                }`}>
                  {h.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </AppModal>
  );
}

// --- MAIN MANAGEMENT COMPONENT ---
export default function FacultyPayouts() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editingSalary, setEditingSalary] = useState(null);
  const [salaryValue, setSalaryValue] = useState("");

  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/faculty-payouts?month=${selectedMonth}`);
      setData(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedMonth]);

  const handleExpand = (f) => {
    if (expandedId === f.id) {
        setExpandedId(null);
        setEditingSalary(null);
    } else {
        setExpandedId(f.id);
        setEditingSalary(null);
    }
  };

  const executeSalaryUpdate = async () => {
    await api.post(`/faculty-payouts/${confirm.id}/salary`, { salary: salaryValue });
    showToast("Base salary updated successfully");
    setConfirm(null);
    setEditingSalary(null);
    load();
  };

  const executeMarkPaid = async () => {
    await api.post(`/faculty-payouts/${confirm.id}/pay`, { month: selectedMonth });
    showToast(`Payout completed for ${selectedMonth}`);
    setConfirm(null);
    load();
  };

  const openHistory = async (f) => {
    const res = await api.get(`/faculty-payouts/${f.id}/history`);
    setHistory(res.data);
    setExpandedId(f.id);
    setShowHistory(f.name);
  };

  const getStatusColor = (status) => {
    return status === "paid" 
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
      : "bg-rose-500/10 text-rose-500 border-rose-500/20";
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
            <Banknote size={14} strokeWidth={2.5} />
            Financial Operations
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Faculty Payouts
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Disburse monthly compensation, update base salaries, and audit the complete payment history for academic staff.
          </p>
        </div>

        <div className="flex items-center bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] p-1.5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 px-4 py-2">
                <Calendar size={16} className="text-brand-teal-500" />
                <span className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest mr-1">Billing Month:</span>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] rounded-xl px-3 py-1.5 text-sm font-bold text-[rgb(var(--zx-text))] focus:outline-none focus:border-brand-teal-500 cursor-pointer transition-colors shadow-sm"
                />
            </div>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] relative z-10">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))]">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">FID</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Faculty Name</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Salary</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Month</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Joining Date</th>
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
                    <span className="font-medium text-sm">Loading faculty payouts...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-20 text-center text-[rgb(var(--zx-text-muted))]">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No records for this month</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((f) => (
                <React.Fragment key={f.id}>
                  <tr 
                    className={`cursor-pointer transition-colors ${expandedId === f.id ? "bg-brand-teal-500/5" : "hover:bg-[rgb(var(--zx-surface-hover))]"}`}
                    onClick={() => handleExpand(f)}
                  >
                    <td className="px-6 py-5 text-sm font-bold text-brand-teal-500 font-mono">#{f.code}</td>
                    <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-bold text-[rgb(var(--zx-text))] text-sm">
                            <User size={14} className="text-[rgb(var(--zx-text-muted))]" /> {f.name}
                        </div>
                    </td>
                    <td className="px-6 py-5">
                        {editingSalary === f.id ? (
                            <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
                                <span className="text-[rgb(var(--zx-text-muted))] font-bold">₹</span>
                                <input
                                    type="number"
                                    value={salaryValue}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setSalaryValue(e.target.value)}
                                    className="bg-[rgb(var(--zx-surface))] border border-brand-teal-500 rounded-xl px-3 py-1.5 text-sm font-bold text-[rgb(var(--zx-text))] focus:outline-none w-28 shadow-sm"
                                />
                            </div>
                        ) : (
                            <span className="text-sm font-bold text-[rgb(var(--zx-text))]">₹{f.salary || 0}</span>
                        )}
                    </td>
                    <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))] font-semibold">{selectedMonth}</td>
                    <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))] font-medium">{f.join_date}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(f.status)}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className={`p-2 rounded-xl inline-flex transition-transform duration-200 ${expandedId === f.id ? 'rotate-180 bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20' : 'text-[rgb(var(--zx-text-muted))]'}`}>
                        <ChevronDown size={18} />
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED SECTION */}
                  {expandedId === f.id && (
                    <tr className="bg-[rgb(var(--zx-surface-hover))]/50 animate-in fade-in duration-200">
                      <td colSpan="7" className="px-6 py-6 border-b border-[rgb(var(--zx-border))]">
                        <div className="flex flex-wrap items-center gap-4">
                            
                            {editingSalary === f.id ? (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirm({ type: 'salary', id: f.id, name: f.name });
                                    }}
                                    disabled={salaryValue === ""}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95 ${
                                        salaryValue !== "" 
                                        ? "bg-brand-teal-500 text-white border-transparent hover:bg-brand-teal-600 shadow-brand-teal-500/20" 
                                        : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
                                    }`}
                                >
                                    <Save size={16} /> Save Base Salary
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSalary(f.id);
                                        setSalaryValue(f.salary || "");
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-xs font-bold uppercase tracking-wider hover:border-brand-teal-500 hover:text-brand-teal-500 transition-all shadow-sm active:scale-95"
                                >
                                    <Wallet size={16} /> Update Base Salary
                                </button>
                            )}

                            <div className="w-px h-8 bg-[rgb(var(--zx-border))] mx-2 hidden md:block"></div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirm({ type: 'pay', id: f.id, name: f.name, amount: f.salary });
                                }}
                                disabled={f.status === "paid"}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 ${
                                    f.status === "paid" 
                                    ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none" 
                                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                                }`}
                            >
                                <CheckCircle2 size={16} /> {f.status === "paid" ? "Payment Completed" : `Mark Paid (₹${f.salary})`}
                            </button>

                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openHistory(f); }}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-xs font-bold uppercase tracking-wider hover:border-brand-blue-500 hover:text-brand-blue-500 transition-all shadow-sm active:scale-95 ml-auto"
                            >
                                <History size={16} /> View Audit Trail
                            </button>
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
        title={confirm?.type === 'pay' ? "Process Payout" : "Update Base Salary"}
        message={
          <div className="space-y-3">
            <span className="block text-[rgb(var(--zx-text-muted))] font-medium">
                Are you sure you want to {confirm?.type === 'pay' ? 'process the monthly payment' : 'update the base salary'} for <span className="font-bold text-[rgb(var(--zx-text))]">"{confirm?.name}"</span>?
            </span>
            <div className="p-4 bg-brand-teal-500/10 border border-brand-teal-500/20 rounded-2xl flex items-center gap-3">
                <Banknote size={18} className="text-brand-teal-500" />
                <span className="text-sm font-bold text-brand-teal-500">Amount: ₹{confirm?.type === 'pay' ? confirm.amount : salaryValue}</span>
            </div>
          </div>
        }
        onConfirm={confirm?.type === 'pay' ? executeMarkPaid : executeSalaryUpdate}
        onClose={() => setConfirm(null)}
      />

      {/* HISTORY MODAL */}
      {showHistory && (
        <PaymentHistoryModal 
            data={history} 
            name={showHistory} 
            onClose={() => setShowHistory(false)} 
        />
      )}

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