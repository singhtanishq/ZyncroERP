import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import {
  Plus,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  Shield,
  FileText,
  Video,
  StickyNote,
  Library,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Search
} from "lucide-react";

import ConfirmModal from "../../../components/ConfirmModal";
import AddMaterialModal from "./AddMaterialModal";
import EditMaterialModal from "./EditMaterialModal";
import AccessControlModal from "./AccessControlModal";

export default function ManageStudyMaterials({
      apiPrefix = "/admin",
      isFaculty = false,
  }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState(null);
  const [accessMaterial, setAccessMaterial] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [toast, setToast] = useState("");

  /* ================= LOAD ================= */

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${apiPrefix}/study-materials`);
      setMaterials(res.data);
    } catch {
      showToast("Failed to load study materials", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [apiPrefix]);

  /* ================= HELPERS ================= */

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(""), 2500);
  };

  const iconByType = (type) => {
    if (type === "pdf") return <FileText size={16} className="text-rose-500"/>;
    if (type === "video") return <Video size={16} className="text-blue-500"/>;
    return <StickyNote size={16} className="text-amber-500"/>;
  };

  /* ================= ACTIONS ================= */

  const toggleStatus = async (id) => {
    try {
      await api.patch(`${apiPrefix}/study-materials/${id}/toggle`);
      loadMaterials();
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to update status", "error");
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`${apiPrefix}/study-materials/${deleteTarget.id}`);
      showToast("Study material deleted");
      loadMaterials();
     } catch (e) {
      if (e?.response?.status === 409) {
        showToast(e.response.data.message, "error");
      } else {
          showToast("Deletion failed", "error");
      }
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  /* ================= UI ================= */

  const gridLayout = "grid grid-cols-[2fr_1fr_1fr_1fr_180px] gap-4 items-center";

  const filteredMaterials = materials.filter((m) =>
    m.title?.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 pt-0 space-y-8 animate-fade-in font-sans">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
            <Library size={14} strokeWidth={2.5} />
            Resource Hub
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Study Materials
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Central repository for course content. Upload videos, PDFs, and notes, and manage student access permissions.
          </p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="group flex items-center gap-2 px-6 py-3 bg-brand-teal-500 hover:bg-brand-teal-600 text-white rounded-2xl shadow-lg shadow-brand-teal-500/20 transition-all active:scale-95 font-semibold text-sm"
        >
          <Plus size={18} className="group-hover:-translate-y-0.5 transition-transform" />
          <span>Add Material</span>
        </button>
      </div>

      {/* FILTERS / SEARCH BAR */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--zx-text-muted))]" />
            <input
                type="text"
                placeholder="Search materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-2xl text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-[rgb(var(--zx-text))] placeholder:text-[rgb(var(--zx-text-muted))]/60 shadow-sm"
            />
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] relative z-10">
        {/* HEADERS */}
        <div className={`${gridLayout} px-6 py-4 bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))] text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider`}>
          <div>Content Title</div>
          <div>Format</div>
          <div>Visibility</div>
          <div>Date Added</div>
          <div className="text-right">Actions</div>
        </div>

        {/* BODY */}
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
             <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
             <span className="font-medium text-sm">Loading study materials...</span>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[rgb(var(--zx-text-muted))] bg-[rgb(var(--zx-surface))]">
            <div className="w-16 h-16 bg-[rgb(var(--zx-surface-hover))] rounded-2xl flex items-center justify-center mb-4 border border-[rgb(var(--zx-border))] shadow-sm text-[rgb(var(--zx-text-muted))]">
              <StickyNote size={24} />
            </div>
            <p className="text-[17px] font-bold text-[rgb(var(--zx-text))]">
              {materials.length === 0 ? "No study materials found" : "No matching materials"}
            </p>
            <p className="text-[14px] text-[rgb(var(--zx-text-muted))] mt-1">
              {materials.length === 0
                ? "Get started by uploading a new file or video link."
                : "Try a different search term."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[rgb(var(--zx-border))]">
            {filteredMaterials.map((m) => (
              <div
                key={m.id}
                className={`${gridLayout} px-6 py-4 hover:bg-[rgb(var(--zx-surface-hover))] transition-all duration-200 group`}
              >
                {/* TITLE */}
                <div className="min-w-0 pr-4">
                  <div className="font-bold text-[rgb(var(--zx-text))] text-sm md:text-base truncate group-hover:text-brand-teal-500 transition-colors">
                    {m.title}
                  </div>
                  {m.description ? (
                    <div className="text-xs text-[rgb(var(--zx-text-muted))] truncate mt-1 max-w-md font-medium">
                      {m.description}
                    </div>
                  ) : (
                    <div className="text-xs text-[rgb(var(--zx-text-muted))] italic mt-1 font-medium">No description provided</div>
                  )}
                </div>

                {/* TYPE */}
                <div>
                   <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text))] text-xs font-semibold border border-[rgb(var(--zx-border))] uppercase tracking-wide">
                    {iconByType(m.type)}
                    {m.type}
                   </span>
                </div>

                {/* STATUS */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border capitalize tracking-widest ${
                      m.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border-[rgb(var(--zx-border))]"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${m.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-[rgb(var(--zx-text-muted))]"}`} />
                    {m.status === "active" ? "Published" : "Hidden"}
                  </span>
                </div>

                {/* CREATED */}
                <div className="text-sm text-[rgb(var(--zx-text-muted))] font-medium flex items-center gap-2">
                  <Calendar size={14} className="text-[rgb(var(--zx-text-muted))]" />
                  {new Date(m.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end items-center gap-1">
                  <button
                    onClick={() => setAccessMaterial(m)}
                    title="Access Control"
                    className="p-2 text-[rgb(var(--zx-text-muted))] hover:text-brand-teal-500 hover:bg-brand-teal-500/10 rounded-xl transition-all"
                  >
                    <Shield size={16} />
                  </button>

                  <button
                    onClick={() => setEditMaterial(m)}
                    title="Edit Details"
                    className="p-2 text-[rgb(var(--zx-text-muted))] hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => toggleStatus(m.id)}
                    title={m.status === "active" ? "Hide Material" : "Publish Material"}
                    className={`p-2 rounded-xl transition-all ${
                        m.status === 'active' 
                        ? 'text-[rgb(var(--zx-text-muted))] hover:text-rose-500 hover:bg-rose-500/10' 
                        : 'text-[rgb(var(--zx-text-muted))] hover:text-emerald-500 hover:bg-emerald-500/10'
                    }`}
                  >
                    {m.status === "active" ? (
                      <ToggleRight size={20} className="text-emerald-500" />
                    ) : (
                      <ToggleLeft size={20} />
                    )}
                  </button>

                  <div className="w-px h-4 bg-[rgb(var(--zx-border))] mx-1"></div>

                  <button
                    onClick={() => {
                      setDeleteTarget(m);
                      setConfirmOpen(true);
                    }}
                    title="Delete Permanently"
                    className="p-2 text-[rgb(var(--zx-text-muted))] hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      <AddMaterialModal
        apiPrefix={apiPrefix}
        isFaculty={isFaculty}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          setAddOpen(false);
          loadMaterials();
          showToast("Study material added successfully");
        }}
      />

      <EditMaterialModal
        apiPrefix={apiPrefix}
        open={!!editMaterial}
        material={editMaterial}
        onClose={() => setEditMaterial(null)}
        onSaved={() => {
          setEditMaterial(null);
          loadMaterials();
          showToast("Study material updated successfully");
        }}
      />

      <AccessControlModal
        apiPrefix={apiPrefix}
        isFaculty={isFaculty}
        open={!!accessMaterial}
        material={accessMaterial}
        onClose={() => {
            setAccessMaterial(null);
        }}
        onSaved={() => {
            setAccessMaterial(null);
            loadMaterials();
            showToast("Access permissions updated");
        }}
    />

      <ConfirmModal
        open={confirmOpen}
        title="Delete Study Material"
        message="Are you sure you want to delete this content? This action cannot be undone."
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />

      {/* TOAST */}
      {toast && (
        <div
            className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border animate-in slide-in-from-bottom-5 fade-in duration-300 backdrop-blur-xl
            ${
            toast.type === "error"
                ? "bg-[rgb(var(--zx-surface))] border-rose-500/30 text-rose-500 shadow-rose-500/10"
                : "bg-[rgb(var(--zx-surface))] border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-black/20"
            }`}
        >
            {toast.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} className="text-emerald-500"/>}
            <span className="text-sm font-bold tracking-wide">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}