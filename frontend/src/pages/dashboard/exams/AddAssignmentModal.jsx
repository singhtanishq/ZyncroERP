import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import AppModal from "../../../components/common/AppModal";
import {
  BookOpen,
  Layers,
  Type,
  AlignLeft,
  Link2,
  UploadCloud,
  CheckCircle2,
  CalendarClock,
  Plus,
  Loader2,
  AlertCircle,
  ClipboardEdit,
  ChevronDown
} from "lucide-react";

// Mirrors backend validation: mimes:pdf,doc,docx,ppt,pptx,zip | max:20480 (KB)
const ALLOWED_FILE_EXTENSIONS = ["pdf", "doc", "docx", "ppt", "pptx", "zip"];
const MAX_FILE_SIZE_KB = 20480;

export default function AddAssignmentModal({
  apiPrefix = "/admin",
  open,
  onClose,
  onSuccess,
}) {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [form, setForm] = useState({
    course_id: "",
    batch_id: "",
    title: "",
    question: "",
    assignment_link: "",
    deadline: "",
  });

  const [file, setFile] = useState(null);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setError("");
    setSaving(false);
    
    const courseEndpoint =
      apiPrefix === "/faculty"
        ? "/faculty/course-options"
        : `${apiPrefix}/courses`;

    api.get(courseEndpoint)
      .then((res) => setCourses(res.data))
      .catch(() => setError("Failed to load courses."));
  }, [open, apiPrefix]);

  const loadBatches = async (courseId) => {
    if (!courseId) {
      setBatches([]);
      return;
    }

    try {
      const batchEndpoint =
        apiPrefix === "/faculty"
          ? `/faculty/course-options/${courseId}/batches`
          : `${apiPrefix}/courses/${courseId}/batches`;

      const res = await api.get(batchEndpoint);
      setBatches(res.data);
    } catch {
      setError("Failed to load batches.");
    }
  };

  const uploadFile = async () => {
    if (!file) return null;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("course_id", form.course_id);
    fd.append("batch_id", form.batch_id);

    const res = await api.post(
        `${apiPrefix}/assignments/upload-file`,
        fd,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return res.data.path;
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after a rejection

    if (!selected) return;

    const extension = selected.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_FILE_EXTENSIONS.includes(extension)) {
      setFile(null);
      setError(
        "Invalid file type. Allowed types: PDF, DOC, DOCX, PPT, PPTX, ZIP."
      );
      return;
    }

    if (selected.size > MAX_FILE_SIZE_KB * 1024) {
      setFile(null);
      setError("File is too large. Maximum allowed size is 20 MB.");
      return;
    }

    setError("");
    setFile(selected);
  };

  const submit = async () => {
    if (!form.course_id || !form.batch_id || !form.title || !form.question || !form.deadline) {
      setError("Please fill in all mandatory fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      
      let assignment_file = null;

      if (file) {
        assignment_file = await uploadFile();
      }

      await api.post(`${apiPrefix}/assignments`, {
        ...form,
        assignment_file,
      });

      onSuccess();
      onClose();
      
      setForm({
        course_id: "",
        batch_id: "",
        title: "",
        question: "",
        assignment_link: "",
        deadline: "",
      });
      setFile(null);

    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create assignment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Create Assignment"
      size="xl"
      footer={
        <div className="w-full flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={submit}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-teal-500 hover:bg-brand-teal-600 shadow-lg shadow-brand-teal-500/20 transition-all active:scale-95 flex items-center gap-2 ${
              saving ? "opacity-70 cursor-not-allowed shadow-none" : ""
            }`}
          >
            {saving ? (
               <>
                 <Loader2 size={16} className="animate-spin" />
                 <span>Deploying...</span>
               </>
            ) : (
              <>
                <Plus size={18} /> Create Assignment
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* SUBHEADER CONTEXT */}
        <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2">
          Deploy new coursework
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* COURSE SELECTOR */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
              <BookOpen size={14} className="text-brand-teal-500" /> Target Course <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <select
                className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm cursor-pointer shadow-sm"
                value={form.course_id}
                onChange={(e) => {
                  setForm({
                    ...form,
                    course_id: e.target.value,
                    batch_id: "",
                  });
                  loadBatches(e.target.value);
                }}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <BookOpen className="absolute left-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
              <ChevronDown className="absolute right-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
            </div>
          </div>

          {/* BATCH SELECTOR */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
              <Layers size={14} className="text-brand-teal-500" /> Target Batch <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <select
                className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                value={form.batch_id}
                disabled={!form.course_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    batch_id: e.target.value,
                  })
                }
              >
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <Layers className="absolute left-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
              <ChevronDown className="absolute right-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* TITLE INPUT */}
        <div>
           <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
              <Type size={14} className="text-brand-teal-500" /> Assignment Title <span className="text-rose-500">*</span>
           </label>
           <input
            className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-bold text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal"
            placeholder="e.g. Week 1: Algorithm Analysis"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />
        </div>

        {/* QUESTION TEXTAREA */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
              <AlignLeft size={14} className="text-brand-teal-500" /> Description / Questions <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={5}
            className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 resize-none"
            placeholder="Detail the assignment tasks or instructions here..."
            value={form.question}
            onChange={(e) =>
              setForm({
                ...form,
                question: e.target.value,
              })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* REFERENCE LINK */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                <Link2 size={14} className="text-brand-teal-500" /> Reference Link <span className="text-[rgb(var(--zx-text-muted))] font-medium normal-case tracking-normal">(Optional)</span>
            </label>
            <div className="relative group">
              <input
                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-brand-teal-500 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                placeholder="https://example.com/resource"
                value={form.assignment_link}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assignment_link: e.target.value,
                  })
                }
              />
              <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--zx-text-muted))] pointer-events-none" />
            </div>
          </div>

          {/* DEADLINE */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                <CalendarClock size={14} className="text-brand-teal-500" /> Submission Deadline <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-bold text-sm shadow-sm cursor-pointer"
              value={form.deadline}
              onChange={(e) =>
                setForm({
                  ...form,
                  deadline: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* FILE UPLOAD */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
              <UploadCloud size={14} className="text-brand-teal-500" /> Attached File <span className="text-[rgb(var(--zx-text-muted))] font-medium normal-case tracking-normal">(Optional)</span>
          </label>
          <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 group ${file ? "border-emerald-500 bg-emerald-500/10" : "border-[rgb(var(--zx-border))] hover:border-brand-teal-500 bg-[rgb(var(--zx-surface-hover))]/50"}`}>
            <label className="flex flex-col items-center gap-3 cursor-pointer w-full h-full relative">
              <div className={`p-3 rounded-2xl transition-all duration-300 ${file ? "bg-emerald-500/20 text-emerald-500 scale-110" : "bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] group-hover:text-brand-teal-500 group-hover:border-brand-teal-500/40 shadow-sm"}`}>
                {file ? <CheckCircle2 size={24} /> : <UploadCloud size={24} />}
              </div>
              <div className="space-y-1">
                <p className={`text-sm font-bold transition-colors ${file ? "text-emerald-500" : "text-[rgb(var(--zx-text))]"}`}>
                  {file ? file.name : "Click to attach a document"}
                </p>
                <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOC, DOCX, PPT, PPTX, or ZIP up to 20MB"}
                </p>
              </div>
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                onChange={handleFileChange}
              />
            </label>
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