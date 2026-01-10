import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import { 
  Wallet, 
  ChevronDown, 
  CheckCircle2, 
  Inbox, 
  Save, 
  Percent,
  User,
  Store,
  TrendingUp,
  X,
  Check
} from "lucide-react";

export default function FranchisePayments() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commission, setCommission] = useState("");
  const [editingCommission, setEditingCommission] = useState(false);

  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({ total: "", paid: "" });
  
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/franchise-payments");
      setData(res.data.data);
      setCommission(res.data.commission);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveCommission = async () => {
    await api.post("/franchise-commission", { commission });
    setEditingCommission(false);
    showToast("Commission percentage updated");
    load();
  };

  const handleExpand = (f) => {
    if (expandedId === f.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(f.id);
    setForm({
      total: f.total_revenue,
      paid: f.paid_amount,
    });
  };

  const executeUpdate = async () => {
    try {
        await api.post(`/franchise-payments/${confirm.id}`, {
            total_amount: form.total,
            paid_amount: form.paid,
        });
        showToast("Payment records updated");
        setConfirm(null);
        setExpandedId(null);
        load();
    } catch (e) {
        showToast("Failed to update records");
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
        case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'partial': return 'bg-amber-50 text-amber-700 border-amber-200';
        default: return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Wallet className="text-indigo-600" size={32} />
            Franchise Payments
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Monitor branch revenue streams, manage commission settlements, and track outstanding dues across the network.
          </p>
        </div>

        <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
          {editingCommission ? (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
              <div className="relative">
                <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-28 transition-all"
                />
              </div>
              <button
                onClick={saveCommission}
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => setEditingCommission(false)}
                className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingCommission(true)}
              className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Percent size={14} />
              </div>
              Commission: {commission}%
            </button>
          )}
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Branch Code</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Branch Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount Due</th>
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
                    <span className="font-medium">Loading franchise payments...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium text-slate-600">No payment records</p>
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
                    <td className="px-6 py-5 text-sm font-bold text-indigo-600 uppercase tracking-tight font-mono">#{f.code}</td>
                    <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                            <Store size={14} className="text-slate-400" /> {f.name}
                        </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-medium">
                        <div className="flex items-center gap-2">
                            <User size={14} className="text-slate-400" /> {f.owner}
                        </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-800">₹{f.total_revenue}</td>
                    <td className="px-6 py-5 text-sm font-bold text-rose-600">₹{f.amount_due}</td>
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
                        <div className="flex flex-wrap items-end gap-6">
                            
                            {/* Total Revenue Field */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Total Branch Revenue</label>
                                <div className="relative">
                                    <TrendingUp size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="number"
                                        value={form.total}
                                        onChange={(e) => setForm({ ...form, total: e.target.value })}
                                        className="bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-48 transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Paid Amount Field */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount Settled (Paid)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                    <input
                                        type="number"
                                        value={form.paid}
                                        onChange={(e) => setForm({ ...form, paid: e.target.value })}
                                        className="bg-white border border-slate-300 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-48 transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirm({ id: f.id, name: f.name });
                                }}
                                disabled={form.total === "" || form.paid === ""}
                                className={`flex items-center gap-2 px-8 py-2.5 rounded-xl border text-sm font-bold transition-all shadow-sm active:scale-95 ${
                                    (form.total !== "" && form.paid !== "") 
                                    ? "bg-indigo-600 text-white border-transparent hover:bg-indigo-700 shadow-indigo-100" 
                                    : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                                }`}
                            >
                                <Save size={16} /> Save Changes
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
        title="Update Branch Settlement"
        message={
          <div className="space-y-3">
            <span className="block text-slate-600">
                Are you sure you want to update the financial records for <span className="font-bold text-slate-900">"{confirm?.name}"</span>?
            </span>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Amount Due
                  </p>
                  <p className="text-sm font-bold text-rose-600">
                    ₹{( (Number(form.total) * Number(commission)) / 100 - Number(form.paid) ).toFixed(2)}
                  </p>
              </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paid Amount</p>
                    <p className="text-sm font-bold text-slate-700">₹{form.paid}</p>
                </div>
            </div>
          </div>
        }
        onConfirm={executeUpdate}
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