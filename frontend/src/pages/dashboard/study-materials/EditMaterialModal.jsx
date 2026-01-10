import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { 
  X, 
  FileText, 
  Link2, 
  Pencil, 
  Video, 
  StickyNote, 
  AlertCircle, 
  Info,
  Save,
  AlignLeft,
  Type
} from "lucide-react";

export default function EditMaterialModal({
    open,
    material,
    onClose,
    onSaved,
    apiPrefix="/admin",
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    video_url: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (material) {
      setForm({
        title: material.title || "",
        description: material.description || "",
        video_url: material.video_url || "",
        notes: material.notes || "",
      });
    }
  }, [material]);

  if (!open || !material) return null;

  /* ================= SUBMIT ================= */

  const save = async () => {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await api.put(`${apiPrefix}/study-materials/${material.id}`, {
        title: form.title,
        description: form.description,
        video_url:
          material.type === "video" ? form.video_url : null,
        notes:
          material.type === "notes" ? form.notes : null,
      });

      onSaved();
      onClose();
    } catch {
      setError("Failed to update study material");
    } finally {
      setSaving(false);
    }
  };

  /* ================= HELPERS ================= */
  const getIcon = () => {
      if (material.type === 'pdf') return <FileText size={20} className="text-red-600" />;
      if (material.type === 'video') return <Video size={20} className="text-blue-600" />;
      return <StickyNote size={20} className="text-amber-600" />;
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border shadow-sm ${
                material.type === 'pdf' ? 'bg-red-50 border-red-100' :
                material.type === 'video' ? 'bg-blue-50 border-blue-100' :
                'bg-amber-50 border-amber-100'
            }`}>
                {getIcon()}
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-900">Edit Material</h2>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide flex items-center gap-1">
                    Updating <span className="font-bold text-slate-700">{material.type}</span> Content
                </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE FORM AREA */}
        <div className="p-6 space-y-5 overflow-y-auto">
            
            {/* TITLE */}
            <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                    <Type size={14} className="text-indigo-500" /> Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                    className="w-full bg-white border border-slate-300 text-slate-800 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-base shadow-sm placeholder:text-slate-300 placeholder:font-normal"
                    placeholder="e.g. Introduction to Physics"
                    value={form.title}
                    onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                    }
                    autoFocus
                    />
                    <Pencil size={16} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none opacity-50" />
                </div>
            </div>

            {/* DESCRIPTION */}
            <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                    <AlignLeft size={14} className="text-indigo-500" /> Description
                </label>
                <textarea
                className="w-full bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm placeholder:text-slate-300 resize-none"
                placeholder="Briefly describe the contents..."
                rows={3}
                value={form.description}
                onChange={(e) =>
                    setForm({
                    ...form,
                    description: e.target.value,
                    })
                }
                />
            </div>

            {/* TYPE SPECIFIC FIELDS */}
            <div className="pt-2 animate-in slide-in-from-bottom-2 duration-300">
                {material.type === "pdf" && (
                <div className="flex items-start gap-3 bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-blue-700 text-sm">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm text-blue-500">
                        <Info size={18} />
                    </div>
                    <div>
                        <span className="font-bold block mb-0.5">File Lock</span>
                        <p className="leading-relaxed text-blue-600/90 text-xs">The source PDF file cannot be replaced during editing. To change the file, please delete this material and upload a new one.</p>
                    </div>
                </div>
                )}

                {material.type === "video" && (
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                        <Link2 size={14} className="text-indigo-500" /> Video Source URL
                    </label>
                    <input
                        className="w-full bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm placeholder:text-slate-300 font-mono"
                        placeholder="https://youtube.com/..."
                        value={form.video_url}
                        onChange={(e) =>
                            setForm({
                            ...form,
                            video_url: e.target.value,
                            })
                        }
                    />
                </div>
                )}

                {material.type === "notes" && (
                <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                        <StickyNote size={14} className="text-indigo-500" /> Notes Content
                    </label>
                    <textarea
                        className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-sm shadow-inner placeholder:text-slate-400"
                        placeholder="# Type your markdown notes here..."
                        rows={6}
                        value={form.notes}
                        onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                        }
                    />
                </div>
                )}
            </div>

            {/* ERROR MESSAGE */}
            {error && (
            <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 animate-in slide-in-from-top-2 shadow-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span className="font-medium">{error}</span>
            </div>
            )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={save}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              saving
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300"
            }`}
          >
            {saving ? (
                <>
                 <span className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></span>
                 <span>Saving...</span>
                </>
            ) : (
                <>
                    <Save size={16} /> Save Changes
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}