import { useState, useEffect } from "react";
import api from "../../../lib/api/apiClient";
import { 
  X, 
  Upload, 
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
  .catch(() => {});
  }, [open]);

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
  .catch(() => {});
  }, [courseId]);

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

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add Content</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Upload new study material for students</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE FORM AREA */}
        <div className="p-6 space-y-6 overflow-y-auto custom-dashboard-scroll">
          
          {/* TITLE INPUT */}
          <div>
             <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                <Type size={14} className="text-indigo-500" /> Title <span className="text-red-500">*</span>
             </label>
             <input
              className="w-full bg-white border border-slate-300 text-slate-800 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-base shadow-sm placeholder:text-slate-300 placeholder:font-normal"
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
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                <AlignLeft size={14} className="text-indigo-500" /> Description
            </label>
            <textarea
              className="w-full bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm placeholder:text-slate-300 resize-none"
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
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5 ml-1">
                <MousePointer2 size={14} className="text-indigo-500" /> Content Type
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
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 transform scale-[1.02]"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* CONDITIONAL INPUTS */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* PDF UPLOAD */}
            {form.type === "pdf" && (
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 group ${file ? "border-emerald-400 bg-emerald-50/50" : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30"}`}>
                <label className="flex flex-col items-center gap-3 cursor-pointer w-full h-full relative">
                  <div className={`p-4 rounded-full transition-all duration-300 ${file ? "bg-emerald-100 text-emerald-600 scale-110" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-indigo-500 group-hover:shadow-md"}`}>
                    {file ? <CheckCircle2 size={32} /> : <UploadCloud size={32} />}
                  </div>
                  <div className="space-y-1">
                    <p className={`text-sm font-bold transition-colors ${file ? "text-emerald-800" : "text-slate-700 group-hover:text-indigo-700"}`}>
                      {file ? file.name : "Click to upload PDF"}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
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
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                    <Link2 size={14} className="text-indigo-500" /> Video URL <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    className="w-full bg-white border border-slate-300 text-slate-700 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm placeholder:text-slate-300 font-mono"
                    placeholder="https://youtube.com/..."
                    value={form.video_url}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        video_url: e.target.value,
                      })
                    }
                  />
                  <Link2 size={16} className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                </div>
              </div>
            )}

            {/* NOTES TEXTAREA */}
            {form.type === "notes" && (
               <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                     <StickyNote size={14} className="text-indigo-500" /> Notes Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-sm shadow-inner placeholder:text-slate-400 resize-none"
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
          <div className="border-t border-slate-100 pt-6">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5 ml-1">
              <ShieldCheck size={14} className="text-indigo-500" /> Access Control
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
                  className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    accessType === t.id
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Dynamic Dropdowns based on access selection */}
            <div className="mt-4 space-y-3 animate-in fade-in duration-300">
              {(
                  isFaculty
                      ? accessType === "batch"
                      : (accessType === "course" || accessType === "batch")
              ) && (
                <div className="relative group">
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-sm cursor-pointer"
                  >
                    <option value="">Select Target Course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <BookOpen className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <ChevronDown className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" size={16} />
                </div>
              )}

              {accessType === "batch" && (
                <div className="relative group">
                  <select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    disabled={!courseId}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Target Batch</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <Layers className={`absolute left-3.5 top-3.5 pointer-events-none transition-colors ${courseId ? 'text-slate-400 group-focus-within:text-indigo-500' : 'text-slate-300'}`} size={16} />
                  <ChevronDown className={`absolute right-3.5 top-3.5 pointer-events-none ${courseId ? 'text-slate-400' : 'text-slate-300'}`} size={16} />
                </div>
              )}
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="flex items-center gap-3 text-sm text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100 animate-in slide-in-from-top-2 shadow-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-600 text-sm font-bold border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={submit}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 ${
              saving
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300"
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
        </div>
      </div>
    </div>
  );
}