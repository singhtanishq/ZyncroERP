import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import AppModal from "../../../components/common/AppModal";
import { 
  History, 
  Search, 
  Filter, 
  X, 
  Inbox, 
  User, 
  Mail, 
  Phone, 
  Hash, 
  Calendar, 
  IndianRupee
} from "lucide-react";

// --- VIEW MODAL COMPONENT ---
function ViewPaymentModal({ data, onClose }) {
  if (!data) return null;

  const DetailRow = ({ label, value, icon: Icon, valueClass = "text-[rgb(var(--zx-text))]" }) => (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">{label}</span>
      <div className="flex items-center gap-3 bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] px-4 py-3 rounded-xl">
        {Icon && <Icon size={16} className="text-brand-teal-500 shrink-0" />}
        <span className={`text-sm font-semibold ${valueClass}`}>{value || "N/A"}</span>
      </div>
    </div>
  );

  return (
    <AppModal
      open={!!data}
      onClose={onClose}
      title="Transaction Details"
      size="lg"
      footer={
        <button 
          type="button" 
          onClick={onClose} 
          className="px-6 py-2.5 rounded-xl bg-brand-teal-500 text-white text-sm font-semibold hover:bg-brand-teal-600 transition-all active:scale-95 shadow-lg shadow-brand-teal-500/25"
        >
          Close Panel
        </button>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2">
          Payment Record Overview
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Transaction ID" value={data.id} icon={Hash} valueClass="font-mono text-brand-teal-500" />
          <DetailRow label="Date" value={new Date(data.created_at).toLocaleDateString()} icon={Calendar} />
        </div>
        <DetailRow label="Customer Name" value={data.name} icon={User} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Email Address" value={data.email} icon={Mail} />
          <DetailRow label="Mobile Number" value={data.mobile} icon={Phone} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailRow label="Amount Paid" value={`₹${data.amount}`} icon={IndianRupee} valueClass="text-[rgb(var(--zx-text))] font-bold text-base" />
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Status</span>
            <div className="flex items-center gap-3 bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] px-4 py-3 rounded-xl">
              <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                  data.status === "SUCCESS" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                  data.status === "FAILED" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : 
                  "bg-amber-500/10 text-amber-500 border-amber-500/20"
              }`}>
                {data.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
}

// --- MAIN COMPONENT ---
export default function PaymentHistory() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [viewPayment, setViewPayment] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/external-payments");
      setData(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredData = data.filter((p) => {
    const searchTerm = search.toLowerCase().trim();
    
    const matchesSearch = !searchTerm || 
      (p.name && p.name.toLowerCase().includes(searchTerm)) ||
      (p.email && p.email.toLowerCase().includes(searchTerm)) ||
      (p.mobile && p.mobile.includes(searchTerm));
      
    const matchesStatus = status === "ALL" || (p.status && p.status.toUpperCase() === status);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (stat) => {
    switch(stat?.toUpperCase()) {
        case 'SUCCESS': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
        case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        case 'FAILED': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        default: return 'bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border-[rgb(var(--zx-border))]';
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 space-y-8 animate-fade-in font-sans">

      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER & FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
            <History size={14} strokeWidth={2.5} />
            Financial Logs
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Payment History
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Review all external transaction logs, monitor payment statuses, and search customer records.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--zx-text-muted))]" />
            <input
              placeholder="Search user or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-semibold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal"
            />
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-40">
            <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--zx-text-muted))]" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-bold appearance-none cursor-pointer shadow-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] relative z-10">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))]">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Trx ID</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--zx-border))]">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
                    <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
                    <span className="font-medium text-sm">Loading payment history...</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center text-[rgb(var(--zx-text-muted))]">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No payments found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((p) => (
                <tr 
                  key={p.id} 
                  onClick={() => setViewPayment(p)}
                  className="hover:bg-[rgb(var(--zx-surface-hover))] cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-5 text-sm font-bold text-brand-teal-500 font-mono tracking-tight">#{p.id}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 font-bold text-[rgb(var(--zx-text))] text-sm">
                      <User size={14} className="text-[rgb(var(--zx-text-muted))]" /> {p.name}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))] font-medium">
                     {p.email}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-[rgb(var(--zx-text))]">
                     ₹{p.amount}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))]">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[rgb(var(--zx-text-muted))] opacity-0 group-hover:opacity-100 transition-opacity" />
                        {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {viewPayment && (
        <ViewPaymentModal data={viewPayment} onClose={() => setViewPayment(null)} />
      )}
    </div>
  );
}