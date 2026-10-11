import { useState, useEffect } from "react";
import api from "../../../lib/api/apiClient";
import AppModal from "../../../components/common/AppModal";
import { 
  Link2, 
  FileText, 
  Video, 
  StickyNote, 
  AlertCircle, 
  Plus, 
  CheckCircle2,
  UploadCloud,
  Type,
  AlignLeft,
  MousePointer2,
  ShieldCheck,
  Users,
  BookOpen,
  Layers,
  ChevronDown,
  Loader2
} from "lucide-react";

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

export default function AddMaterialModal({
      open,
      onClose,
      onSaved,
      apiPrefix="/admin",
      isFaculty=false,
  }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "pdf", // pdf | video | notes
    video_url: "",
    notes: "",
  });

  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [accessType, setAccessType] = useState(
      isFaculty ? "batch" : "all"
  );
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");

  useEffect(() => {
    if (!open) return;

    api.get(
      isFaculty
          ? "/faculty/course-options"
          : "/admin/courses"
  )
  .then((res) => setCourses(res.data))
  .catch(() => {
    setCourses([]);
    setError("Could not load course options. Please close and reopen this dialog.");
  });
  }, [open, isFaculty]);

  useEffect(() => {
    if (!courseId) {
      setBatches([]);
      setBatchId("");
      return;
    }

    api.get(
      isFaculty
          ? `/faculty/course-options/${courseId}/batches`
          : `/admin/courses/${courseId}/batches`
  )
  .then((res) => setBatches(res.data))
  .catch(() => {
    setBatches([]);
    setError("Could not load batches for the selected course.");
  });
  }, [courseId, isFaculty]);

  if (!open) return null;

  /* ================= VALIDATION ================= */

  const validate = () => {
    if (!form.title.trim()) return "Title is required";

    if (form.type === "pdf" && !file)
      return "Please upload a PDF file";

    if (form.type === "video" && !form.video_url.trim())
      return "Video URL is required";

    if (form.type === "notes" && !form.notes.trim())
      return "Notes content is required";

    if (accessType === "batch" && (!courseId || !batchId))
      return "Please select course and batch";

    return null;
  };

  /* ================= SUBMIT ================= */

  const submit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("description", form.description || "");
      data.append("type", form.type);

      if (form.type === "pdf") {
        data.append("file", file);
      }

      if (form.type === "video") {
        data.append("video_url", form.video_url);
      }

      if (form.type === "notes") {
        data.append("notes", form.notes);
      }

      const materialRes = await api.post(
        `${apiPrefix}/study-materials`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const materialId = materialRes.data.id;

      await api.post(
       `${apiPrefix}/study-materials/${materialId}/access`,
        {
          access_type: accessType,
          course_id:
              accessType === "batch"
                  ? courseId
                  : null,

          batch_id:
              accessType === "batch"
                  ? batchId
                  : null,
        }
      );

      onSaved();
      reset();
    } catch {
      setError("Failed to add study material");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setForm({
      title: "",
      description: "",
      type: "pdf",
      video_url: "",
      notes: "",
    });
    setFile(null);
    setError("");
    setAccessType(
        isFaculty ? "batch" : "all"
    );
    setCourseId("");
    setBatchId("");
    setBatches([]);
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Add Content"
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
            onClick={submit}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              saving
                ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
                : "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-brand-teal-500/20"
            }`}
          >
            {saving ? (
               <>
                 <Loader2 size={16} className="animate-spin" />
                 <span>Uploading...</span>
               </>
            ) : (
              <>
                <Plus size={18} /> Create Material
              </>
            )}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        
        {/* SUBHEADER CONTEXT */}
        <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2">
          Upload new study material for students
        </p>

        {/* TITLE INPUT */}
        <div>
           <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
              <Type size={14} className="text-brand-teal-500" /> Title <span className="text-rose-500">*</span>
           </label>
           <input
            className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-bold text-base shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal"
            placeholder="e.g. Chapter 1: Calculus Basics"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            autoFocus
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
              <AlignLeft size={14} className="text-brand-teal-500" /> Description
          </label>
          <textarea
            className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 resize-none"
            placeholder="Brief summary of the content..."
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        {/* TYPE SELECTOR */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-2 flex items-center gap-1.5 ml-1">
              <MousePointer2 size={14} className="text-brand-teal-500" /> Content Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "pdf", label: "PDF File", icon: <FileText size={18} /> },
              { id: "video", label: "Video Link", icon: <Video size={18} /> },
              { id: "notes", label: "Text Notes", icon: <StickyNote size={18} /> }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setForm({ ...form, type: t.id })}
                className={`flex flex-col items-center justify-center gap-2 py-3.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                  form.type === t.id
                    ? "bg-brand-teal-500 text-white border-brand-teal-500 shadow-md shadow-brand-teal-500/20 transform scale-[1.02]"
                    : "bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text-muted))] border-[rgb(var(--zx-border))] hover:bg-[rgb(var(--zx-surface-hover))] hover:text-[rgb(var(--zx-text))]"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONDITIONAL INPUTS */}
        <div>
          
          {/* PDF UPLOAD */}
          {form.type === "pdf" && (
            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 group ${file ? "border-emerald-500 bg-emerald-500/10" : "border-[rgb(var(--zx-border))] hover:border-brand-teal-500 bg-[rgb(var(--zx-surface-hover))]/50"}`}>
              <label className="flex flex-col items-center gap-3 cursor-pointer w-full h-full relative">
                <div className={`p-4 rounded-2xl transition-all duration-300 ${file ? "bg-emerald-500/20 text-emerald-500 scale-110" : "bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] group-hover:bg-brand-teal-500/10 group-hover:text-brand-teal-500"}`}>
                  {file ? <CheckCircle2 size={32} /> : <UploadCloud size={32} />}
                </div>
                <div className="space-y-1">
                  <p className={`text-sm font-bold transition-colors ${file ? "text-emerald-500" : "text-[rgb(var(--zx-text))]"}`}>
                    {file ? file.name : "Click to upload PDF"}
                  </p>
                  <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Max file size 10MB"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
            </div>
          )}

          {/* VIDEO URL */}
          {form.type === "video" && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                  <Link2 size={14} className="text-brand-teal-500" /> Video URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <input
                  className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 font-mono"
                  placeholder="https://youtube.com/..."
                  value={form.video_url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      video_url: e.target.value,
                    })
                  }
                />
                <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--zx-text-muted))] pointer-events-none" />
              </div>
            </div>
          )}

          {/* NOTES TEXTAREA */}
          {form.type === "notes" && (
             <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                   <StickyNote size={14} className="text-brand-teal-500" /> Notes Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-mono text-sm shadow-inner placeholder:text-[rgb(var(--zx-text-muted))]/60 resize-none"
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

        {/* ACCESS CONTROL */}
        <div className="border-t border-[rgb(var(--zx-border))] pt-6">
          <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-3 flex items-center gap-1.5 ml-1">
            <ShieldCheck size={14} className="text-brand-teal-500" /> Access Control
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(isFaculty
              ? [
                  {
                      id: "batch",
                      label: "Assigned Batch",
                      icon: <Layers size={16}/>
                  }
                ]
              : [
                  {
                      id: "all",
                      label: "All Students",
                      icon: <Users size={16}/>
                  },
                  {
                      id: "course",
                      label: "By Course",
                      icon: <BookOpen size={16}/>
                  },
                  {
                      id: "batch",
                      label: "By Batch",
                      icon: <Layers size={16}/>
                  }
              ]
          ).map((t) => (
              <button
                key={t.id}
                onClick={() => setAccessType(t.id)}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                  accessType === t.id
                    ? "bg-brand-teal-500/10 text-brand-teal-500 border-brand-teal-500/30 shadow-sm"
                    : "bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text-muted))] border-[rgb(var(--zx-border))] hover:bg-[rgb(var(--zx-surface-hover))] hover:text-[rgb(var(--zx-text))]"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Dynamic Dropdowns based on access selection */}
          <div className="mt-4 space-y-3">
            {(
                isFaculty
                    ? accessType === "batch"
                    : (accessType === "course" || accessType === "batch")
            ) && (
              <div className="relative group">
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm cursor-pointer"
                >
                  <option value="">Select Target Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <BookOpen className="absolute left-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
                <ChevronDown className="absolute right-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
              </div>
            )}

            {accessType === "batch" && (
              <div className="relative group">
                <select
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  disabled={!courseId}
                  className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Target Batch</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <Layers className="absolute left-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
                <ChevronDown className="absolute right-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
              </div>
            )}
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="flex items-center gap-3 text-sm text-rose-500 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 shadow-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}
      </div>
    </AppModal>
  );
}