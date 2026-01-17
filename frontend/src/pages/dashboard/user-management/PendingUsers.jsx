import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Inbox,
  User,
  Mail,
  ShieldCheck,
  Check,
  X
} from "lucide-react";

export default function PendingUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/users/pending");
      setUsers(res.data);
    } catch (err) {
      showToast("Failed to load pending users", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const executeApprove = async () => {
    try {
      await api.post(`/admin/users/${confirm.id}/approve`, {});
      showToast("User account approved successfully", "success");
      fetchPending();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to approve user", "error");
    } finally {
      setConfirm(null);
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold tracking-widest text-amber-500 uppercase w-max mb-1">
            <Clock size={14} strokeWidth={2.5} />
            Access Authorization
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Pending Approvals
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Review and authorize newly registered accounts before granting them access to the system.
          </p>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))]">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Reg ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">User Profile</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Requested Role</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--zx-border))]">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
                      <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
                      <span className="font-medium text-sm">Loading requests...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-32 text-center text-[rgb(var(--zx-text-muted))]">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-[rgb(var(--zx-surface-hover))] rounded-full flex items-center justify-center mb-4 border border-[rgb(var(--zx-border))]">
                          <CheckCircle2 size={32} className="text-emerald-500" />
                      </div>
                      <p className="text-lg font-bold text-[rgb(var(--zx-text))]">All Caught Up!</p>
                      <p className="text-sm mt-1 font-medium text-[rgb(var(--zx-text-muted))]">There are no pending accounts requiring your approval.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[rgb(var(--zx-surface-hover))] transition-colors group">
                    
                    {/* REG ID */}
                    <td className="px-6 py-5 text-sm font-bold text-brand-teal-500 font-mono tracking-tight">
                      #{u.id}
                    </td>
                    
                    {/* USER PROFILE */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 font-bold text-[rgb(var(--zx-text))] text-sm sm:text-base">
                          <User size={14} className="text-[rgb(var(--zx-text-muted))]" /> {u.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[rgb(var(--zx-text-muted))] font-medium">
                          <Mail size={12} className="text-[rgb(var(--zx-text-muted))]" /> {u.email}
                        </div>
                      </div>
                    </td>

                    {/* REQUESTED ROLE */}
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] rounded-xl">
                          <ShieldCheck size={14} className="text-brand-teal-500" />
                          <span className="text-xs font-bold text-[rgb(var(--zx-text))] capitalize tracking-wide">{u.role}</span>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end transition-opacity">
                        <button 
                          type="button"
                          onClick={() => setConfirm({ id: u.id, name: u.name, role: u.role })}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
                        >
                          <Check size={16} /> Authorize Access
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={!!confirm}
        title="Authorize New User"
        message={
          <div className="space-y-3">
            <span className="block text-[rgb(var(--zx-text-muted))] font-medium">
                Are you sure you want to approve the account request for <span className="font-bold text-[rgb(var(--zx-text))]">"{confirm?.name}"</span>?
            </span>
            <div className="p-4 bg-brand-teal-500/10 border border-brand-teal-500/20 rounded-2xl flex items-center gap-3">
                <ShieldCheck size={18} className="text-brand-teal-500" />
                <span className="text-sm font-bold text-brand-teal-500">Granting <span className="capitalize">{confirm?.role}</span> Privileges</span>
            </div>
          </div>
        }
        onConfirm={executeApprove}
        onClose={() => setConfirm(null)}
      />

      {/* DUAL-STATE TOAST NOTIFICATION */}
      {toast.msg && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[rgb(var(--zx-border))] backdrop-blur-xl min-w-[300px]">
            <div className={`rounded-full p-1 border ${toast.type === "success" ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/20 text-rose-500 border-rose-500/30'}`}>
                {toast.type === "success" 
                    ? <CheckCircle2 size={14} strokeWidth={3} /> 
                    : <AlertCircle size={14} strokeWidth={3} />
                }
            </div>
            <span className="text-sm font-bold tracking-wide mr-4">{toast.msg}</span>
            <button type="button" onClick={() => setToast({ msg: "", type: "success" })} className="ml-auto text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] transition-colors">
                <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}