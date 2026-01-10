import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import {
  Calendar,
  Clock,
  Pencil,
  Trash2,
  PlayCircle,
  Video,
  Eye,
  Filter,
  ChevronDown,
  MoreHorizontal
} from "lucide-react";

import ConfirmModal from "../../../components/ConfirmModal";
import ScheduleLectureModal from "./ScheduleLectureModal";
import MeetingPlatformModal from "./MeetingPlatformModal";
import AccessControlModal from "./AccessControlModal";
import ViewLectureModal from "./ViewLectureModal";

export default function ManageOnlineClasses({
  apiPrefix = "/admin",
  isFaculty = false,
}) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== FILTERS ===== */
  const [timeFilter, setTimeFilter] = useState("upcoming");
  const [accessFilter, setAccessFilter] = useState("all");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  /* ===== UI STATE ===== */
  const [expandedId, setExpandedId] = useState(null);

  const [step1Open, setStep1Open] = useState(false);
  const [step2Open, setStep2Open] = useState(false);
  const [step3Open, setStep3Open] = useState(false);

  const [mode, setMode] = useState("schedule");
  const [payload, setPayload] = useState({});
  const [editingClass, setEditingClass] = useState(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ================= LOAD COURSES ================= */

  useEffect(() => {
    api.get(`${apiPrefix}/courses`).then((res) => setCourses(res.data));
  }, []);

  useEffect(() => {
    if (accessFilter === "batch" && courseId) {
      api
        .get(`${apiPrefix}/courses/${courseId}/batches`)
        .then((res) => setBatches(res.data));
    } else {
      setBatches([]);
      setBatchId("");
    }
  }, [accessFilter, courseId]);

  /* ================= LOAD CLASSES ================= */

  const loadClasses = async () => {
    if (accessFilter === "course" && !courseId) return;
    if (accessFilter === "batch" && (!courseId || !batchId)) return;

    setLoading(true);
    try {
      const res = await api.get(`${apiPrefix}/online-classes`, {
        params: { filter: timeFilter },
      });

      let data = res.data;

      /* ===== STRICT ACCESS FILTERING ===== */
      if (accessFilter === "course") {
        data = data.filter((c) => {
          const r = c.access_rules?.[0];
          return String(r?.course_id) === String(courseId);
        });
      }

      if (accessFilter === "batch") {
        data = data.filter((c) => {
          const r = c.access_rules?.[0];
          return (
            String(r?.course_id) === String(courseId) &&
            String(r?.batch_id) === String(batchId)
          );
        });
      }

      setClasses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [timeFilter, accessFilter, courseId, batchId]);

  /* ================= HANDLERS ================= */

  const handleAccessFilterChange = (e) => {
    const v = e.target.value;
    setAccessFilter(v);
    setCourseId("");
    setBatchId("");
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  /* ================= CREATE / EDIT ================= */

  const startSchedule = (type) => {
    setMode(type);
    setPayload({});
    setEditingClass(null);
    setStep1Open(true);
  };

  const startEdit = async (cls) => {
    const accessRes = await api.get(
      `${apiPrefix}/online-classes/${cls.id}/access`
    );

    setEditingClass(cls);
    setPayload({
      ...cls,
      access: accessRes.data,
    });

    setStep1Open(true);
  };

  /* ================= STEP FLOW ================= */

  const handleStep1Next = (data) => {
    setPayload((p) => ({ ...p, ...data }));
    setStep1Open(false);
    setStep2Open(true);
  };

  const handleStep2Next = (data) => {
    setPayload((p) => ({ ...p, ...data }));
    setStep2Open(false);
    setStep3Open(true);
  };

  const handleFinalSubmit = async (accessData) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      let classId = editingClass?.id;

      const body = {
        title: payload.title,
        description: payload.description,
        start_datetime: payload.start_datetime,
        duration_minutes: payload.duration_minutes,
        is_recurring: payload.is_recurring,
        recurring_days: payload.recurring_days,
        platform: payload.platform,
        platform_name: payload.platform_name,
        meeting_link: payload.meeting_link,
        meeting_id: payload.meeting_id,
        meeting_password: payload.meeting_password,
        remarks: payload.remarks,
      };

      if (editingClass) {
        await api.put(`${apiPrefix}/online-classes/${classId}`, body);
      } else {
        const res = await api.post(`${apiPrefix}/online-classes`, body);
        classId = res.data.id;
      }

      await api.post(
        `${apiPrefix}/online-classes/${classId}/access`,
        accessData
      );

      showToast(editingClass ? "Lecture updated successfully" : "Lecture scheduled successfully");
      setStep3Open(false);
      setEditingClass(null);
      setPayload({});
      loadClasses();
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= HELPERS ================= */

  const getCourseBatch = (c) => {
    const r = c.access_rules?.[0];
    if (!r || r.access_type === "all") return { course: "All Courses", batch: "All Batches" };
    if (r.access_type === "course")
      return { course: r.course?.name || "Course", batch: "All Batches" };
    return {
      course: r.course?.name || "Course",
      batch: r.batch?.name || "Batch",
    };
  };

  // Upgraded Logic-less UI Styling
  const statusBadge = (s) =>
    s === "live"
      ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200 animate-pulse"
      : s === "completed"
      ? "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
      : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200";

  /* ================= UI ================= */

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans">
      
      {/* HEADER SECTION (Restored to User Preference) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Video className="text-blue-600" size={32} />
            Manage Online Classes
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Schedule, manage, and track your live sessions.
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => startSchedule("schedule")} 
            className="group flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 font-medium"
          >
            <Calendar size={18} className="group-hover:-translate-y-0.5 transition-transform" /> 
            <span>Schedule Class</span>
          </button>
          
          <button 
            onClick={() => startSchedule("live")} 
            className="group flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-200 hover:shadow-rose-300 transition-all active:scale-95 font-medium"
          >
            <PlayCircle size={18} className="animate-pulse" /> 
            <span>Go Live Now</span>
          </button>
        </div>
      </div>

      {/* FILTERS & CONTROLS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between sticky top-4 z-10 backdrop-blur-xl bg-white/90 supports-[backdrop-filter]:bg-white/60">
        
        {/* Time Toggles */}
        <div className="bg-slate-100/80 p-1.5 rounded-xl inline-flex w-full xl:w-auto">
          {["upcoming", "live", "past"].map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`flex-1 xl:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                timeFilter === f 
                  ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        {!isFaculty && (
        <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3">
          <div className="relative group min-w-[180px]">
            <select 
                value={accessFilter} 
                onChange={handleAccessFilterChange}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm hover:border-indigo-300"
            >
              <option value="all">All Access</option>
              <option value="course">Specific Course</option>
              <option value="batch">Specific Batch</option>
            </select>
            <Filter size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
          </div>

          {accessFilter !== "all" && (
            <div className="relative group min-w-[200px] animate-in slide-in-from-right-2 duration-300">
                <select 
                    value={courseId} 
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm"
                >
                <option value="">Select Course</option>
                {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          )}

          {accessFilter === "batch" && (
            <div className="relative group min-w-[200px] animate-in slide-in-from-right-2 duration-300">
                <select 
                    value={batchId} 
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm"
                >
                <option value="">Select Batch</option>
                {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 px-6 py-4 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider backdrop-blur-sm">
          <div className="col-span-1">Lecture Title</div>
          <div className="col-span-1">Platform</div>
          <div className="col-span-1">Course</div>
          <div className="col-span-1">Batch</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Date & Time</div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
             <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
             <span className="font-medium">Loading classes...</span>
          </div>
        ) : classes.length === 0 ? (
            <div className="p-20 text-center text-slate-400 bg-slate-50/30">
                <p className="text-lg font-medium text-slate-500">No classes found</p>
                <p className="text-sm">Adjust filters or schedule a new class.</p>
            </div>
        ) : (
          classes.map((c) => {
            const ab = getCourseBatch(c);
            const isExpanded = expandedId === c.id;
            
            return (
              <div key={c.id} className="group border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/50">
                
                {/* Row Content */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  className={`grid grid-cols-6 px-6 py-5 cursor-pointer items-center transition-all duration-200 ${isExpanded ? "bg-indigo-50/30" : ""}`}
                >
                  <div className="font-bold text-slate-800 text-sm md:text-base truncate pr-2">{c.title}</div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <div className={`p-1.5 rounded-lg ${c.platform_name?.toLowerCase().includes('zoom') ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                        <Video size={14} /> 
                    </div>
                    {c.platform_name}
                  </div>
                  
                  <div className="text-sm text-slate-600 font-medium truncate pr-2">{ab.course}</div>
                  <div className="text-sm text-slate-500 truncate pr-2">{ab.batch}</div>
                  
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${statusBadge(c.status)}`}>
                        {c.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Clock size={14} className="text-slate-400" /> 
                    {new Date(c.start_datetime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                  </div>
                </div>

                {/* Expanded Action Panel */}
                {isExpanded && (
                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100/50 flex flex-wrap items-center gap-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Actions:</div>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); setViewData(c); setViewOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold shadow-sm hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all"
                    >
                      <Eye size={16} /> View Details
                    </button>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); startEdit(c); }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-semibold shadow-sm hover:border-amber-300 hover:text-amber-600 hover:shadow-md transition-all"
                    >
                        <Pencil size={16} /> Edit Class
                    </button>

                    {c.status !== "live" && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); api.post(`${apiPrefix}/online-classes/${c.id}/go-live`).then(loadClasses); }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white border border-transparent rounded-lg text-sm font-semibold shadow-md shadow-rose-200 hover:shadow-lg hover:scale-105 transition-all"
                      >
                        <PlayCircle size={16} /> Go Live
                      </button>
                    )}

                    <div className="flex-grow"></div>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); setConfirmOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 rounded-lg text-red-500 text-sm font-semibold shadow-sm hover:bg-red-50 hover:border-red-200 transition-all ml-auto"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODALS */}
      <ScheduleLectureModal open={step1Open} mode={mode} initialData={editingClass ? payload : null} onClose={() => setStep1Open(false)} onNext={handleStep1Next} />
      <MeetingPlatformModal open={step2Open} initialData={editingClass ? payload : null} onClose={() => setStep2Open(false)} onBack={() => { setStep2Open(false); setStep1Open(true); }} onNext={handleStep2Next} />
      <AccessControlModal
        open={step3Open}
        initialData={editingClass ? payload.access : null}
        apiPrefix={apiPrefix}
        isFaculty={isFaculty}
        onClose={() => setStep3Open(false)}
        onBack={() => {
            setStep3Open(false);
            setStep2Open(true);
        }}
        onSubmit={handleFinalSubmit}
    />
      <ViewLectureModal open={viewOpen} data={viewData} onClose={() => setViewOpen(false)} />
      <ConfirmModal open={confirmOpen} title="Delete Online Class" message="Are you sure you want to remove this class permanently?" onClose={() => setConfirmOpen(false)} onConfirm={() => {
        api.delete(`${apiPrefix}/online-classes/${deleteTarget.id}`)
           .then(() => {
               loadClasses();        
               setConfirmOpen(false); 
               setToast("Class deleted successfully!");
               setTimeout(() => setToast(""), 3000);
           });
    }} />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-slate-900 text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="font-medium text-sm">{toast}</span>
            </div>
        </div>
      )}
    </div>
  );
}