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
  ChevronDown
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
  }, [apiPrefix]);

  useEffect(() => {
    if (accessFilter === "batch" && courseId) {
      api
        .get(`${apiPrefix}/courses/${courseId}/batches`)
        .then((res) => setBatches(res.data));
    } else {
      setBatches([]);
      setBatchId("");
    }
  }, [accessFilter, courseId, apiPrefix]);

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

  const statusBadge = (s) =>
    s === "live"
      ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse"
      : s === "completed"
      ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))]"
      : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";

  /* ================= UI ================= */

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 pt-0 space-y-8 animate-fade-in font-sans">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
            <Video size={14} strokeWidth={2.5} />
            Virtual Classroom
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Manage Online Classes
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Schedule, manage, and track your live sessions.
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => startSchedule("schedule")} 
            className="group flex items-center gap-2 px-5 py-3 bg-[rgb(var(--zx-surface))] hover:bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text))] border border-[rgb(var(--zx-border))] rounded-2xl shadow-sm transition-all active:scale-95 font-semibold text-sm"
          >
            <Calendar size={18} className="group-hover:-translate-y-0.5 transition-transform text-brand-teal-500" /> 
            <span>Schedule Class</span>
          </button>
          
          <button 
            onClick={() => startSchedule("live")} 
            className="group flex items-center gap-2 px-5 py-3 bg-brand-teal-500 hover:bg-brand-teal-600 text-white rounded-2xl shadow-lg shadow-brand-teal-500/20 transition-all active:scale-95 font-semibold text-sm"
          >
            <PlayCircle size={18} className="animate-pulse" /> 
            <span>Go Live Now</span>
          </button>
        </div>
      </div>

      {/* FILTERS & CONTROLS */}
      <div className="bg-[rgb(var(--zx-surface))]/90 p-4 rounded-2xl border border-[rgb(var(--zx-border))] shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between sticky top-4 z-30 backdrop-blur-xl">
        
        {/* Time Toggles */}
        <div className="bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] p-1.5 rounded-2xl inline-flex w-full xl:w-auto shadow-inner">
          {["upcoming", "live", "past"].map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`flex-1 xl:flex-none px-6 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                timeFilter === f 
                  ? "bg-brand-teal-500 text-white shadow-md shadow-brand-teal-500/20" 
                  : "text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface))]"
              }`}
            >
              {f}
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
                className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm cursor-pointer shadow-sm"
            >
              <option value="all">All Access</option>
              <option value="course">Specific Course</option>
              <option value="batch">Specific Batch</option>
            </select>
            <Filter size={16} className="absolute right-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" />
          </div>

          {accessFilter !== "all" && (
            <div className="relative group min-w-[200px] animate-in slide-in-from-right-2 duration-300">
                <select 
                    value={courseId} 
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm cursor-pointer shadow-sm"
                >
                <option value="">Select Course</option>
                {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" />
            </div>
          )}

          {accessFilter === "batch" && (
            <div className="relative group min-w-[200px] animate-in slide-in-from-right-2 duration-300">
                <select 
                    value={batchId} 
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm cursor-pointer shadow-sm"
                >
                <option value="">Select Batch</option>
                {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" />
            </div>
          )}
        </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-3xl shadow-sm overflow-hidden relative z-10">
        {/* Table Header */}
        <div className="grid grid-cols-6 px-6 py-4 bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))] text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">
          <div className="col-span-1">Lecture Title</div>
          <div className="col-span-1">Platform</div>
          <div className="col-span-1">Course</div>
          <div className="col-span-1">Batch</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Date & Time</div>
        </div>

        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
             <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
             <span className="font-medium text-sm">Loading classes...</span>
          </div>
        ) : classes.length === 0 ? (
            <div className="p-20 text-center text-[rgb(var(--zx-text-muted))] bg-[rgb(var(--zx-surface))]">
                <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No classes found</p>
                <p className="text-sm mt-1">Adjust filters or schedule a new class.</p>
            </div>
        ) : (
          classes.map((c) => {
            const ab = getCourseBatch(c);
            const isExpanded = expandedId === c.id;
            
            return (
              <div key={c.id} className="group border-b border-[rgb(var(--zx-border))] last:border-0 transition-colors">
                
                {/* Row Content */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  className={`grid grid-cols-6 px-6 py-4 cursor-pointer items-center transition-all duration-200 ${isExpanded ? "bg-brand-teal-500/5" : "hover:bg-[rgb(var(--zx-surface-hover))]"}`}
                >
                  <div className="font-bold text-[rgb(var(--zx-text))] text-sm md:text-base truncate pr-2">{c.title}</div>
                  
                  <div className="flex items-center gap-2 text-sm text-[rgb(var(--zx-text-muted))] font-medium">
                    <div className={`p-2 rounded-xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] text-brand-teal-500`}>
                        <Video size={14} /> 
                    </div>
                    {c.platform_name}
                  </div>
                  
                  <div className="text-sm text-[rgb(var(--zx-text))] font-medium truncate pr-2">{ab.course}</div>
                  <div className="text-sm text-[rgb(var(--zx-text-muted))] truncate pr-2">{ab.batch}</div>
                  
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${statusBadge(c.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.status === "live" ? "bg-rose-500 animate-pulse" : c.status === "completed" ? "bg-[rgb(var(--zx-text-muted))]" : "bg-emerald-500"}`} />
                        {c.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-[rgb(var(--zx-text-muted))] font-medium">
                    <Clock size={14} className="text-[rgb(var(--zx-text-muted))]" /> 
                    {new Date(c.start_datetime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                  </div>
                </div>

                {/* Expanded Action Panel */}
                {isExpanded && (
                  <div className="px-6 py-4 bg-[rgb(var(--zx-surface-hover))]/50 border-t border-[rgb(var(--zx-border))] flex flex-wrap items-center gap-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider mr-2">Actions:</div>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); setViewData(c); setViewOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl text-[rgb(var(--zx-text))] text-xs font-bold shadow-sm hover:border-brand-teal-500/40 hover:text-brand-teal-500 transition-all"
                    >
                      <Eye size={16} /> View Details
                    </button>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); startEdit(c); }}
                        className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl text-[rgb(var(--zx-text))] text-xs font-bold shadow-sm hover:border-amber-500/40 hover:text-amber-500 transition-all"
                    >
                        <Pencil size={16} /> Edit Class
                    </button>

                    {c.status !== "live" && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); api.post(`${apiPrefix}/online-classes/${c.id}/go-live`).then(loadClasses); }}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-all"
                      >
                        <PlayCircle size={16} /> Go Live
                      </button>
                    )}

                    <div className="flex-grow"></div>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); setConfirmOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--zx-surface))] border border-rose-500/30 rounded-xl text-rose-500 text-xs font-bold shadow-sm hover:bg-rose-500/10 transition-all ml-auto"
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
            <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[rgb(var(--zx-border))] backdrop-blur-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="font-bold text-sm">{toast}</span>
            </div>
        </div>
      )}
    </div>
  );
}