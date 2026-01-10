import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import {
  X,
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
  
  // Added UI states for premium experience (loading & inline errors)
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    // Reset states on open
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

  const submit = async () => {
    // Basic frontend validation
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
      
      // Reset form
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ClipboardEdit size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Assignment</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Deploy new coursework</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE FORM AREA */}
        <div className="p-6 space-y-6 overflow-y-auto custom-dashboard-scroll flex-1">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* COURSE SELECTOR */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                <BookOpen size={14} className="text-indigo-500" /> Target Course <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <select
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-sm cursor-pointer"
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
                <BookOpen className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" size={16} />
                <ChevronDown className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* BATCH SELECTOR */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                <Layers size={14} className="text-indigo-500" /> Target Batch <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <select
                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                <Layers className={`absolute left-3.5 top-3.5 pointer-events-none transition-colors ${form.course_id ? 'text-slate-400 group-focus-within:text-indigo-500' : 'text-slate-300'}`} size={16} />
                <ChevronDown className={`absolute right-3.5 top-3.5 pointer-events-none ${form.course_id ? 'text-slate-400' : 'text-slate-300'}`} size={16} />
              </div>
            </div>
          </div>

          {/* TITLE INPUT */}
          <div>
             <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                <Type size={14} className="text-indigo-500" /> Assignment Title <span className="text-rose-500">*</span>
             </label>
             <input
              className="w-full bg-white border border-slate-200 text-slate-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm shadow-sm placeholder:text-slate-300 placeholder:font-normal"
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
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                <AlignLeft size={14} className="text-indigo-500" /> Description / Questions <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm placeholder:text-slate-300 resize-none"
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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                  <Link2 size={14} className="text-indigo-500" /> Reference Link <span className="text-slate-400 font-medium normal-case tracking-normal">(Optional)</span>
              </label>
              <div className="relative group">
                <input
                  className="w-full bg-white border border-slate-200 text-indigo-600 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm placeholder:text-slate-300 placeholder:text-slate-400"
                  placeholder="https://example.com/resource"
                  value={form.assignment_link}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      assignment_link: e.target.value,
                    })
                  }
                />
                <Link2 size={16} className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
              </div>
            </div>

            {/* DEADLINE */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                  <CalendarClock size={14} className="text-indigo-500" /> Submission Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm shadow-sm"
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
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                <UploadCloud size={14} className="text-indigo-500" /> Attached File <span className="text-slate-400 font-medium normal-case tracking-normal">(Optional)</span>
            </label>
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 group ${file ? "border-emerald-400 bg-emerald-50/50" : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 bg-slate-50/50"}`}>
              <label className="flex flex-col items-center gap-3 cursor-pointer w-full h-full relative">
                <div className={`p-3 rounded-full transition-all duration-300 ${file ? "bg-emerald-100 text-emerald-600 scale-110" : "bg-white border border-slate-200 text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-200 shadow-sm"}`}>
                  {file ? <CheckCircle2 size={24} /> : <UploadCloud size={24} />}
                </div>
                <div className="space-y-1">
                  <p className={`text-sm font-bold transition-colors ${file ? "text-emerald-800" : "text-slate-700 group-hover:text-indigo-700"}`}>
                    {file ? file.name : "Click to attach a document"}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOCX, or ZIP up to 25MB"}
                  </p>
                </div>
                <input
                  type="file"
                  hidden
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
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
                 <span>Deploying...</span>
               </>
            ) : (
              <>
                <Plus size={18} /> Create Assignment
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}