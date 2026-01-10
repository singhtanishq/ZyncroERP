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
  }, []);

  /* ================= HELPERS ================= */

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(""), 2500);
  };

  const iconByType = (type) => {
    if (type === "pdf") return <FileText size={16} className="text-red-500"/>;
    if (type === "video") return <Video size={16} className="text-blue-500"/>;
    return <StickyNote size={16} className="text-amber-500"/>;
  };

  /* ================= ACTIONS ================= */

  const toggleStatus = async (id) => {
    await api.patch(`${apiPrefix}/study-materials/${id}/toggle`);
    loadMaterials();
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans">
      
      {/* HEADER SECTION (Restored to User Preference) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Library className="text-blue-600" size={32} />
            Study Materials
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Central repository for course content. Upload videos, PDFs, and notes, and manage student access permissions.
          </p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="group flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 font-medium"
        >
          <Plus size={18} className="group-hover:-translate-y-0.5 transition-transform" />
          <span>Add Material</span>
        </button>
      </div>

      {/* FILTERS / SEARCH BAR */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
            <input 
                type="text" 
                placeholder="Search materials..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
        {/* HEADERS */}
        <div className={`${gridLayout} px-6 py-4 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider backdrop-blur-sm`}>
          <div>Content Title</div>
          <div>Format</div>
          <div>Visibility</div>
          <div>Date Added</div>
          <div className="text-right">Actions</div>
        </div>

        {/* BODY */}
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
             <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
             <span className="font-medium">Loading study materials...</span>
          </div>
        ) : materials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-50/30">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
              <StickyNote size={32} className="text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-600">No study materials found</p>
            <p className="text-sm mt-1">Get started by uploading a new file or video link.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {materials.map((m) => (
              <div
                key={m.id}
                className={`${gridLayout} px-6 py-5 hover:bg-slate-50/80 transition-all duration-200 group`}
              >
                {/* TITLE */}
                <div className="min-w-0 pr-4">
                  <div className="font-bold text-slate-800 text-sm md:text-base truncate group-hover:text-indigo-700 transition-colors">
                    {m.title}
                  </div>
                  {m.description ? (
                    <div className="text-xs text-slate-500 truncate mt-1 max-w-md font-medium">
                      {m.description}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic mt-1 font-medium">No description provided</div>
                  )}
                </div>

                {/* TYPE */}
                <div>
                   <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold border border-slate-100 uppercase tracking-wide group-hover:border-slate-200 transition-colors">
                    {iconByType(m.type)}
                    {m.type}
                   </span>
                </div>

                {/* STATUS */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize tracking-wide ${
                      m.status === "active"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${m.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                    {m.status === "active" ? "Published" : "Hidden"}
                  </span>
                </div>

                {/* CREATED */}
                <div className="text-sm text-slate-500 font-medium flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400"/>
                  {new Date(m.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                {/* ACTIONS */}
                
                <div className="flex justify-end items-center gap-1 opacity-100 transition-opacity">
                  
                  <button
                    onClick={() => setAccessMaterial(m)}
                    title="Access Control"
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <Shield size={16} />
                  </button>

                  <button
                    onClick={() => setEditMaterial(m)}
                    title="Edit Details"
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => toggleStatus(m.id)}
                    title={m.status === "active" ? "Hide Material" : "Publish Material"}
                    className={`p-2 rounded-lg transition-all ${
                        m.status === 'active' 
                        ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' 
                        : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'
                    }`}
                  >
                    {m.status === "active" ? (
                      <ToggleRight size={20} className="text-emerald-500" />
                    ) : (
                      <ToggleLeft size={20} />
                    )}
                  </button>

                  <div className="w-px h-4 bg-slate-200 mx-1"></div>

                  <button
                    onClick={() => {
                      setDeleteTarget(m);
                      setConfirmOpen(true);
                    }}
                    title="Delete Permanently"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
            className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border animate-in slide-in-from-bottom-5 fade-in duration-300
            ${
            toast.type === "error"
                ? "bg-white border-red-100 text-red-600 shadow-red-100"
                : "bg-slate-900 border-slate-700 text-white shadow-slate-300"
            }`}
        >
            {toast.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} className="text-emerald-400"/>}
            <span className="text-sm font-semibold tracking-wide">{toast.msg}</span>
        </div>
        )}
        
    </div>
  );
}