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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] uppercase tracking-widest font-bold">
          <Globe size={12} /> All Students
        </span>
      );
    }
    if (item.access_type === "course") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] uppercase tracking-widest font-bold">
          <BookOpen size={12} /> {item.course?.name}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] uppercase tracking-widest font-bold">
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <Megaphone className="text-indigo-600" size={32} />
              Student Communications
            </h1>
            <p className="text-slate-500 mt-2 text-sm max-w-xl">
              Publish announcements that will be visible inside the Student Dashboard.
            </p>
          </div>

          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all active:scale-95 bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
          >
            <Plus size={18} />
            Create Communication
          </button>
        </div>

        {/* SEARCH BAR (Sticky) */}
        <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-4 z-30 transition-all">
          <div className="relative group w-full">
            <Search
              size={20}
              className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search communications by title or content..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </motion.div>

        {/* TABLE */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col min-h-[500px]">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Megaphone size={18} className="text-indigo-500" />
              Announcements Ledger
            </h3>
            {filtered.length > 0 && !loading && (
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {filtered.length} Published
              </span>
            )}
          </div>

          <div className="overflow-x-auto flex-1 custom-dashboard-scroll">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/2">Communication</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
                        <Loader2 size={40} className="animate-spin text-indigo-500" />
                        <span className="font-bold tracking-widest text-sm uppercase">Loading Communications...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-32 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-slate-700">No Communications Found</h3>
                        <p className="text-sm mt-1">Click "Create Communication" to publish your first announcement.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      
                        {/* Communication Column */}
                      <td className="px-6 py-5 whitespace-normal">
                        <div className="flex flex-col min-w-0 max-w-xl">
                          <h3 className="font-bold text-slate-900 text-base mb-1 truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-500 line-clamp-2">
                            {item.message}
                          </p>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                            item.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {item.status === "active" ? "Published" : "Hidden"}
                        </span>
                      </td>

                      {/* Created Column */}
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => setViewItem(item)}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-500 transition-colors shadow-sm active:scale-95"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => setEditItem(item)}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 text-slate-500 transition-colors shadow-sm active:scale-95"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => toggleStatus(item.id)}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors shadow-sm active:scale-95"
                            title={item.status === "active" ? "Hide" : "Publish"}
                          >
                            {item.status === "active" ? (
                              <ToggleRight size={18} className="text-emerald-500" />
                            ) : (
                              <ToggleLeft size={18} />
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setDeleteItem(item);
                              setConfirmDelete(true);
                            }}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 transition-colors shadow-sm active:scale-95"
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
        message="Are you sure you want to permanently delete this communication?"
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
            <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border min-w-[300px] ${
              toast.type === "error"
                ? "bg-rose-900 border-rose-800 text-white"
                : "bg-slate-900 border-slate-800 text-white"
            }`}>
              <div className={`rounded-full p-1 ${toast.type === "error" ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                {toast.type === "error" ? (
                  <AlertCircle size={14} className="text-white" strokeWidth={3} />
                ) : (
                  <CheckCircle2 size={14} className="text-slate-900" strokeWidth={3} />
                )}
              </div>
              <span className="text-sm font-semibold flex-1">{toast.msg}</span>
              <button 
                onClick={() => setToast(null)} 
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