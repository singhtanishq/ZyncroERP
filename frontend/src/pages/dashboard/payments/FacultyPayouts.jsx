import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import { 
  Banknote, 
  ChevronDown, 
  CheckCircle2, 
  Inbox, 
  Save, 
  Calendar,
  History,
  User,
  Hash,
  Wallet,
  X,
  Clock,
  ArrowRight
} from "lucide-react";

// --- HISTORY MODAL COMPONENT ---
function PaymentHistoryModal({ data, onClose, name }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Payment History</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {data.length === 0 ? (
            <div className="text-center py-10">
                <Clock className="mx-auto text-slate-200 mb-2" size={32} />
                <p className="text-sm text-slate-400 font-medium">No prior records found</p>
            </div>
          ) : (
            data.map((h, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 transition-hover hover:border-slate-200">
                <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">{h.month}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border ${
                    h.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                }`}>
                  {h.status}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95">
            Close
          </button>
        </div>
      </div>
    </div>
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
    setExpandedId(f.id); // Maintain expansion context
    setShowHistory(f.name); // Pass name for modal header
  };

  const getStatusColor = (status) => {
    return status === "paid" 
      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
      : "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Banknote className="text-indigo-600" size={32} />
            Faculty Payouts
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Disburse monthly compensation, update base salaries, and audit the complete payment history for academic staff.
          </p>
        </div>

        <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 px-4 py-2">
                <Calendar size={16} className="text-indigo-500" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">Billing Month:</span>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-slate-50 border-none rounded-lg px-3 py-1 text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer hover:bg-slate-100 transition-colors"
                />
            </div>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">FID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Faculty Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Salary</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Month</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Joining Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="font-medium">Loading faculty payouts...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium text-slate-600">No records for this month</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((f) => (
                <React.Fragment key={f.id}>
                  <tr 
                    className={`cursor-pointer transition-colors ${expandedId === f.id ? "bg-indigo-50/30" : "hover:bg-slate-50"}`}
                    onClick={() => handleExpand(f)}
                  >
                    <td className="px-6 py-5 text-sm font-bold text-indigo-600 font-mono">#{f.code}</td>
                    <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                            <User size={14} className="text-slate-400" /> {f.name}
                        </div>
                    </td>
                    <td className="px-6 py-5">
                        {editingSalary === f.id ? (
                            <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
                                <span className="text-slate-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    value={salaryValue}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setSalaryValue(e.target.value)}
                                    className="bg-white border border-indigo-200 rounded-lg px-2 py-1 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-24 shadow-sm"
                                />
                            </div>
                        ) : (
                            <span className="text-sm font-bold text-slate-700">₹{f.salary || 0}</span>
                        )}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-500 font-medium">{selectedMonth}</td>
                    <td className="px-6 py-5 text-sm text-slate-500">{f.join_date}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(f.status)}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className={`p-1.5 rounded-full inline-block transition-transform duration-200 ${expandedId === f.id ? 'rotate-180 bg-indigo-100 text-indigo-600' : 'text-slate-300'}`}>
                        <ChevronDown size={18} />
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED SECTION */}
                  {expandedId === f.id && (
                    <tr className="bg-indigo-50/30 animate-in fade-in duration-200">
                      <td colSpan="7" className="px-6 py-6 border-b border-slate-100">
                        <div className="flex flex-wrap items-center gap-4">
                            
                            {editingSalary === f.id ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirm({ type: 'salary', id: f.id, name: f.name });
                                    }}
                                    disabled={salaryValue === ""}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold shadow-md transition-all active:scale-95 ${
                                        salaryValue !== "" 
                                        ? "bg-indigo-600 text-white border-transparent hover:bg-indigo-700" 
                                        : "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                                    }`}
                                >
                                    <Save size={16} /> Save Base Salary
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSalary(f.id);
                                        setSalaryValue(f.salary || "");
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                                >
                                    <Wallet size={16} /> Update Base Salary
                                </button>
                            )}

                            <div className="w-px h-8 bg-slate-200 mx-2 hidden md:block"></div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirm({ type: 'pay', id: f.id, name: f.name, amount: f.salary });
                                }}
                                disabled={f.status === "paid"}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                                    f.status === "paid" 
                                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none" 
                                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100"
                                }`}
                            >
                                <CheckCircle2 size={16} /> {f.status === "paid" ? "Payment Completed" : `Mark Paid (₹${f.salary})`}
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); openHistory(f); }}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-900 transition-all shadow-md active:scale-95 ml-auto"
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
            <span className="block text-slate-600">
                Are you sure you want to {confirm?.type === 'pay' ? 'process the monthly payment' : 'update the base salary'} for <span className="font-bold text-slate-900">"{confirm?.name}"</span>?
            </span>
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                <Banknote size={18} className="text-indigo-600" />
                <span className="text-sm font-bold text-indigo-700">Amount: ₹{confirm?.type === 'pay' ? confirm.amount : salaryValue}</span>
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
          <div className="bg-slate-900 text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50">
            <div className="bg-emerald-500 rounded-full p-1">
              <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-sm font-medium tracking-wide">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}