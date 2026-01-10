import React, { useEffect, useState, useCallback } from "react";
import api from "../../../lib/api/apiClient";
import StartAttendanceModal from "./StartAttendanceModal";
import LiveQrModal from "./LiveQrModal";
import OngoingAttendanceModal from "./OngoingAttendanceModal";
import { 
  PlayCircle, 
  Activity, 
  BookOpen, 
  Layers, 
  Users, 
  QrCode,
  Filter,
  ChevronDown,
  Loader2,
  CheckCircle2,
  XCircle,
  CalendarRange,
  Search
} from "lucide-react";

const STORAGE_KEY = "attendance_sessions";

export default function ManageAttendance({
    apiPrefix = "/admin",
    isFaculty = false,
}) {
  /* FILTERS */
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");

  /* MASTER DATA */
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  /* MODALS */
  const [startOpen, setStartOpen] = useState(false);
  const [liveSession, setLiveSession] = useState(null);
  const [ongoingOpen, setOngoingOpen] = useState(false);

  /* ATTENDANCE SESSIONS */
  const [sessions, setSessions] = useState([]);

  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  /* ---------------- LOAD COURSES ---------------- */
  useEffect(() => {
    api.get(
    isFaculty
        ? "/faculty/course-options"
        : "/admin/courses"
)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setCourses(data.filter((c) => c.status === "active"));
      })
      .catch(() => setCourses([]));
  }, []);

  /* ---------------- LOAD BATCHES ---------------- */
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
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setBatches(data.filter((b) => b.status === "active"));
      })
      .catch(() => setBatches([]));
  }, [courseId]);

  /* ---------------- RESTORE SESSIONS ON REFRESH ---------------- */
  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    const active = saved.filter(
      (s) => new Date(s.expires_at).getTime() > Date.now()
    );

    setSessions(active);
  }, []);

  const persistSessions = useCallback((list) => {
    setSessions(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }, []);

  /* ---------------- START ATTENDANCE ---------------- */
  const handleStart = (session) => {
    const enriched = {
      ...session,
      course_id: Number(courseId),
      batch_id: Number(batchId),
      course_name:
        courses.find((c) => String(c.id) === String(courseId))?.name ||
        "Course",
      batch_name:
        batches.find((b) => String(b.id) === String(batchId))?.name ||
        "Batch",
    };

    const updated = [...sessions, enriched];
    persistSessions(updated);
    setLiveSession(enriched);
  };

  /* ---------------- END ATTENDANCE ---------------- */
  const handleEnd = useCallback(
    async (sessionId) => {
      try {
        await api.post(`${apiPrefix}/attendance/sessions/end`, {
          session_id: sessionId,
        });
      } catch (e) {
        console.error("End session failed", e);
      }

      const updated = sessions.filter(
        (s) => s.session_id !== sessionId
      );
      persistSessions(updated);
      setLiveSession(null);
    },
    [sessions, persistSessions]
  );

  /* ---------------- LOAD REPORT ---------------- */
  const loadAttendanceReport = async () => {
    if (!courseId || !batchId) return;

    try {
      setLoadingReport(true);

      const res = await api.get(
        `${apiPrefix}/attendance/report?course_id=${courseId}&batch_id=${batchId}`
      );

      setReportData(res.data);
    } catch {
      setReportData(null);
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans pb-24">
      {/* Custom Scrollbar for Report Table */}
      <style>{`
        .custom-dashboard-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <QrCode className="text-indigo-600" size={32} />
            Manage Attendance
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Launch live QR code sessions for student check-ins and monitor historical attendance reports.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {sessions.length > 0 && (
            <button
              onClick={() => setOngoingOpen(true)}
              className="flex items-center gap-2 bg-white text-emerald-600 border border-emerald-200 px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-sm"
            >
              <Activity size={18} className="animate-pulse" />
              Active Sessions ({sessions.length})
            </button>
          )}

          <button
            onClick={() => setStartOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
          >
            <PlayCircle size={18} />
            New Attendance
          </button>
        </div>
      </div>

      {/* FILTERS & CONTROLS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center sticky top-4 z-30 backdrop-blur-xl bg-white/90">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">
            <Filter size={16} /> Filter
        </div>
        
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Course Select */}
            <div className="relative group">
                <select
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-semibold text-sm cursor-pointer"
                    value={courseId}
                    onChange={(e) => {
                      setCourseId(e.target.value);
                      setReportData(null); // Reset report when filter changes
                    }}
                >
                    <option value="">Select Academic Course</option>
                    {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                    ))}
                </select>
                <BookOpen className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={16} />
                <ChevronDown className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" size={16} />
            </div>

            {/* Batch Select */}
            <div className="relative group">
                <select
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-semibold text-sm cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    value={batchId}
                    onChange={(e) => {
                      setBatchId(e.target.value);
                      setReportData(null); // Reset report when filter changes
                    }}
                    disabled={!courseId}
                >
                    <option value="">Select Target Batch</option>
                    {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                        {b.name} 
                    </option>
                    ))}
                </select>
                <Layers className={`absolute left-3.5 top-3.5 pointer-events-none transition-colors ${!courseId ? 'text-slate-300' : 'text-slate-400 group-hover:text-indigo-500'}`} size={16} />
                <ChevronDown className={`absolute right-3.5 top-3.5 pointer-events-none transition-colors ${!courseId ? 'text-slate-300' : 'text-slate-400'}`} size={16} />
            </div>
        </div>

        <button
          onClick={loadAttendanceReport}
          disabled={!courseId || !batchId || loadingReport}
          className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 shrink-0 w-full md:w-auto ${
            !courseId || !batchId || loadingReport
            ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            : "bg-green-600 text-white hover:bg-green-700 shadow-slate-200"
          }`}
        >
          {loadingReport ? (
            <><Loader2 size={16} className="animate-spin" /> Loading...</>
          ) : (
            <><Search size={16} /> Fetch Report</>
          )}
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px] flex flex-col">
        
        {/* Table Toolbar */}
        <div className="px-6 py-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between backdrop-blur-sm">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <CalendarRange size={18} className="text-indigo-500" />
              Attendance Report
            </h2>
            {reportData && (
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  {reportData.students.length} Students
              </span>
            )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!courseId || !batchId ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 m-auto">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <Filter size={24} className="text-indigo-400" />
              </div>
              <p className="text-lg font-bold text-slate-600">Select Parameters</p>
              <p className="text-sm mt-1">Choose a specific course and batch to view the roster.</p>
            </div>
          ) : loadingReport ? (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="font-medium">Loading attendance...</span>
            </div>
          ) : !reportData ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 m-auto">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <Search size={24} className="text-indigo-400" />
              </div>
              <p className="text-lg font-bold text-slate-600">Ready to Fetch</p>
              <p className="text-sm mt-1">Click "Fetch Report" to load attendance records.</p>
            </div>
          ) : reportData.students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 m-auto">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <Users size={24} className="text-indigo-400" />
              </div>
              <p className="text-lg font-bold text-slate-600">No Students Enrolled</p>
              <p className="text-sm mt-1">There are currently no students mapped to this batch.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-dashboard-scroll">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[1px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      Student Details
                    </th>
                    {reportData.sessions.map((s) => (
                      <th key={s.id} className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] text-slate-400">
                             {new Date(s.starts_at).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="text-indigo-600">
                             {new Date(s.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100 shadow-[1px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-800 text-base whitespace-nowrap">
                            {st.name}
                          </span>
                          
                          <span className="font-mono text-[12px] text-slate-500 tracking-tight">
                            #{st.sid}
                          </span>
                        </div>
                      </td>

                      {reportData.sessions.map((s) => {
                        const status = st.attendance[s.id];
                        return (
                          <td key={s.id} className="px-4 py-4 text-center">
                            {status === "present" ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200" title="Present">
                                <CheckCircle2 size={16} strokeWidth={3} />
                              </div>
                            ) : status === "absent" ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-200" title="Absent">
                                <XCircle size={16} strokeWidth={3} />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-200" title="Not Marked">
                                <span className="text-xs font-bold">-</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <StartAttendanceModal
        open={startOpen}
        apiPrefix={apiPrefix}
        isFaculty={isFaculty}
        onClose={() => setStartOpen(false)}
        onStarted={(data) => {
            handleStart(data);
            setStartOpen(false);
        }}
    />

      <LiveQrModal
        session={liveSession}
        onMinimize={() => setLiveSession(null)}
        onEnd={handleEnd}
      />

      <OngoingAttendanceModal
        open={ongoingOpen}
        sessions={sessions}
        onClose={() => setOngoingOpen(false)}
        onSelect={(s) => {
          setLiveSession(s);
          setOngoingOpen(false);
        }}
      />
    </div>
  );
}