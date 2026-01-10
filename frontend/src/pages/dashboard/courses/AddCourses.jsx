import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Layers,
  Hash,
  Calendar,
  Save,
  X,
  Type
} from "lucide-react";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [batches, setBatches] = useState({});
  const [loading, setLoading] = useState(true);

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
    const res = await api.get("/admin/courses");
    setCourses(res.data);
    setLoading(false);
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
  };

  // Toggle Course functionality removed (Logic preserved but not rendered)

  /* ================= Batches ================= */

  const addBatch = async (courseId) => {
    const { name, start_date, end_date } = batchForm;
    if (!name || !start_date || !end_date) return;

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
  };

  const [batchLoading, setBatchLoading] = useState({});

  // Toggle Batch functionality removed (Logic preserved but not rendered)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <BookOpen className="text-blue-600" size={32} />
            Course Management
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Manage your academic courses and associated batches.
          </p>
        </div>

        <button
          onClick={() => setShowAddCourse(!showAddCourse)}
          className={`group flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all active:scale-95 ${
            showAddCourse 
            ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300"
          }`}
        >
          {showAddCourse ? <X size={18} /> : <Plus size={18} className="group-hover:-translate-y-0.5 transition-transform" />}
          <span>{showAddCourse ? "Cancel Adding" : "Add New Course"}</span>
        </button>
      </div>

      {/* Add Course Form Panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showAddCourse ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl shadow-slate-200/40 mb-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
             New Course Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1.5">
                 <Type size={14} className="text-indigo-500" /> Course Name
              </label>
              <div className="relative group">
                <input
                  placeholder="e.g. Bachelor of Technology"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-400"
                  value={courseForm.name}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1.5">
                 <Hash size={14} className="text-indigo-500" /> Course Code
              </label>
              <div className="relative group">
                <input
                  placeholder="e.g. CS-101"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-mono font-medium text-slate-700 placeholder:font-sans placeholder:text-slate-400"
                  value={courseForm.code}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, code: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                Course Fees
              </label>
              <input
                type="number"
                placeholder="Enter amount or leave empty for free"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                value={courseForm.amount}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, amount: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end border-t border-slate-100 pt-5">
            <button
              onClick={() => setShowAddCourse(false)}
              className="px-5 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createCourse}
              className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95"
            >
              <Save size={16} /> Save Course
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden min-h-[300px]">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_80px] gap-4 px-6 py-4 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider backdrop-blur-sm">
          <div>Course Name</div>
          <div>Code</div>
          <div className="text-center">Status</div>
          <div className="text-right">View</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
             <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
             <span className="font-medium">Loading courses...</span>
          </div>
        )}

        {/* Table Body */}
        {!loading && (
          <div className="divide-y divide-slate-100">
            {courses.length === 0 ? (
                <div className="p-20 text-center text-slate-400">
                    <p className="text-lg font-medium text-slate-500">No courses found</p>
                    <p className="text-sm">Click "Add New Course" to get started.</p>
                </div>
            ) : (
                courses.map((c) => (
                <div key={c.id} className="group transition-colors bg-white">
                    {/* Course Row */}
                    <div
                    className={`grid grid-cols-[2fr_1fr_1fr_80px] gap-4 px-6 py-5 items-center transition-all duration-200 cursor-pointer border-l-[3px] ${
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
                    <div className="font-bold text-slate-800 flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${expanded === c.id ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-indigo-500"}`}>
                            <BookOpen size={18} />
                        </div>
                        {c.name}
                    </div>
                    
                    <div>
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 inline-block">
                            {c.code || "—"}
                        </span>
                    </div>

                    <div className="flex justify-center">
                        <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide ${
                            c.status === "active"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        }`}
                        >
                        <span className={`w-1.5 h-1.5 rounded-full ${c.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                        {c.status === "active" ? "Active" : "Inactive"}
                        </span>
                    </div>

                    <div className="flex items-center justify-end">
                        <button
                        className={`p-1.5 rounded-full transition-all duration-300 ${
                            expanded === c.id
                            ? "bg-indigo-100 text-indigo-700 rotate-180"
                            : "text-slate-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-slate-600"
                        }`}
                        >
                            <ChevronDown size={18} />
                        </button>
                    </div>
                    </div>

                    {/* Expanded Batches Section */}
                    {expanded === c.id && (
                    <div className="bg-slate-50/50 border-t border-b border-slate-100 px-6 py-6 shadow-inner animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col md:flex-row gap-8">
                        
                        {/* Left: Add Batch Form */}
                        <div className="md:w-1/3 space-y-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
                                <Plus size={16} className="text-indigo-600"/> Add Batch
                            </div>
                            <div className="space-y-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Batch Name</label>
                                    <input
                                    placeholder="e.g. 2024–2028"
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-semibold"
                                    value={batchForm.name}
                                    onChange={(e) =>
                                        setBatchForm({ ...batchForm, name: e.target.value })
                                    }
                                    />
                                </div>
                            
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Start Year</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                                            <input
                                                placeholder="YYYY"
                                                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
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
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">End Year</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                                            <input
                                                placeholder="YYYY"
                                                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
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
                                    className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-all shadow-md active:scale-95 flex justify-center items-center gap-2"
                                >
                                    <Plus size={16} /> Create Batch
                                </button>
                            </div>
                        </div>

                        {/* Right: Batches List */}
                        <div className="md:w-2/3">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wide">
                                    <Layers size={16} className="text-indigo-600" /> Existing Batches
                                </div>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                                    {(batches[c.id] || []).length} Found
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {batchLoading[c.id] ? (
                                <div className="col-span-2 flex flex-col items-center justify-center py-10 text-slate-400">
                                  <div className="w-6 h-6 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
                                  <span className="text-sm font-medium">Loading batches...</span>
                                </div>
                              ) : (batches[c.id] || []).length === 0 ? (
                                <div className="col-span-2 flex flex-col items-center justify-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                                  <Layers size={32} className="mb-2 opacity-30" />
                                  <span className="text-sm font-medium">No batches found for this course.</span>
                                </div>
                              ) : (
                                (batches[c.id] || []).map((b) => (
                                  <div
                                    key={b.id}
                                    className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                                  >
                                    <div>
                                      <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                        {b.name}
                                      </div>
                                      <div className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                                        <Calendar size={12} className="text-slate-400" /> {new Date(b.start_date).toLocaleDateString("en-GB")} – {new Date(b.end_date).toLocaleDateString("en-GB")}
                                      </div>
                                    </div>

                                    <div title={b.status === "active" ? "Active" : "Inactive"}>
                                      <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm ${
                                        b.status === "active" ? "bg-emerald-500" : "bg-red-400"
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