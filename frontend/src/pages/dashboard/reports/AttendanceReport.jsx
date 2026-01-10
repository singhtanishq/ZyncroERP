import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { 
  FileSpreadsheet, 
  BookOpen, 
  Layers, 
  Search, 
  ChevronDown,
  Filter,
  Loader2,
  Users,
  Inbox,
  CheckCircle2,
  XCircle,
  CalendarRange,
  CalendarClock
} from "lucide-react";

export default function AttendanceReport({
  apiPrefix = "/admin",
}) {
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const [range, setRange] = useState("all");

  const isFaculty =
  apiPrefix === "/faculty";

  /* LOAD COURSES */
  useEffect(() => {
  const endpoint = isFaculty
    ? "/faculty/course-options"
    : `${apiPrefix}/courses`;

  api.get(endpoint)
    .then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setCourses(data.filter(c => c.status === "active"));
    })
    .catch(() => setCourses([]));
}, [apiPrefix, isFaculty]);

  /* LOAD BATCHES */
  useEffect(() => {
  if (!courseId) {
    setBatches([]);
    setBatchId("");
    return;
  }

  const endpoint = isFaculty
    ? `/faculty/course-options/${courseId}/batches`
    : `${apiPrefix}/courses/${courseId}/batches`;

  api.get(endpoint)
    .then(res => {
      const data = Array.isArray(res.data) ? res.data : [];
      setBatches(data.filter(b => b.status === "active"));
    })
    .catch(() => setBatches([]));
}, [courseId, apiPrefix, isFaculty]);

  /* LOAD REPORT */
  const loadAttendanceReport = async () => {
    if (!courseId || !batchId) return;

    try {
      setLoadingReport(true);

      const res = await api.get(
        `${apiPrefix}/attendance/report?course_id=${courseId}&batch_id=${batchId}`
      );

      setReportData(res.data);
      setHasFetched(true);
    } catch (e) {
      console.error("Report failed", e);
      setReportData(null);
    } finally {
      setLoadingReport(false);
    }
  };

  /* FILTER SESSIONS */
  const getFilteredSessions = () => {
    if (!reportData?.sessions) return [];

    const now = new Date();

    return reportData.sessions.filter((s) => {
      if (range === "all") return true;

      const sessionDate = new Date(s.starts_at);
      const diffDays = (now - sessionDate) / (1000 * 60 * 60 * 24);

      if (range === "today") {
        return sessionDate.toDateString() === now.toDateString();
      }

      if (range === "7") return diffDays <= 7;
      if (range === "30") return diffDays <= 30;
      if (range === "180") return diffDays <= 180;

      return true;
    });
  };

  const filteredSessions = getFilteredSessions();

  /* CALCULATE % */
  const getAttendancePercentage = (student) => {
    if (!filteredSessions.length) return 0;

    let present = 0;

    filteredSessions.forEach((s) => {
      if (student.attendance[s.id] === "present") {
        present++;
      }
    });

    return Math.round((present / filteredSessions.length) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans pb-24">
      {/* Custom Scrollbar */}
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
            <FileSpreadsheet className="text-indigo-600" size={32} />
            Attendance Report
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Analyze comprehensive attendance data, filter by specific time ranges, and monitor student engagement.
          </p>
        </div>
      </div>

      {/* FILTERS & CONTROLS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4 items-center sticky top-4 z-30 backdrop-blur-xl bg-white/90">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">
            <Filter size={16} /> Filters
        </div>

        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Course Select */}
            <div className="relative group">
                <select
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-semibold text-sm cursor-pointer"
                    value={courseId}
                    onChange={(e) => {
                      setCourseId(e.target.value);
                      setReportData(null);
                      setHasFetched(false);
                    }}
                >
                    <option value="">Select Academic Course</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
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
                      setReportData(null);
                      setHasFetched(false);
                    }}
                    disabled={!courseId}
                >
                    <option value="">Select Target Batch</option>
                    {batches.map(b => (
                        <option key={b.id} value={b.id}>
                            {b.name}
                        </option>
                    ))}
                </select>
                <Layers className={`absolute left-3.5 top-3.5 pointer-events-none transition-colors ${!courseId ? 'text-slate-300' : 'text-slate-400 group-hover:text-indigo-500'}`} size={16} />
                <ChevronDown className={`absolute right-3.5 top-3.5 pointer-events-none transition-colors ${!courseId ? 'text-slate-300' : 'text-slate-400'}`} size={16} />
            </div>

            {/* Range Select */}
            <div className="relative group">
                <select
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-semibold text-sm cursor-pointer"
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                >
                    <option value="today">Today</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="180">Last 6 Months</option>
                    <option value="all">All Time</option>
                </select>
                <CalendarClock className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={16} />
                <ChevronDown className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" size={16} />
            </div>
        </div>

        <button 
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 shrink-0 w-full xl:w-auto ${
              !courseId || !batchId || loadingReport
              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-green-600 text-white hover:bg-green-700 shadow-slate-200"
            }`}
            onClick={loadAttendanceReport}
            disabled={!courseId || !batchId || loadingReport}
        >
          {loadingReport ? (
            <><Loader2 size={16} className="animate-spin" /> Loading...</>
          ) : (
            <><Search size={16} /> Load Report</>
          )}
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px] flex flex-col">
        
        {/* Table Toolbar */}
        <div className="px-6 py-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between backdrop-blur-sm">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <CalendarRange size={18} className="text-indigo-500" />
              Attendance Master Matrix
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
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 m-auto">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="font-medium">Loading attendance...</span>
            </div>
          ) : !hasFetched ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 m-auto">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <Search size={24} className="text-indigo-400" />
              </div>
              <p className="text-lg font-bold text-slate-600">Ready to Fetch</p>
              <p className="text-sm mt-1">Click "Load Report" to analyze attendance records.</p>
            </div>
          ) : reportData.students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 m-auto">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <Users size={24} className="text-indigo-400" />
              </div>
              <p className="text-lg font-bold text-slate-600">No Students Enrolled</p>
              <p className="text-sm mt-1">There are currently no students mapped to this batch.</p>
            </div>
          ) : filteredSessions.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-24 text-slate-400 m-auto">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <Inbox size={24} className="text-indigo-400" />
              </div>
              <p className="text-lg font-bold text-slate-600">No Sessions Found</p>
              <p className="text-sm mt-1">No attendance sessions were recorded for the selected time range.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-dashboard-scroll">
              <table className="min-w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[1px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      Student Details
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
                      Average
                    </th>
                    {filteredSessions.map((s) => (
                      <th key={s.id} className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[120px]">
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
                  {reportData.students.map((st) => {
                    const percent = getAttendancePercentage(st);

                    return (
                      <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100 shadow-[1px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{st.name}</span>
                            <span className="font-mono text-[11px] text-slate-500 tracking-tight">#{st.sid}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg border font-bold text-sm ${
                                percent >= 75 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : percent >= 50 
                                ? "bg-amber-50 text-amber-700 border-amber-200" 
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}>
                                {percent}%
                            </span>
                        </td>

                        {filteredSessions.map((s) => {
                          const status = st.attendance[s.id];
                          return (
                            <td key={s.id} className="px-4 py-4 text-center">
                              {status === "present" ? (
                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto" title="Present">
                                  <CheckCircle2 size={16} strokeWidth={3} />
                                </div>
                              ) : status === "absent" ? (
                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-200 mx-auto" title="Absent">
                                  <XCircle size={16} strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-200 mx-auto" title="Not Marked">
                                  <span className="text-xs font-bold">-</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}