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
        case 'paid': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
        case 'partial': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        default: return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
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
            <Wallet size={14} strokeWidth={2.5} />
            Financial Operations
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Franchise Payments
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Monitor branch revenue streams, manage commission settlements, and track outstanding dues across the network.
          </p>
        </div>

        <div className="flex items-center bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] p-1.5 rounded-2xl shadow-sm">
          {editingCommission ? (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
              <div className="relative">
                <Percent size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--zx-text-muted))]" />
                <input
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl pl-9 pr-3 py-2 text-sm font-bold focus:outline-none focus:border-brand-teal-500 w-28 transition-all shadow-sm"
                />
              </div>
              <button
                type="button"
                onClick={saveCommission}
                className="p-2 bg-brand-teal-500 text-white rounded-xl hover:bg-brand-teal-600 transition-colors shadow-sm"
              >
                <Check size={18} />
              </button>
              <button
                type="button"
                onClick={() => setEditingCommission(false)}
                className="p-2 bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] rounded-xl hover:bg-[rgb(var(--zx-surface))] hover:text-[rgb(var(--zx-text))] transition-colors border border-[rgb(var(--zx-border))]"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingCommission(true)}
              className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface-hover))] rounded-xl transition-all"
            >
              <div className="p-1.5 bg-brand-teal-500/10 text-brand-teal-500 rounded-lg border border-brand-teal-500/20">
                <Percent size={14} />
              </div>
              Commission: {commission}%
            </button>
          )}
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] relative z-10">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))]">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Branch Code</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Branch Name</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Owner</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Total Revenue</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Amount Due</th>
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
                    <span className="font-medium text-sm">Loading franchise payments...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-20 text-center text-[rgb(var(--zx-text-muted))]">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No payment records</p>
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
                    <td className="px-6 py-5 text-sm font-bold text-brand-teal-500 uppercase tracking-tight font-mono">#{f.code}</td>
                    <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-bold text-[rgb(var(--zx-text))] text-sm">
                            <Store size={14} className="text-[rgb(var(--zx-text-muted))]" /> {f.name}
                        </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))] font-medium">
                        <div className="flex items-center gap-2">
                            <User size={14} className="text-[rgb(var(--zx-text-muted))]" /> {f.owner}
                        </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-[rgb(var(--zx-text))]">₹{f.total_revenue}</td>
                    <td className="px-6 py-5 text-sm font-bold text-rose-500">₹{f.amount_due}</td>
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
                        <div className="flex flex-wrap items-end gap-6">
                            
                            {/* Total Revenue Field */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Total Branch Revenue</label>
                                <div className="relative">
                                    <TrendingUp size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--zx-text-muted))]" />
                                    <input
                                        type="number"
                                        value={form.total}
                                        onChange={(e) => setForm({ ...form, total: e.target.value })}
                                        className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-teal-500 w-48 transition-all shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Paid Amount Field */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Amount Settled (Paid)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--zx-text-muted))] font-bold text-sm">₹</span>
                                    <input
                                        type="number"
                                        value={form.paid}
                                        onChange={(e) => setForm({ ...form, paid: e.target.value })}
                                        className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl pl-8 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-brand-teal-500 w-48 transition-all shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirm({ id: f.id, name: f.name });
                                }}
                                disabled={form.total === "" || form.paid === ""}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 ${
                                    (form.total !== "" && form.paid !== "") 
                                    ? "bg-brand-teal-500 text-white border-transparent hover:bg-brand-teal-600 shadow-brand-teal-500/20" 
                                    : "bg-[rgb(var(--zx-surface-hover))] border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] cursor-not-allowed shadow-none"
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
            <span className="block text-[rgb(var(--zx-text-muted))] font-medium">
                Are you sure you want to update the financial records for <span className="font-bold text-[rgb(var(--zx-text))]">"{confirm?.name}"</span>?
            </span>
            <div className="p-4 bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] rounded-2xl grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest">
                    Amount Due
                  </p>
                  <p className="text-sm font-bold text-rose-500">
                    ₹{( (Number(form.total) * Number(commission)) / 100 - Number(form.paid) ).toFixed(2)}
                  </p>
              </div>
                <div>
                    <p className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest">Paid Amount</p>
                    <p className="text-sm font-bold text-[rgb(var(--zx-text))]">₹{form.paid}</p>
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