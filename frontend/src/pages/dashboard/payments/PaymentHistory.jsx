import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
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
  IndianRupee,
  CreditCard
} from "lucide-react";

// --- VIEW MODAL COMPONENT ---
function ViewPaymentModal({ data, onClose }) {
  if (!data) return null;

  const DetailRow = ({ label, value, icon: Icon, valueClass = "text-slate-700" }) => (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</span>
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
        {Icon && <Icon size={16} className="text-slate-400" />}
        <span className={`text-sm font-semibold ${valueClass}`}>{value || "N/A"}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Transaction Details</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Payment Record Overview</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Transaction ID" value={data.id} icon={Hash} valueClass="font-mono text-indigo-600" />
            <DetailRow label="Date" value={new Date(data.created_at).toLocaleDateString()} icon={Calendar} />
          </div>
          <DetailRow label="Customer Name" value={data.name} icon={User} />
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Email Address" value={data.email} icon={Mail} />
            <DetailRow label="Mobile Number" value={data.mobile} icon={Phone} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailRow label="Amount Paid" value={`₹${data.amount}`} icon={IndianRupee} valueClass="text-slate-900 font-bold text-base" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</span>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide ${
                    data.status === "SUCCESS" ? "bg-emerald-100 text-emerald-700" : 
                    data.status === "FAILED" ? "bg-rose-100 text-rose-700" : 
                    "bg-amber-100 text-amber-700"
                }`}>
                  {data.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95">
            Close Panel
          </button>
        </div>
      </div>
    </div>
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
    // Fetch all data once on component mount
    load();
  }, []);

  // --- CLIENT-SIDE FILTERING LOGIC ---
  const filteredData = data.filter((p) => {
    const searchTerm = search.toLowerCase().trim();
    
    // Search Match (Name, Email, or Mobile)
    const matchesSearch = !searchTerm || 
      (p.name && p.name.toLowerCase().includes(searchTerm)) ||
      (p.email && p.email.toLowerCase().includes(searchTerm)) ||
      (p.mobile && p.mobile.includes(searchTerm));
      
    // Status Match
    const matchesStatus = status === "ALL" || (p.status && p.status.toUpperCase() === status);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (stat) => {
    switch(stat?.toUpperCase()) {
        case 'SUCCESS': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'FAILED': return 'bg-rose-50 text-rose-700 border-rose-200';
        default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans">

      {/* HEADER & FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <History className="text-indigo-600" size={32} />
            Payment History
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Review all external transaction logs, monitor payment statuses, and search customer records.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search user or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-medium placeholder:font-normal"
            />
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-40">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-bold appearance-none cursor-pointer"
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Trx ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="font-medium">Loading payment history...</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium text-slate-600">No payments found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((p) => (
                <tr 
                  key={p.id} 
                  onClick={() => setViewPayment(p)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-5 text-sm font-bold text-indigo-600 font-mono tracking-tight">#{p.id}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                      <User size={14} className="text-slate-400" /> {p.name}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                     {p.email}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-800">
                     ₹{p.amount}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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