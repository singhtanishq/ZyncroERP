import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Plus,
  Save,
  Pencil,
  Trash2,
  X,
  XCircle,
  AlignLeft,
  BadgeCheck,
  Inbox,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  // UI States
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3500);
  };

  // ================= FETCH ROLES =================
  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/corporate/roles");
      setRoles(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch roles", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // ================= ADD / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editId) {
        await api.put(`/corporate/roles/${editId}`, {
          name,
          description,
        });
        showToast("Role updated successfully", "success");
      } else {
        await api.post("/corporate/roles", {
          name,
          description,
        });
        showToast("New role created successfully", "success");
      }

      resetForm();
      fetchRoles();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditId(null);
    setShowForm(false);
  };

  const toggleForm = () => {
    if (showForm) {
      resetForm();
    } else {
      setShowForm(true);
    }
  };

  // ================= EDIT =================
  const handleEdit = (role) => {
    setName(role.name);
    setDescription(role.description || "");
    setEditId(role.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form when editing
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await api.delete(`/corporate/roles/${confirm.id}`);
      showToast("Role deleted successfully", "success");
      fetchRoles();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete role", "error");
    } finally {
      setConfirm(null);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-8 font-sans overflow-x-hidden pb-24">
      {/* Custom Scrollbar */}
      <style>{`
        .custom-dashboard-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <ShieldCheck className="text-indigo-600" size={32} />
              Corporate Roles
            </h1>
            <p className="text-slate-500 mt-2 text-sm max-w-xl">
              Define and manage system access levels, organizational titles, and department hierarchies.
            </p>
          </div>

          <button
            onClick={toggleForm}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all active:scale-95 ${
              showForm
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
            }`}
          >
            {showForm ? <XCircle size={18} /> : <Plus size={18} />}
            {showForm ? "Cancel Form" : "Add Role"}
          </button>
        </div>

        {/* ADD/EDIT FORM (Toggleable) */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: "hidden" }}
              animate={{ opacity: 1, height: "auto", overflow: "visible" }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm"
            >
              <form onSubmit={handleSubmit} className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  {editId ? (
                    <><Pencil size={20} className="text-amber-500" /> Edit System Role</>
                  ) : (
                    <><ShieldCheck size={20} className="text-indigo-500" /> Create New Role</>
                  )}
                </h3>
                
                <div className="flex flex-col gap-6 max-w-4xl">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                      <BadgeCheck size={14} className="text-indigo-500" /> Role Designation *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Manager"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                      <AlignLeft size={14} className="text-indigo-500" /> Description Scope
                    </label>
                    <textarea
                      placeholder="Define responsibilities and access scope..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-slate-600 resize-none font-medium"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                  {editId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!name.trim() || isSubmitting}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      editId
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {isSubmitting ? (
                      <><Loader2 size={18} className="animate-spin" /> Processing...</>
                    ) : editId ? (
                      <><Save size={18} /> Update Role</>
                    ) : (
                      <><Save size={18} /> Confirm & Save</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* DATA TABLE */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col min-h-[500px]">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-500" />
              Active Roles Directory
            </h3>
            {roles.length > 0 && !isLoading && (
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {roles.length} Total
              </span>
            )}
          </div>

          <div className="overflow-x-auto flex-1 custom-dashboard-scroll">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-16">#</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role Designation</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description Scope</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
                        <Loader2 size={40} className="animate-spin text-indigo-500" />
                        <span className="font-bold tracking-widest text-sm uppercase">Loading Roles...</span>
                      </div>
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-32 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <Inbox size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-600">No roles configured</p>
                        <p className="text-sm mt-1">Create a new role using the form above to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  roles.map((role, index) => (
                    <tr key={role.id} className={`hover:bg-slate-50 transition-colors group ${editId === role.id ? 'bg-amber-50/40' : ''}`}>
                      <td className="px-6 py-5">
                        <span className="font-mono text-slate-500 text-xs font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-slate-800 text-base">{role.name}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-slate-500 font-medium max-w-md truncate whitespace-normal" title={role.description}>
                          {role.description || <span className="italic opacity-50">No description provided</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(role)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors shadow-sm active:scale-95"
                            title="Edit Role"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            onClick={() => setConfirm({ id: role.id, name: role.name })}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors shadow-sm active:scale-95"
                            title="Delete Role"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={!!confirm}
        title="Delete System Role"
        message={
          <span className="block text-slate-600">
            Are you sure you want to delete the role <span className="font-bold text-slate-900">"{confirm?.name}"</span>?
            Users assigned to this role may lose access to critical system functions.
          </span>
        }
        onConfirm={handleDelete}
        onClose={() => setConfirm(null)}
      />

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-800 min-w-[300px]">
              <div className={`rounded-full p-1 ${toast.type === "success" ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                {toast.type === "success" 
                  ? <CheckCircle2 size={14} className="text-slate-900" strokeWidth={3} /> 
                  : <AlertCircle size={14} className="text-white" strokeWidth={3} />
                }
              </div>
              <span className="text-sm font-semibold flex-1">{toast.msg}</span>
              <button 
                onClick={() => setToast({ show: false, msg: "", type: "success" })} 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}