import { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api/apiClient";
import ViewCommunicationModal from "./ViewCommunicationModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Plus,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Pencil,
  Megaphone,
  Globe,
  BookOpen,
  Layers,
  Calendar,
  Search,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Loader2,
  X
} from "lucide-react";

import ConfirmModal from "../../../components/ConfirmModal";
import AddCommunicationModal from "./AddCommunicationModal";
import EditCommunicationModal from "./EditCommunicationModal";

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

export default function ManageStudentCommunications({
    apiPrefix="/admin"
}) {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  async function loadCommunications() {
    try {
      setLoading(true);
      const res = await api.get(`${apiPrefix}/student-communications`);
      setCommunications(res.data || []);
    } catch (e) {
      showToast("Failed to load communications", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCommunications();
  }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return communications;
    const keyword = search.toLowerCase();
    return communications.filter((item) => {
      return (
        item.title?.toLowerCase().includes(keyword) ||
        item.message?.toLowerCase().includes(keyword)
      );
    });
  }, [communications, search]);

  function audienceBadge(item) {
    if (item.access_type === "all") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20 text-[10px] uppercase tracking-widest font-bold">
          <Globe size={12} /> All Students
        </span>
      );
    }
    if (item.access_type === "course") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20 text-[10px] uppercase tracking-widest font-bold">
          <BookOpen size={12} /> {item.course?.name}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20 text-[10px] uppercase tracking-widest font-bold">
        <Layers size={12} /> {item.course?.name} • {item.batch?.name}
      </span>
    );
  }

  async function toggleStatus(id) {
    try {
      await api.patch(
        `${apiPrefix}/student-communications/${id}/toggle`
    );
      loadCommunications();
      showToast("Communication updated");
    } catch {
      showToast("Failed to update", "error");
    }
  }

  async function deleteCommunication() {
    try {
      await api.delete(
        `${apiPrefix}/student-communications/${deleteItem.id}`
    );
      showToast("Communication deleted");
      loadCommunications();
    } catch (e) {
      showToast(e?.response?.data?.message || "Deletion failed", "error");
    } finally {
      setDeleteItem(null);
      setConfirmDelete(false);
    }
  }

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
              <Megaphone size={14} strokeWidth={2.5} />
              Student Portal
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
              Student Communications
            </h1>
            <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
              Publish announcements that will be visible inside the Student Dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95 bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-lg shadow-brand-teal-500/20 shrink-0"
          >
            <Plus size={18} />
            Create Communication
          </button>
        </div>

        {/* SEARCH BAR (Sticky) */}
        <motion.div variants={itemVariants} className="bg-[rgb(var(--zx-surface))]/90 backdrop-blur-xl p-4 rounded-2xl border border-[rgb(var(--zx-border))] shadow-sm sticky top-4 z-30 transition-all">
          <div className="relative group w-full">
            <Search
              size={18}
              className="absolute left-4 top-3.5 text-[rgb(var(--zx-text-muted))] group-focus-within:text-brand-teal-500 transition-colors"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search communications by title or content..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal"
            />
          </div>
        </motion.div>

        {/* TABLE */}
        <motion.div variants={itemVariants} className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden flex flex-col min-h-[500px] relative z-10">
          <div className="px-6 py-5 border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))] flex items-center justify-between shrink-0">
            <h3 className="font-bold text-[rgb(var(--zx-text))] text-sm flex items-center gap-2">
              <Megaphone size={18} className="text-brand-teal-500" />
              Announcements Ledger
            </h3>
            {filtered.length > 0 && !loading && (
              <span className="bg-brand-teal-500/10 border border-brand-teal-500/20 text-brand-teal-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {filtered.length} Published
              </span>
            )}
          </div>

          <div className="overflow-x-auto flex-1 custom-dashboard-scroll">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-[rgb(var(--zx-surface))] border-b border-[rgb(var(--zx-border))] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider w-1/2">Communication</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--zx-border))]">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 text-[rgb(var(--zx-text-muted))]">
                        <Loader2 size={40} className="animate-spin text-brand-teal-500" />
                        <span className="font-bold tracking-widest text-xs uppercase">Loading Communications...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-32 text-center text-[rgb(var(--zx-text-muted))]">
                      <div className="flex flex-col items-center justify-center">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-[rgb(var(--zx-text))]">No Communications Found</h3>
                        <p className="text-sm mt-1">Click "Create Communication" to publish your first announcement.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[rgb(var(--zx-surface-hover))] transition-colors group">
                      
                        {/* Communication Column */}
                      <td className="px-6 py-5 whitespace-normal">
                        <div className="flex flex-col min-w-0 max-w-xl">
                          <h3 className="font-bold text-[rgb(var(--zx-text))] text-sm md:text-base mb-1 truncate">
                            {item.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[rgb(var(--zx-text-muted))] line-clamp-2 font-medium">
                            {item.message}
                          </p>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                            item.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border-[rgb(var(--zx-border))]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === "active" ? "bg-emerald-500" : "bg-[rgb(var(--zx-text-muted))]"
                            }`}
                          />
                          {item.status === "active" ? "Published" : "Hidden"}
                        </span>
                      </td>

                      {/* Created Column */}
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-[rgb(var(--zx-text-muted))] flex items-center gap-2">
                          <Calendar size={14} className="text-[rgb(var(--zx-text-muted))]" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewItem(item)}
                            className="p-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] hover:border-brand-teal-500 hover:text-brand-teal-500 text-[rgb(var(--zx-text-muted))] transition-colors shadow-sm active:scale-95"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditItem(item)}
                            className="p-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] hover:border-amber-500 hover:text-amber-500 text-[rgb(var(--zx-text-muted))] transition-colors shadow-sm active:scale-95"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleStatus(item.id)}
                            className="p-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] hover:border-brand-blue-500 hover:text-brand-blue-500 text-[rgb(var(--zx-text-muted))] transition-colors shadow-sm active:scale-95"
                            title={item.status === "active" ? "Hide" : "Publish"}
                          >
                            {item.status === "active" ? (
                              <ToggleRight size={18} className="text-emerald-500" />
                            ) : (
                              <ToggleLeft size={18} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteItem(item);
                              setConfirmDelete(true);
                            }}
                            className="p-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 transition-colors shadow-sm active:scale-95"
                            title="Delete"
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
        </motion.div>
      </motion.div>

      {/* ======================================
              MODALS
      ====================================== */}
  
      <AddCommunicationModal
        apiPrefix={apiPrefix}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          setAddOpen(false);
          loadCommunications();
          showToast("Communication created successfully");
        }}
      />

      <EditCommunicationModal
        apiPrefix={apiPrefix}
        open={!!editItem}
        communication={editItem}
        onClose={() => setEditItem(null)}
        onSaved={() => {
          setEditItem(null);
          loadCommunications();
          showToast("Communication updated successfully");
        }}
      />

      <ViewCommunicationModal
        open={!!viewItem}
        communication={viewItem}
        onClose={() => setViewItem(null)}
      />

      <ConfirmModal
        open={confirmDelete}
        title="Delete Communication"
        message={
          <span className="text-[rgb(var(--zx-text-muted))] font-medium">
            Are you sure you want to permanently delete this communication?
          </span>
        }
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteCommunication}
      />

      {/* ======================================
              TOAST NOTIFICATION
      ====================================== */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[rgb(var(--zx-border))] backdrop-blur-xl min-w-[300px]">
              <div className={`rounded-full p-1 border ${
                toast.type === "error"
                  ? "bg-rose-500/20 text-rose-500 border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
              }`}>
                {toast.type === "error" ? (
                  <AlertCircle size={14} strokeWidth={3} />
                ) : (
                  <CheckCircle2 size={14} strokeWidth={3} />
                )}
              </div>
              <span className="text-sm font-bold tracking-wide flex-1">{toast.msg}</span>
              <button 
                type="button"
                onClick={() => setToast(null)} 
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