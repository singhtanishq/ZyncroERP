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
    <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 font-sans overflow-x-hidden">
      {/* Custom Scrollbar */}
      <style>{`
        .custom-dashboard-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb { background: rgb(var(--zx-border)); border-radius: 10px; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: rgb(var(--zx-text-muted)); }
      `}</style>

      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
              <ShieldCheck size={14} strokeWidth={2.5} />
              Access Control
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
              Corporate Roles
            </h1>
            <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
              Define and manage system access levels, organizational titles, and department hierarchies.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleForm}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95 ${
              showForm
                ? "bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] border border-[rgb(var(--zx-border))] hover:bg-[rgb(var(--zx-surface-hover))]"
                : "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-lg shadow-brand-teal-500/20"
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
              className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-3xl shadow-sm relative z-10"
            >
              <form onSubmit={handleSubmit} className="p-8">
                <h3 className="text-base font-bold text-[rgb(var(--zx-text))] mb-6 pb-3 border-b border-[rgb(var(--zx-border))] flex items-center gap-2">
                  {editId ? (
                    <><Pencil size={18} className="text-amber-500" /> Edit System Role</>
                  ) : (
                    <><ShieldCheck size={18} className="text-brand-teal-500" /> Create New Role</>
                  )}
                </h3>
                
                <div className="flex flex-col gap-6 max-w-4xl">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <BadgeCheck size={14} className="text-brand-teal-500" /> Role Designation *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Manager"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all font-bold text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <AlignLeft size={14} className="text-brand-teal-500" /> Description Scope
                    </label>
                    <textarea
                      placeholder="Define responsibilities and access scope..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-medium shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 resize-none"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[rgb(var(--zx-border))] flex justify-end gap-3">
                  {editId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!name.trim() || isSubmitting}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                      editId
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                        : "bg-brand-teal-500 hover:bg-brand-teal-600 text-white shadow-brand-teal-500/20"
                    }`}
                  >
                    {isSubmitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Processing...</>
                    ) : editId ? (
                      <><Save size={16} /> Update Role</>
                    ) : (
                      <><Save size={16} /> Confirm & Save</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* DATA TABLE */}
        <motion.div variants={itemVariants} className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden flex flex-col min-h-[500px] relative z-10">
          <div className="px-6 py-5 border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))] flex items-center justify-between shrink-0">
            <h3 className="font-bold text-[rgb(var(--zx-text))] text-sm flex items-center gap-2">
              <ShieldCheck size={18} className="text-brand-teal-500" />
              Active Roles Directory
            </h3>
            {roles.length > 0 && !isLoading && (
              <span className="bg-brand-teal-500/10 border border-brand-teal-500/20 text-brand-teal-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {roles.length} Total
              </span>
            )}
          </div>

          <div className="overflow-x-auto flex-1 custom-dashboard-scroll">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-[rgb(var(--zx-surface))] border-b border-[rgb(var(--zx-border))] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider w-16">#</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Role Designation</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Description Scope</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--zx-border))]">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 text-[rgb(var(--zx-text-muted))]">
                        <Loader2 size={40} className="animate-spin text-brand-teal-500" />
                        <span className="font-bold tracking-widest text-xs uppercase">Loading Roles...</span>
                      </div>
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-32 text-center text-[rgb(var(--zx-text-muted))]">
                      <div className="flex flex-col items-center justify-center">
                        <Inbox size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No roles configured</p>
                        <p className="text-sm mt-1">Create a new role using the form above to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  roles.map((role, index) => (
                    <tr key={role.id} className={`hover:bg-[rgb(var(--zx-surface-hover))] transition-colors group ${editId === role.id ? 'bg-amber-500/10' : ''}`}>
                      <td className="px-6 py-5">
                        <span className="font-mono text-[rgb(var(--zx-text-muted))] text-xs font-semibold bg-[rgb(var(--zx-surface-hover))] px-2.5 py-1 rounded-lg border border-[rgb(var(--zx-border))]">
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-[rgb(var(--zx-text))] text-sm md:text-base">{role.name}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-[rgb(var(--zx-text-muted))] font-medium max-w-md truncate whitespace-normal" title={role.description}>
                          {role.description || <span className="italic opacity-50">No description provided</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(role)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all shadow-sm active:scale-95"
                            title="Edit Role"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirm({ id: role.id, name: role.name })}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all shadow-sm active:scale-95"
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
          <span className="text-[rgb(var(--zx-text-muted))] font-medium">
            Are you sure you want to delete the role <strong className="text-[rgb(var(--zx-text))]">"{confirm?.name}"</strong>?
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
            <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[rgb(var(--zx-border))] backdrop-blur-xl min-w-[300px]">
              <div className={`rounded-full p-1 border ${toast.type === "success" ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/20 text-rose-500 border-rose-500/30'}`}>
                {toast.type === "success" 
                  ? <CheckCircle2 size={14} strokeWidth={3} /> 
                  : <AlertCircle size={14} strokeWidth={3} />
                }
              </div>
              <span className="text-sm font-bold tracking-wide flex-1">{toast.msg}</span>
              <button 
                type="button"
                onClick={() => setToast({ show: false, msg: "", type: "success" })} 
                className="text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] transition-colors"
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