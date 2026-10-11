import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { useToast } from "../../../components/common/ToastProvider";
import { ErrorState } from "../../../components/common/States";
import {
  Plus,
  ChevronDown,
  BookOpen,
  Layers,
  Hash,
  Calendar,
  Save,
  X,
  Type
} from "lucide-react";

export default function ManageCourses() {
  const { toast } = useToast();
  const [courses, setCourses] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [batches, setBatches] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingBatch, setSavingBatch] = useState(false);

  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    amount: "",
  });

  const [batchForm, setBatchForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });

  const loadCourses = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await api.get("/admin/courses");
      setCourses(res.data);
    } catch (err) {
      console.warn("Failed to load courses", err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadBatches = async (courseId) => {
    setBatchLoading((prev) => ({ ...prev, [courseId]: true }));

    try {
      const res = await api.get(`/admin/courses/${courseId}/batches`);
      setBatches((prev) => ({ ...prev, [courseId]: res.data }));
    } catch {
      setBatches((prev) => ({ ...prev, [courseId]: [] }));
    } finally {
      setBatchLoading((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  /* ================= Courses ================= */

  const createCourse = async () => {
    if (!courseForm.name.trim() || !courseForm.code.trim()) return;

    try {
      setSavingCourse(true);
      await api.post("/admin/courses", {
        ...courseForm,
        amount: courseForm.amount || 0,
      });
      setCourseForm({
        name: "",
        code: "",
        amount: "",
      });
      setShowAddCourse(false);
      loadCourses();
    } catch (err) {
      toast(
        err?.response?.data?.message || "Failed to create course. Please try again.",
        "error"
      );
    } finally {
      setSavingCourse(false);
    }
  };

  /* ================= Batches ================= */

  const addBatch = async (courseId) => {
    const { name, start_date, end_date } = batchForm;
    if (!name || !start_date || !end_date) return;

    try {
      setSavingBatch(true);
      await api.post("/admin/batches", {
        course_id: courseId,
        name,
        start_date,
        end_date,
      });

      setBatchForm({
        name: "",
        start_date: "",
        end_date: "",
      });
      loadBatches(courseId);
    } catch (err) {
      toast(
        err?.response?.data?.message || "Failed to create batch. Please try again.",
        "error"
      );
    } finally {
      setSavingBatch(false);
    }
  };

  const [batchLoading, setBatchLoading] = useState({});

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
            Course Management
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Manage your academic courses and associated batches.
          </p>
        </div>

        <button
          onClick={() => setShowAddCourse(!showAddCourse)}
          className={`group flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 shadow-sm ${
            showAddCourse 
            ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text))] border border-[rgb(var(--zx-border))]" 
            : "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-lg shadow-brand-teal-500/20"
          }`}
        >
          {showAddCourse ? <X size={18} /> : <Plus size={18} className="group-hover:-translate-y-0.5 transition-transform" />}
          <span>{showAddCourse ? "Cancel Adding" : "Add New Course"}</span>
        </button>
      </div>

      {/* Add Course Form Panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out relative z-10 ${
          showAddCourse ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] p-6 sm:p-8 rounded-3xl shadow-sm mb-2">
          <h3 className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest mb-6 pb-4 border-b border-[rgb(var(--zx-border))] flex items-center gap-2">
             New Course Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] ml-1 flex items-center gap-1.5">
                 <Type size={14} className="text-brand-teal-500" /> Course Name
              </label>
              <div className="relative group">
                <input
                  placeholder="e.g. Bachelor of Technology"
                  className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-[rgb(var(--zx-text))] placeholder:font-normal placeholder:text-[rgb(var(--zx-text-muted))]/60"
                  value={courseForm.name}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] ml-1 flex items-center gap-1.5">
                 <Hash size={14} className="text-brand-teal-500" /> Course Code
              </label>
              <div className="relative group">
                <input
                  placeholder="e.g. CS-101"
                  className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-mono font-medium text-[rgb(var(--zx-text))] placeholder:font-sans placeholder:text-[rgb(var(--zx-text-muted))]/60"
                  value={courseForm.code}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, code: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] ml-1">
                Course Fees
              </label>
              <input
                type="number"
                placeholder="Enter amount or leave empty for free"
                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-[rgb(var(--zx-text))] placeholder:text-[rgb(var(--zx-text-muted))]/60"
                value={courseForm.amount}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, amount: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end border-t border-[rgb(var(--zx-border))] pt-5">
            <button
              onClick={() => setShowAddCourse(false)}
              className="px-5 py-2.5 text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface-hover))] rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createCourse}
              disabled={savingCourse}
              className="px-6 py-2.5 bg-brand-teal-500 text-white hover:bg-brand-teal-600 rounded-xl text-sm font-semibold shadow-lg shadow-brand-teal-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={16} /> {savingCourse ? "Saving..." : "Save Course"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-3xl shadow-sm overflow-hidden min-h-[300px] relative z-10">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_80px] gap-4 px-6 py-4 bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))] text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">
          <div>Course Name</div>
          <div>Code</div>
          <div className="text-center">Status</div>
          <div className="text-right">View</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-20 flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
             <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
             <span className="font-medium text-sm">Loading courses...</span>
          </div>
        )}

        {/* Error State */}
        {!loading && loadError && (
          <ErrorState
            message="We couldn't load the course list. Please try again."
            onRetry={loadCourses}
          />
        )}

        {/* Table Body */}
        {!loading && !loadError && (
          <div className="divide-y divide-[rgb(var(--zx-border))]">
            {courses.length === 0 ? (
                <div className="p-20 text-center text-[rgb(var(--zx-text-muted))]">
                    <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No courses found</p>
                    <p className="text-sm mt-1">Click "Add New Course" to get started.</p>
                </div>
            ) : (
                courses.map((c) => (
                <div key={c.id} className="group transition-colors bg-[rgb(var(--zx-surface))]">
                    {/* Course Row */}
                    <div
                    className={`grid grid-cols-[2fr_1fr_1fr_80px] gap-4 px-6 py-5 items-center transition-all duration-200 cursor-pointer border-l-[3px] ${
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
                    <div className="font-bold text-[rgb(var(--zx-text))] flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl transition-colors ${expanded === c.id ? "bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20" : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] group-hover:bg-[rgb(var(--zx-surface))] group-hover:text-brand-teal-500 border border-[rgb(var(--zx-border))]"}`}>
                            <BookOpen size={18} />
                        </div>
                        {c.name}
                    </div>
                    
                    <div>
                        <span className="text-xs font-mono font-semibold text-[rgb(var(--zx-text-muted))] bg-[rgb(var(--zx-surface-hover))] px-2.5 py-1 rounded-lg border border-[rgb(var(--zx-border))] inline-block">
                            {c.code || "—"}
                        </span>
                    </div>

                    <div className="flex justify-center">
                        <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-widest ${
                            c.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        }`}
                        >
                        <span className={`w-1.5 h-1.5 rounded-full ${c.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                        {c.status === "active" ? "Active" : "Inactive"}
                        </span>
                    </div>

                    <div className="flex items-center justify-end">
                        <button
                        className={`p-2 rounded-xl transition-all duration-300 ${
                            expanded === c.id
                            ? "bg-brand-teal-500/10 text-brand-teal-500 rotate-180 border border-brand-teal-500/20"
                            : "text-[rgb(var(--zx-text-muted))] hover:bg-[rgb(var(--zx-surface-hover))] hover:text-[rgb(var(--zx-text))]"
                        }`}
                        >
                            <ChevronDown size={18} />
                        </button>
                    </div>
                    </div>

                    {/* Expanded Batches Section */}
                    {expanded === c.id && (
                    <div className="bg-[rgb(var(--zx-surface-hover))]/50 border-t border-b border-[rgb(var(--zx-border))] px-6 py-6 shadow-inner animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col md:flex-row gap-8">
                        
                        {/* Left: Add Batch Form */}
                        <div className="md:w-2/5 space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-[rgb(var(--zx-text))] uppercase tracking-wider">
                                <Plus size={16} className="text-brand-teal-500"/> Add Batch
                            </div>
                            <div className="space-y-4 p-5 bg-[rgb(var(--zx-surface))] rounded-2xl border border-[rgb(var(--zx-border))] shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-brand-teal-500"></div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Batch Name</label>
                                    <input
                                    placeholder="e.g. 2024–2028"
                                    className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-teal-500 outline-none transition-all font-semibold text-[rgb(var(--zx-text))] placeholder:text-[rgb(var(--zx-text-muted))]/60"
                                    value={batchForm.name}
                                    onChange={(e) =>
                                        setBatchForm({ ...batchForm, name: e.target.value })
                                    }
                                    />
                                </div>
                            
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Start Year</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 text-[rgb(var(--zx-text-muted))]" size={14} />
                                            <input
                                                placeholder="YYYY"
                                                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl pl-9 pr-2.5 py-2.5 text-xs focus:outline-none focus:border-brand-teal-500 outline-none transition-all text-[rgb(var(--zx-text))]"
                                                type="date"
                                                value={batchForm.start_date}
                                                onChange={(e) =>
                                                    setBatchForm({
                                                    ...batchForm,
                                                    start_date: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">End Year</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 text-[rgb(var(--zx-text-muted))]" size={14} />
                                            <input
                                                placeholder="YYYY"
                                                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl pl-9 pr-2.5 py-2.5 text-xs focus:outline-none focus:border-brand-teal-500 outline-none transition-all text-[rgb(var(--zx-text))]"
                                                type="date"
                                                value={batchForm.end_date}
                                                onChange={(e) =>
                                                    setBatchForm({
                                                    ...batchForm,
                                                    end_date: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => addBatch(c.id)}
                                    disabled={savingBatch}
                                    className="w-full py-3 bg-brand-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-teal-600 transition-all shadow-md shadow-brand-teal-500/20 active:scale-95 flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <Plus size={16} /> {savingBatch ? "Creating..." : "Create Batch"}
                                </button>
                            </div>
                        </div>

                        {/* Right: Batches List */}
                        <div className="md:w-3/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-[rgb(var(--zx-text))] uppercase tracking-wider">
                                    <Layers size={16} className="text-brand-teal-500" /> Existing Batches
                                </div>
                                <span className="text-[11px] font-bold text-brand-teal-500 bg-brand-teal-500/10 border border-brand-teal-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    {(batches[c.id] || []).length} Found
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {batchLoading[c.id] ? (
                                <div className="col-span-2 flex flex-col items-center justify-center py-10 text-[rgb(var(--zx-text-muted))]">
                                  <div className="w-6 h-6 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin mb-2"></div>
                                  <span className="text-sm font-medium">Loading batches...</span>
                                </div>
                              ) : (batches[c.id] || []).length === 0 ? (
                                <div className="col-span-2 flex flex-col items-center justify-center py-10 text-[rgb(var(--zx-text-muted))] border border-dashed border-[rgb(var(--zx-border))] rounded-2xl bg-[rgb(var(--zx-surface))]/50">
                                  <Layers size={32} className="mb-2 opacity-30" />
                                  <span className="text-sm font-medium">No batches found for this course.</span>
                                </div>
                              ) : (
                                (batches[c.id] || []).map((b) => (
                                  <div
                                    key={b.id}
                                    className="flex justify-between items-center bg-[rgb(var(--zx-surface))] p-4 rounded-2xl border border-[rgb(var(--zx-border))] hover:border-brand-teal-500/40 hover:shadow-md transition-all group"
                                  >
                                    <div>
                                      <div className="text-sm font-bold text-[rgb(var(--zx-text))] group-hover:text-brand-teal-500 transition-colors">
                                        {b.name}
                                      </div>
                                      <div className="text-xs font-medium text-[rgb(var(--zx-text-muted))] mt-1 flex items-center gap-1">
                                        <Calendar size={12} className="text-[rgb(var(--zx-text-muted))]" /> {new Date(b.start_date).toLocaleDateString("en-GB")} – {new Date(b.end_date).toLocaleDateString("en-GB")}
                                      </div>
                                    </div>

                                    <div title={b.status === "active" ? "Active" : "Inactive"}>
                                      <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-[rgb(var(--zx-surface))] shadow-sm ${
                                        b.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                                      }`}></div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                        </div>
                        </div>
                    </div>
                    )}
                </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}