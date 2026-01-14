import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import AppModal from "../../../components/common/AppModal";
import { 
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
      if (material.type === 'pdf') return <FileText size={20} className="text-rose-500" />;
      if (material.type === 'video') return <Video size={20} className="text-blue-500" />;
      return <StickyNote size={20} className="text-amber-500" />;
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Edit Material"
      size="lg"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={save}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              saving
                ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
                : "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-brand-teal-500/20"
            }`}
          >
            {saving ? (
                <>
                 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                 <span>Saving...</span>
                </>
            ) : (
                <>
                    <Save size={16} /> Save Changes
                </>
            )}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        
        {/* SUBHEADER CONTEXT */}
        <div className="flex items-center gap-3 -mt-2 pb-4 border-b border-[rgb(var(--zx-border))]">
          <div className={`p-2.5 rounded-xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))] shadow-sm`}>
              {getIcon()}
          </div>
          <div>
              <p className="text-xs text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  Updating <span className="font-bold text-[rgb(var(--zx-text))] uppercase">{material.type}</span> Content
              </p>
          </div>
        </div>

        {/* SCROLLABLE FORM AREA */}
        <div className="space-y-5">
            
            {/* TITLE */}
            <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                    <Type size={14} className="text-brand-teal-500" /> Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                    <input
                    className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-bold text-base shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal"
                    placeholder="e.g. Introduction to Physics"
                    value={form.title}
                    onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                    }
                    autoFocus
                    />
                    <Pencil size={16} className="absolute right-4 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none opacity-50" />
                </div>
            </div>

            {/* DESCRIPTION */}
            <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                    <AlignLeft size={14} className="text-brand-teal-500" /> Description
                </label>
                <textarea
                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 resize-none"
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
            <div className="pt-2">
                {material.type === "pdf" && (
                <div className="flex items-start gap-3 bg-brand-teal-500/10 border border-brand-teal-500/20 p-4 rounded-2xl text-[rgb(var(--zx-text))] text-sm">
                    <div className="bg-[rgb(var(--zx-surface))] p-1.5 rounded-xl shadow-sm text-brand-teal-500 border border-[rgb(var(--zx-border))] shrink-0">
                        <Info size={18} />
                    </div>
                    <div>
                        <span className="font-bold block mb-0.5">File Lock</span>
                        <p className="leading-relaxed text-[rgb(var(--zx-text-muted))] text-xs">The source PDF file cannot be replaced during editing. To change the file, please delete this material and upload a new one.</p>
                    </div>
                </div>
                )}

                {material.type === "video" && (
                <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                        <Link2 size={14} className="text-brand-teal-500" /> Video Source URL
                    </label>
                    <input
                        className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 font-mono"
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
                    <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                        <StickyNote size={14} className="text-brand-teal-500" /> Notes Content
                    </label>
                    <textarea
                        className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-mono text-sm shadow-inner placeholder:text-[rgb(var(--zx-text-muted))]/60"
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
            <div className="flex items-center gap-3 text-sm text-rose-500 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 shadow-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span className="font-semibold">{error}</span>
            </div>
            )}
        </div>
      </div>
    </AppModal>
  );
}