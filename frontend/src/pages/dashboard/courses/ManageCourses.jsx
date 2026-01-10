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
      className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border animate-in slide-in-from-bottom-5 fade-in duration-300
      ${
        type === "error"
          ? "bg-white border-red-100 text-red-600 shadow-red-100"
          : "bg-slate-900 border-slate-700 text-white shadow-slate-300"
      }`}
    >
      {type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} className="text-emerald-400"/>}
      <span className="text-sm font-semibold tracking-wide">{message}</span>
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl scale-100 border border-slate-100">
        <div className="flex items-start gap-4">
          <div className="bg-red-50 p-3 rounded-full text-red-600 shrink-0 border border-red-100">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-2">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-red-200"
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
function EditCourseModal({ open, course, onClose, onSaved }) {
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm text-indigo-600">
                <BookOpen size={20} />
            </div>
            <div>
                 <h2 className="text-xl font-bold text-slate-900">Edit Course</h2>
                 <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Update course details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors">
             <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                 <Type size={14} className="text-indigo-500" /> Course Name
              </label>
              <input
              className="w-full bg-white border border-slate-300 text-slate-800 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm shadow-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Bachelor of Technology"
            />
          </div>

          <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                 <Hash size={14} className="text-indigo-500" /> Course Code
              </label>
              <input
              className="w-full bg-white border border-slate-300 text-slate-800 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-medium text-sm shadow-sm"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="e.g. CS-101"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
              Course Fees
            </label>

            <input
              type="number"
              className="w-full bg-white border border-slate-300 px-4 py-2.5 rounded-xl"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="Enter amount or leave empty for free"
            />
          </div>

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
            onClick={save}
            disabled={saving}
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

/* ================= EDIT BATCH MODAL ================= */
function EditBatchModal({ open, batch, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (batch) setForm(batch);
  }, [batch]);

  if (!open || !batch) return null;

  const save = async () => {
    await api.put(`/admin/batches/${batch.id}`, form);
    onSaved(batch.course_id);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm text-purple-600">
                <Layers size={20} />
            </div>
            <div>
                 <h2 className="text-xl font-bold text-slate-900">Edit Batch</h2>
                 <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Update batch timeline</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors">
             <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                 <Type size={14} className="text-purple-500" /> Batch Name
              </label>
              <input
              className="w-full bg-white border border-slate-300 text-slate-800 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-sm shadow-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. 2024-2028"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                   <Calendar size={14} className="text-purple-500" /> Start Year
                </label>
                <input
                    className="w-full bg-white border border-slate-300 text-slate-800 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-sm shadow-sm placeholder:text-slate-300"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    type="date"
                  />
             </div>
             <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                   <Calendar size={14} className="text-purple-500" /> End Year
                </label>
                <input
                    className="w-full bg-white border border-slate-300 text-slate-800 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium text-sm shadow-sm placeholder:text-slate-300"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    type="date"
                  />
             </div>
          </div>
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
            onClick={save}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-black shadow-lg shadow-slate-300 transition-all flex items-center gap-2 active:scale-95"
          >
            <Save size={16} /> Save Changes
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
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans">
      
      {/* HEADER SECTION (Strictly Adhering to User Preference) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <BookOpen className="text-blue-600" size={32} />
            Manage Courses
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            View and manage academic courses, batches, and their active status.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
        
        {/* Table Header */}
        <div className={`${gridLayout} px-6 py-4 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider backdrop-blur-sm`}>
          <div>Course Name</div>
          <div>Code</div>
          <div>Fees</div>
          <div className="text-center">Status</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100">
          {isLoading ? (
             <div className="p-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
             <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
             <span className="font-medium">Loading courses...</span>
          </div>
          ) : courses.length === 0 ? (
             <div className="px-6 py-20 text-center text-slate-400">
               <div className="flex flex-col items-center justify-center">
                 <Inbox size={48} className="mb-4 opacity-20" />
                 <p className="text-lg font-medium text-slate-600">No courses found</p>
               </div>
             </div>
          ) : (
            courses.map((c) => (
              <div key={c.id} className="group transition-colors bg-white">
                {/* Course Row */}
                <div
                  className={`${gridLayout} px-6 py-5 cursor-pointer transition-all duration-200 border-l-[3px] ${
                      expanded === c.id 
                      ? "bg-indigo-50/30 border-l-indigo-600" 
                      : "hover:bg-slate-50/50 border-l-transparent"
                  }`}
                  onClick={async () => {
                    const open = expanded === c.id ? null : c.id;
                    setExpanded(open);
                    if (open) await loadBatches(c.id);
                  }}
                >
                  <div className="font-bold text-slate-800 flex items-center gap-3 text-sm md:text-base">
                      <div className={`p-1.5 rounded-lg transition-colors ${expanded === c.id ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
                          <BookOpen size={16} />
                      </div>
                      {c.name}
                  </div>
                  
                  <div>
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 inline-block">
                          {c.code}
                      </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    ₹{c.amount > 0 ? c.amount : "Free"}
                  </div>

                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize tracking-wide ${
                        c.status === "active"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-red-50 text-red-700 border-red-100"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                      {c.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={() => setEditCourse(c)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Edit Course"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() =>
                        api
                          .patch(`/admin/courses/${c.id}/toggle`)
                          .then(loadCourses)
                      }
                      className={`p-2 rounded-lg transition-all ${c.status === 'active' ? 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                      title="Toggle Status"
                    >
                      {c.status === "active" ? (
                        <ToggleRight size={20} className="text-emerald-500" />
                      ) : (
                        <ToggleLeft size={20} />
                      )}
                    </button>

                    <div className="w-px h-4 bg-slate-200 mx-1"></div>

                    <button
                      onClick={() => {
                        setDeleteTarget(c);
                        setDeleteType("course");
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Course"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                      <div className={`ml-2 p-1.5 rounded-full transition-all duration-300 ${expanded === c.id ? "rotate-180 bg-slate-200 text-slate-700" : "text-slate-300"}`}>
                        <ChevronDown size={14} />
                      </div>
                  </div>
                </div>

                {/* Nested Batches Section */}
                {expanded === c.id && (
                  <div className="bg-slate-50/50 border-t border-slate-100 shadow-inner animate-in slide-in-from-top-2 duration-300">
                      <div className="px-6 py-5">
                          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                              <Layers size={14} className="text-indigo-400"/> Associated Batches
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pl-4 border-l-2 border-slate-200/60">
                               {batchLoading[c.id] ? (
                                  <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                                    <div className="w-5 h-5 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
                                    <span className="text-xs font-medium">Loading batches...</span>
                                  </div>
                                ) : (batches[c.id] || []).length === 0 ? (
                                  <div className="text-sm text-slate-400 italic py-2 pl-2">
                                    No batches found for this course.
                                  </div>
                                ) : null}
                              {(batches[c.id] || []).map((b) => (
                                  <div
                                  key={b.id}
                                  className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group/batch"
                                  >
                                      <div>
                                          <div className="font-bold text-sm text-slate-800">{b.name}</div>
                                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                                              <Calendar size={12}/> {new Date(b.start_date).toLocaleDateString("en-GB")} – {new Date(b.end_date).toLocaleDateString("en-GB")}
                                          </div>
                                      </div>

                                      {/* Action Area */}
                                      <div className="flex items-center gap-3">
                                          {/* Status Badge */}
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${b.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                              {b.status}
                                          </span>

                                          <div className="flex items-center gap-1">
                                              <button 
                                                  onClick={() => setEditBatch(b)}
                                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                  title="Edit Batch"
                                              >
                                                  <Pencil size={14} />
                                              </button>

                                              <button
                                                  onClick={() =>
                                                  api
                                                      .patch(`/admin/batches/${b.id}/toggle`)
                                                      .then(() => loadBatches(c.id))
                                                  }
                                                  className={`p-1.5 rounded-lg transition-all ${b.status === 'active' ? 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
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
                                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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