import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import { 
  ReceiptIndianRupee, 
  ChevronDown, 
  ChevronUp, 
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
        case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'partial': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'unpaid': return 'bg-rose-50 text-rose-700 border-rose-200';
        default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <ReceiptIndianRupee className="text-indigo-600" size={32} />
            Student Fee Management
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Track student tuition balances, update partial payments, and manage full clearances across all batches.
          </p>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Course</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fees</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Paid Amount</th>
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
                    <span className="font-medium">Loading students fees...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium text-slate-600">No records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((s) => (
                <React.Fragment key={s.id}>
                  <tr 
                    className={`cursor-pointer transition-colors ${expandedId === s.id ? "bg-indigo-50/30" : "hover:bg-slate-50"}`}
                    onClick={() => handleExpand(s)}
                  >
                    <td className="px-6 py-5 text-sm font-bold text-indigo-600 uppercase tracking-tight">#{s.sid}</td>
                    <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                            <User size={14} className="text-slate-400" /> {s.name}
                        </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-medium">
                        <div className="flex items-center gap-2">
                            <BookOpen size={14} className="text-slate-400" /> {s.course}
                        </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-800">₹{s.total_fees}</td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-medium">₹{s.paid_fees}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className={`p-1.5 rounded-full inline-block transition-transform duration-200 ${expandedId === s.id ? 'rotate-180 bg-indigo-100 text-indigo-600' : 'text-slate-300'}`}>
                        <ChevronDown size={18} />
                      </div>
                    </td>
                  </tr>

                  {/* EXPANDED SECTION */}
                  {expandedId === s.id && (
                    <tr className="bg-indigo-50/30 animate-in fade-in duration-200">
                      <td colSpan="7" className="px-6 py-6 border-b border-slate-100">
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Update Paid Amount</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                        <input
                                            type="number"
                                            value={editAmount}
                                            onChange={(e) => setEditAmount(e.target.value)}
                                            className="bg-white border border-slate-300 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-44 transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirm({ type: 'update', id: s.id, name: s.name, amount: editAmount });
                                        }}
                                        disabled={editAmount === ""}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all shadow-sm active:scale-95 ${
                                            editAmount !== "" 
                                            ? "bg-white border-slate-200 text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50" 
                                            : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                                        }`}
                                    >
                                        <Save size={16} /> Save Amount
                                    </button>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-slate-200 mx-2 hidden md:block"></div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Quick Action</label>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirm({ type: 'full', id: s.id, name: s.name, amount: s.total_fees });
                                    }}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
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
          <div className="space-y-2">
            <span className="block text-slate-600">
                Are you sure you want to update the payment for <span className="font-bold text-slate-900">"{confirm?.name}"</span>?
            </span>
            <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                <Wallet size={16} className="text-indigo-600" />
                <span className="text-sm font-bold text-indigo-700">New Paid Amount: ₹{confirm?.amount}</span>
            </div>
          </div>
        }
        onConfirm={() => executeUpdate(confirm.id, confirm.amount)}
        onClose={() => setConfirm(null)}
      />

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