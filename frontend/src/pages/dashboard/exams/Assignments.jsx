import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import {
  FileText,
  Plus,
  Loader2,
  Inbox,
  BookOpen,
  Layers,
  CalendarClock,
  Eye,
  DownloadCloud,
  ClipboardList,
  CheckCircle2,
  Clock
} from "lucide-react";

import AddAssignmentModal from "./AddAssignmentModal";
import ViewSubmissionsModal from "./ViewSubmissionsModal";

export default function Assignments({
    apiPrefix = "/admin",
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [showSubmissions, setShowSubmissions] = useState(false);

  /* ================= LOAD ================= */

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${apiPrefix}/assignments`);
      setRows(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiPrefix]);

  const openSubmissions = (id) => {
    setSelectedAssignmentId(id);
    setShowSubmissions(true);
  };

  /* ================= DERIVED STATS ================= */

  const activeAssignments = rows.filter(r => String(r.status).toLowerCase() === "active").length;
  const inactiveAssignments = rows.length - activeAssignments;

  /* ================= UI ================= */

  // 5 Columns: Title, Cohort, Deadline, Status, Actions
  const gridLayout = "grid grid-cols-[2fr_1.5fr_1.5fr_1fr_200px] gap-4 items-center";

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <ClipboardList className="text-indigo-600" size={32} />
            Assignments Center
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Create, distribute, and manage student assignments across all courses and batches.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="group flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 font-medium shrink-0"
        >
          <Plus size={18} className="group-hover:-translate-y-0.5 transition-transform" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
        <StatCard
          title="Total Assignments"
          value={rows.length}
          icon={<FileText size={24} />}
          colorTheme="blue"
        />
        <StatCard
          title="Active & Ongoing"
          value={activeAssignments}
          icon={<CheckCircle2 size={24} />}
          colorTheme="emerald"
        />
        <StatCard
          title="Closed / Past Deadline"
          value={inactiveAssignments}
          icon={<Clock size={24} />}
          colorTheme="rose"
        />
      </div>

      {/* DATA GRID CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px] flex flex-col animate-in slide-in-from-bottom-6 duration-700">
        
        {/* TABLE HEADERS */}
        <div className={`${gridLayout} px-6 py-4 bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider backdrop-blur-sm hidden md:grid shrink-0`}>
          <div>Assignment Title</div>
          <div>Cohort Details</div>
          <div>Deadline</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {/* TABLE BODY */}
        <div className="flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400 space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="font-medium text-sm tracking-wide">Fetching Assignments...</span>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-50/30">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm transition-transform hover:scale-105">
                <Inbox size={36} className="text-slate-300" />
              </div>
              <p className="text-lg font-bold text-slate-600">No Assignments Found</p>
              <p className="text-sm mt-1">Click "Create Assignment" to add a new record.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className={`${gridLayout} px-6 py-5 hover:bg-slate-50/80 transition-all duration-200 group items-center`}
                >
                  
                  {/* 1. TITLE */}
                  <div className="flex items-start gap-3 pr-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex flex-shrink-0 items-center justify-center text-indigo-500 border border-indigo-100 group-hover:bg-indigo-100 transition-colors mt-0.5">
                        <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-indigo-700 transition-colors" title={row.title}>
                        {row.title}
                      </div>
                    </div>
                  </div>

                  {/* 2. COHORT DETAILS */}
                  <div className="min-w-0 pr-4 space-y-1.5">
                    <div className="text-xs font-bold text-slate-700 truncate flex items-center gap-1.5">
                        <BookOpen size={14} className="text-indigo-400 shrink-0" />
                        <span className="truncate">{row.course?.name || "N/A"}</span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1.5 bg-slate-100 w-fit px-2 py-0.5 rounded-md border border-slate-200">
                        <Layers size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{row.batch?.name || "N/A"}</span>
                    </div>
                  </div>

                  {/* 3. DEADLINE */}
                  <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <CalendarClock size={16} className="text-slate-400 shrink-0" />
                    <span className="truncate">
                        {row.deadline ? new Date(row.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "No Deadline"}
                    </span>
                  </div>

                  {/* 4. STATUS */}
                  <div>
                    <StatusBadge status={row.status} />
                  </div>

                  {/* 5. ACTIONS */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openSubmissions(row.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 shadow-sm"
                    >
                      <Eye size={14} /> Submissions
                    </button>

                    {row.assignment_file && (
                      <a
                        href={`/api${apiPrefix}/assignments/${row.id}/file`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm hover:text-slate-900"
                      >
                        <DownloadCloud size={14} /> File
                      </a>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <AddAssignmentModal
        apiPrefix={apiPrefix}
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={loadData}
      />

      <ViewSubmissionsModal
        apiPrefix={apiPrefix}
        assignmentId={selectedAssignmentId}
        open={showSubmissions}
        onClose={() => setShowSubmissions(false)}
      />

    </div>
  );
}

// ================= REUSABLE UI COMPONENTS =================

function StatCard({ title, value, icon, colorTheme }) {
  const themes = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  const iconClasses = themes[colorTheme] || themes.blue;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${iconClasses} shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  
  if (s === "active" || s === "published") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 uppercase tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
        {status}
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 uppercase tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
      {status || "Inactive"}
    </span>
  );
}