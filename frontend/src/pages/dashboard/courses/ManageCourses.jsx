import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import {
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Calendar,
  Layers,
  Save,
  AlertCircle,
  Type,
  Hash,
  Inbox
} from "lucide-react";

/* ================= TOAST ================= */
function Toast({ message, type, onClose }) {
  if (!message) return null;

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border animate-in slide-in-from-bottom-5 fade-in duration-300 backdrop-blur-xl
      ${
        type === "error"
          ? "bg-[rgb(var(--zx-surface))] border-rose-500/30 text-rose-500 shadow-rose-500/10"
          : "bg-[rgb(var(--zx-surface))] border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-black/20"
      }`}
    >
      {type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} className="text-emerald-500"/>}
      <span className="text-sm font-bold tracking-wide">{message}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity ml-2">
        <X size={16} />
      </button>
    </div>
  );
}

/* ================= CONFIRM DELETE MODAL ================= */
function ConfirmDeleteModal({ open, title, message, onCancel, onConfirm, loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] w-full max-w-md rounded-3xl p-6 shadow-2xl scale-100 border border-[rgb(var(--zx-border))]">
        <div className="flex items-start gap-4">
          <div className="bg-rose-500/10 p-3 rounded-2xl text-rose-500 shrink-0 border border-rose-500/20">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[rgb(var(--zx-text))]">{title}</h2>
            <p className="text-sm text-[rgb(var(--zx-text-muted))] leading-relaxed font-medium">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-[rgb(var(--zx-border))]">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-rose-600/20"
          >
            {loading ? (
                 <>
                   <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   <span>Deleting...</span>
                 </>
            ) : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= EDIT COURSE MODAL ================= */
function EditCourseModal({ open, course, onClose, onSaved, onError }) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    amount: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (course) setForm({
      name: course.name,
      code: course.code,
      amount: course.amount || "",
    });
  }, [course]);

  if (!open || !course) return null;

  const save = async () => {
    try {
      setSaving(true);
      await api.put(`/admin/courses/${course.id}`, {
        ...form,
        amount: form.amount || 0,
      });
      onSaved();
    } catch (e) {
      onError?.(e?.response?.data?.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-[rgb(var(--zx-border))]">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[rgb(var(--zx-border))] flex justify-between items-center bg-[rgb(var(--zx-surface-hover))]/50">
          <div className="flex items-center gap-3">
             <div className="bg-brand-teal-500/10 p-2.5 rounded-xl border border-brand-teal-500/20 text-brand-teal-500">
                <BookOpen size={20} />
            </div>
            <div>
                 <h2 className="text-lg font-bold text-[rgb(var(--zx-text))]">Edit Course</h2>
                 <p className="text-[11px] text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-wider">Update course details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface-hover))] p-2 rounded-xl transition-colors">
             <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                 <Type size={14} className="text-brand-teal-500" /> Course Name
              </label>
              <input
              className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Bachelor of Technology"
            />
          </div>

          <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                 <Hash size={14} className="text-brand-teal-500" /> Course Code
              </label>
              <input
              className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-mono font-medium text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="e.g. CS-101"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))] mb-1.5 ml-1 block">
              Course Fees
            </label>
            <input
              type="number"
              className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Enter amount or leave empty for free"
            />
          </div>

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))]/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[rgb(var(--zx-text-muted))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] hover:text-[rgb(var(--zx-text))] transition-all border border-[rgb(var(--zx-border))]"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
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
        </div>
      </div>
    </div>
  );
}

/* ================= EDIT BATCH MODAL ================= */
function EditBatchModal({ open, batch, onClose, onSaved, onError }) {
  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (batch) setForm(batch);
  }, [batch]);

  if (!open || !batch) return null;

  const save = async () => {
    try {
      setSaving(true);
      await api.put(`/admin/batches/${batch.id}`, form);
      onSaved(batch.course_id);
    } catch (e) {
      onError?.(e?.response?.data?.message || "Failed to save batch");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-[rgb(var(--zx-border))]">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[rgb(var(--zx-border))] flex justify-between items-center bg-[rgb(var(--zx-surface-hover))]/50">
          <div className="flex items-center gap-3">
             <div className="bg-brand-teal-500/10 p-2.5 rounded-xl border border-brand-teal-500/20 text-brand-teal-500">
                <Layers size={20} />
            </div>
            <div>
                 <h2 className="text-lg font-bold text-[rgb(var(--zx-text))]">Edit Batch</h2>
                 <p className="text-[11px] text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-wider">Update batch timeline</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface-hover))] p-2 rounded-xl transition-colors">
             <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                 <Type size={14} className="text-brand-teal-500" /> Batch Name
              </label>
              <input
              className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. 2024-2028"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                   <Calendar size={14} className="text-brand-teal-500" /> Start Date
                </label>
                <input
                    className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-xs shadow-sm"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    type="date"
                  />
             </div>
             <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                   <Calendar size={14} className="text-brand-teal-500" /> End Date
                </label>
                <input
                    className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-xs shadow-sm"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    type="date"
                  />
             </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))]/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[rgb(var(--zx-text-muted))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] hover:text-[rgb(var(--zx-text))] transition-all border border-[rgb(var(--zx-border))]"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
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
        </div>
      </div>
    </div>
  );
}

/* ================= MAIN ================= */
export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [batches, setBatches] = useState({});

  const [batchLoading, setBatchLoading] = useState({});

  const [editCourse, setEditCourse] = useState(null);
  const [editBatch, setEditBatch] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState({ message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type }), 3000);
  };

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/courses");
      setCourses(res.data);
    } catch (error) {
      console.warn("Failed to load courses. Session might be inactive.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadBatches = async (courseId) => {
    setBatchLoading((prev) => ({ ...prev, [courseId]: true }));

    try {
      const res = await api.get(`/admin/courses/${courseId}/batches`);
      setBatches((p) => ({ ...p, [courseId]: res.data }));
    } catch {
      setBatches((p) => ({ ...p, [courseId]: [] }));
    } finally {
      setBatchLoading((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const toggleCourseStatus = async (course) => {
    try {
      await api.patch(`/admin/courses/${course.id}/toggle`);
      loadCourses();
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to update course status", "error");
    }
  };

  const toggleBatchStatus = async (batch, courseId) => {
    try {
      await api.patch(`/admin/batches/${batch.id}/toggle`);
      loadBatches(courseId);
    } catch (e) {
      showToast(e?.response?.data?.message || "Failed to update batch status", "error");
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);

      if (deleteType === "course") {
        await api.delete(`/admin/courses/${deleteTarget.id}`);
        showToast("Course deleted successfully");
      } else {
        await api.delete(`/admin/batches/${deleteTarget.id}`);
        showToast("Batch deleted successfully");
      }

      if (deleteType === "course") {
        loadCourses();
      } else {
        loadBatches(deleteTarget.course_id);
      }

    } catch (e) {
      if (e?.response?.status === 409) {
        showToast(e.response.data.message, "error");
      } else {
        showToast("Deletion failed", "error");
      }
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
      setDeleteType(null);
    }
  };

  // Consistent Grid Layout
  const gridLayout = "grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 items-center";

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 pt-0 space-y-8 animate-fade-in font-sans">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
            <BookOpen size={14} strokeWidth={2.5} />
            Academic Hub
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Manage Courses
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            View and manage academic courses, batches, and their active status.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-3xl shadow-sm overflow-hidden min-h-[400px] relative z-10">
        
        {/* Table Header */}
        <div className={`${gridLayout} px-6 py-4 bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))] text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider`}>
          <div>Course Name</div>
          <div>Code</div>
          <div>Fees</div>
          <div className="text-center">Status</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-[rgb(var(--zx-border))]">
          {isLoading ? (
             <div className="p-20 flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
             <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
             <span className="font-medium text-sm">Loading courses...</span>
          </div>
          ) : courses.length === 0 ? (
             <div className="px-6 py-20 text-center text-[rgb(var(--zx-text-muted))]">
               <div className="flex flex-col items-center justify-center">
                 <Inbox size={48} className="mb-4 opacity-20" />
                 <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No courses found</p>
               </div>
             </div>
          ) : (
            courses.map((c) => (
              <div key={c.id} className="group transition-colors bg-[rgb(var(--zx-surface))]">
                {/* Course Row */}
                <div
                  className={`${gridLayout} px-6 py-5 cursor-pointer transition-all duration-200 border-l-[3px] ${
                      expanded === c.id 
                      ? "bg-brand-teal-500/5 border-l-brand-teal-500" 
                      : "hover:bg-[rgb(var(--zx-surface-hover))] border-l-transparent"
                  }`}
                  onClick={async () => {
                    const open = expanded === c.id ? null : c.id;
                    setExpanded(open);
                    if (open) await loadBatches(c.id);
                  }}
                >
                  <div className="font-bold text-[rgb(var(--zx-text))] flex items-center gap-3 text-sm md:text-base">
                      <div className={`p-2 rounded-xl transition-colors ${expanded === c.id ? "bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20" : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))]"}`}>
                          <BookOpen size={16} />
                      </div>
                      {c.name}
                  </div>
                  
                  <div>
                      <span className="font-mono text-xs font-semibold text-[rgb(var(--zx-text-muted))] bg-[rgb(var(--zx-surface-hover))] px-2.5 py-1 rounded-lg border border-[rgb(var(--zx-border))] inline-block">
                          {c.code}
                      </span>
                  </div>
                  <div className="text-sm font-semibold text-[rgb(var(--zx-text))]">
                    ₹{c.amount > 0 ? c.amount : "Free"}
                  </div>

                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border capitalize tracking-widest ${
                        c.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                      {c.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={() => setEditCourse(c)}
                      className="p-2 text-[rgb(var(--zx-text-muted))] hover:text-brand-teal-500 hover:bg-brand-teal-500/10 rounded-xl transition-all"
                      title="Edit Course"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => toggleCourseStatus(c)}
                      className={`p-2 rounded-xl transition-all ${c.status === 'active' ? 'text-[rgb(var(--zx-text-muted))] hover:text-emerald-600 hover:bg-emerald-500/10' : 'text-[rgb(var(--zx-text-muted))] hover:text-rose-600 hover:bg-rose-500/10'}`}
                      title="Toggle Status"
                    >
                      {c.status === "active" ? (
                        <ToggleRight size={20} className="text-emerald-500" />
                      ) : (
                        <ToggleLeft size={20} />
                      )}
                    </button>

                    <div className="w-px h-4 bg-[rgb(var(--zx-border))] mx-1"></div>

                    <button
                      onClick={() => {
                        setDeleteTarget(c);
                        setDeleteType("course");
                      }}
                      className="p-2 text-[rgb(var(--zx-text-muted))] hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all"
                      title="Delete Course"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                      <div className={`ml-2 p-1.5 rounded-xl transition-all duration-300 ${expanded === c.id ? "rotate-180 bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text))]" : "text-[rgb(var(--zx-text-muted))]"}`}>
                        <ChevronDown size={14} />
                      </div>
                  </div>
                </div>

                {/* Nested Batches Section */}
                {expanded === c.id && (
                  <div className="bg-[rgb(var(--zx-surface-hover))]/50 border-t border-[rgb(var(--zx-border))] shadow-inner animate-in slide-in-from-top-2 duration-300">
                      <div className="px-6 py-5">
                          <div className="flex items-center gap-2 mb-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider pl-1">
                              <Layers size={14} className="text-brand-teal-500"/> Associated Batches
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pl-4 border-l-2 border-[rgb(var(--zx-border))]">
                               {batchLoading[c.id] ? (
                                  <div className="flex flex-col items-center justify-center py-6 text-[rgb(var(--zx-text-muted))]">
                                    <div className="w-5 h-5 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin mb-2"></div>
                                    <span className="text-xs font-medium">Loading batches...</span>
                                  </div>
                                ) : (batches[c.id] || []).length === 0 ? (
                                  <div className="text-sm text-[rgb(var(--zx-text-muted))] italic py-2 pl-2">
                                    No batches found for this course.
                                  </div>
                                ) : null}
                              {(batches[c.id] || []).map((b) => (
                                  <div
                                  key={b.id}
                                  className="flex items-center justify-between bg-[rgb(var(--zx-surface))] p-4 rounded-2xl border border-[rgb(var(--zx-border))] hover:border-brand-teal-500/40 hover:shadow-md transition-all group/batch"
                                  >
                                      <div>
                                          <div className="font-bold text-sm text-[rgb(var(--zx-text))]">{b.name}</div>
                                          <div className="text-xs text-[rgb(var(--zx-text-muted))] mt-1 flex items-center gap-1.5 font-medium">
                                              <Calendar size={12}/> {new Date(b.start_date).toLocaleDateString("en-GB")} – {new Date(b.end_date).toLocaleDateString("en-GB")}
                                          </div>
                                      </div>

                                      {/* Action Area */}
                                      <div className="flex items-center gap-3">
                                          {/* Status Badge */}
                                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-widest ${b.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                                              {b.status}
                                          </span>

                                          <div className="flex items-center gap-1">
                                              <button 
                                                  onClick={() => setEditBatch(b)}
                                                  className="p-1.5 text-[rgb(var(--zx-text-muted))] hover:text-brand-teal-500 hover:bg-brand-teal-500/10 rounded-xl transition-all"
                                                  title="Edit Batch"
                                              >
                                                  <Pencil size={14} />
                                              </button>

                                              <button
                                                  onClick={() => toggleBatchStatus(b, c.id)}
                                                  className={`p-1.5 rounded-xl transition-all ${b.status === 'active' ? 'text-[rgb(var(--zx-text-muted))] hover:text-emerald-600 hover:bg-emerald-500/10' : 'text-[rgb(var(--zx-text-muted))] hover:text-rose-600 hover:bg-rose-500/10'}`}
                                                  title="Toggle Status"
                                              >
                                                  {b.status === "active" ? (
                                                  <ToggleRight size={18} />
                                                  ) : (
                                                  <ToggleLeft size={18} />
                                                  )}
                                              </button>

                                              <button
                                                  onClick={() => {
                                                  setDeleteTarget(b);
                                                  setDeleteType("batch");
                                                  }}
                                                  className="p-1.5 text-[rgb(var(--zx-text-muted))] hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-all"
                                                  title="Delete Batch"
                                              >
                                                  <Trash2 size={14} />
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <EditCourseModal
        open={!!editCourse}
        course={editCourse}
        onClose={() => setEditCourse(null)}
        onError={(message) => showToast(message, "error")}
        onSaved={() => {
          setEditCourse(null);
          loadCourses();
          showToast("Course updated successfully");
        }}
      />

      <EditBatchModal
        open={!!editBatch}
        batch={editBatch}
        onClose={() => setEditBatch(null)}
        onError={(message) => showToast(message, "error")}
        onSaved={(courseId) => {
          setEditBatch(null);
          loadBatches(courseId);
          showToast("Batch updated successfully");
        }}
      />

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title={`Delete ${deleteType === "course" ? "Course" : "Batch"}`}
        message={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: toast.type })}
      />
    </div>
  );
}