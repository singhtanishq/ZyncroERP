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
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Users className="text-indigo-600" size={32} />
            Manage Users
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Control system access, manage user accounts, and securely maintain platform identities.
          </p>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">UID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User Profile</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">System Role</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Approved</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-32 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="font-medium">Loading users...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium text-slate-600">No users found</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                  
                  {/* UID */}
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

                  {/* ROLE SELECTOR */}
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border ${
                        u.role === "admin"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : u.role === "faculty"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : u.role === "student"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      <Shield size={13} className="mr-2" />
                      {u.role}
                    </span>
                  </td>

                  {/* APPROVED STATUS */}
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                        u.approve_status 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {u.approve_status ? "Yes" : "Pending"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <button 
                        onClick={() => setConfirm({ type: 'reset', id: u.id, name: u.name })}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-95"
                        title="Reset Password"
                      >
                        <KeyRound size={14} /> Reset
                      </button>
                      <button 
                        onClick={() => setConfirm({ type: 'delete', id: u.id, name: u.name })}
                        className="p-2 rounded-lg bg-white border border-red-100 text-red-500 hover:bg-red-50 transition-all shadow-sm active:scale-95"
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
            <span className="block text-slate-600">
                Are you sure you want to {
                  confirm?.type === "delete"
                  ? "permanently delete"
                  : "reset the password for"
                } <span className="font-bold text-slate-900">"{confirm?.name}"</span>?
            </span>
            {confirm?.type === 'delete' && (
                <p className="text-xs text-red-600 font-medium">This action cannot be undone and will remove all associated data.</p>
            )}
          </div>
        }
        onConfirm={handleConfirmAction}
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