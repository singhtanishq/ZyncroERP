import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import { 
  Users, 
  Trash2, 
  KeyRound, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  Inbox,
  User,
  Mail,
  X
} from "lucide-react";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      showToast("Failed to load users", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const executeDelete = async () => {
    try {
      await api.delete(`/admin/users/${confirm.id}`);
      showToast("User account deleted successfully", "success");
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete user", "error");
    } finally {
      setConfirm(null);
    }
  };

  const executeReset = async () => {
    try {
      await api.post(`/admin/users/${confirm.id}/reset`, {});
      showToast("Credentials reset & emailed securely", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reset credentials", "error");
    } finally {
      setConfirm(null);
    }
  };

  const handleConfirmAction = () => {
    if (confirm?.type === 'delete') executeDelete();
    if (confirm?.type === 'reset') executeReset();
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
            <Users size={14} strokeWidth={2.5} />
            User Access
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Manage Users
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Control system access, manage user accounts, and securely maintain platform identities.
          </p>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))]">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">UID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">User Profile</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">System Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Approved</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--zx-border))]">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
                      <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
                      <span className="font-medium text-sm">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-[rgb(var(--zx-text-muted))]">
                    <div className="flex flex-col items-center justify-center">
                      <Inbox size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-[rgb(var(--zx-surface-hover))] transition-colors group">
                    
                    {/* UID */}
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

                    {/* ROLE SELECTOR */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                          u.role === "admin"
                            ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                            : u.role === "faculty"
                            ? "bg-brand-blue-500/10 text-brand-blue-600 border-brand-blue-500/20"
                            : u.role === "student"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}
                      >
                        <Shield size={12} className="mr-1.5" />
                        {u.role}
                      </span>
                    </td>

                    {/* APPROVED STATUS */}
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                          u.approve_status 
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {u.approve_status ? "Yes" : "Pending"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <button 
                          type="button"
                          onClick={() => setConfirm({ type: 'reset', id: u.id, name: u.name })}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-xs font-bold uppercase tracking-wider hover:border-brand-teal-500 hover:text-brand-teal-500 transition-all shadow-sm active:scale-95"
                          title="Reset Password"
                        >
                          <KeyRound size={14} /> Reset
                        </button>
                        <button 
                          type="button"
                          onClick={() => setConfirm({ type: 'delete', id: u.id, name: u.name })}
                          className="p-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-all shadow-sm active:scale-95"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
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
        title={
          confirm?.type === "delete"
            ? "Delete User Account"
            : "Reset Credentials"
        }
        message={
          <div className="space-y-2">
            <span className="block text-[rgb(var(--zx-text-muted))] font-medium">
                Are you sure you want to {
                  confirm?.type === "delete"
                  ? "permanently delete"
                  : "reset the password for"
                } <span className="font-bold text-[rgb(var(--zx-text))]">"{confirm?.name}"</span>?
            </span>
            {confirm?.type === 'delete' && (
                <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">This action cannot be undone and will remove all associated data.</p>
            )}
          </div>
        }
        onConfirm={handleConfirmAction}
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