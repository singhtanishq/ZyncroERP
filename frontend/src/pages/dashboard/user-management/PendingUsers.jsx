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
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Clock className="text-amber-500" size={32} />
            Pending Approvals
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Review and authorize newly registered accounts before granting them access to the system.
          </p>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Reg ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User Profile</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Requested Role</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="4" className="px-6 py-32 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="font-medium">Loading requests...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-32 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                        <CheckCircle2 size={32} className="text-emerald-500/50" />
                    </div>
                    <p className="text-lg font-bold text-slate-600">All Caught Up!</p>
                    <p className="text-sm mt-1 font-medium">There are no pending accounts requiring your approval.</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                  
                  {/* REG ID */}
                  <td className="px-6 py-5 text-sm font-bold text-indigo-600 font-mono tracking-tight">
                    #{u.id}
                  </td>
                  
                  {/* USER PROFILE */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                        <User size={14} className="text-slate-400" /> {u.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Mail size={12} className="text-slate-400" /> {u.email}
                      </div>
                    </div>
                  </td>

                  {/* REQUESTED ROLE */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg w-max">
                        <ShieldCheck size={14} className="text-slate-500" />
                        <span className="text-xs font-bold text-slate-700 capitalize tracking-wide">{u.role}</span>
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end transition-opacity">
                      <button 
                        onClick={() => setConfirm({ id: u.id, name: u.name, role: u.role })}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 active:scale-95"
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

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={!!confirm}
        title="Authorize New User"
        message={
          <div className="space-y-3">
            <span className="block text-slate-600">
                Are you sure you want to approve the account request for <span className="font-bold text-slate-900">"{confirm?.name}"</span>?
            </span>
            <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                <ShieldCheck size={16} className="text-indigo-600" />
                <span className="text-sm font-bold text-indigo-700">Granting <span className="capitalize">{confirm?.role}</span> Privileges</span>
            </div>
          </div>
        }
        onConfirm={executeApprove}
        onClose={() => setConfirm(null)}
      />

      {/* DUAL-STATE TOAST NOTIFICATION */}
      {toast.msg && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50 min-w-[300px]">
            <div className={`rounded-full p-1 ${toast.type === "success" ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                {toast.type === "success" 
                    ? <CheckCircle2 size={14} className="text-white" strokeWidth={3} /> 
                    : <AlertCircle size={14} className="text-white" strokeWidth={3} />
                }
            </div>
            <span className="text-sm font-semibold tracking-wide mr-4">{toast.msg}</span>
            <button onClick={() => setToast({ msg: "", type: "success" })} className="ml-auto text-slate-400 hover:text-white transition-colors">
                <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}