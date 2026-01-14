import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import {
  FileText,
  Plus,
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
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 pt-0 space-y-8 animate-fade-in font-sans">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
            <ClipboardList size={14} strokeWidth={2.5} />
            Assessment Hub
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Assignments Center
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Create, distribute, and manage student assignments across all courses and batches.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="group flex items-center gap-2 px-6 py-3 bg-brand-teal-500 hover:bg-brand-teal-600 text-white rounded-2xl shadow-lg shadow-brand-teal-500/25 transition-all active:scale-95 font-semibold text-sm shrink-0"
        >
          <Plus size={18} className="group-hover:-translate-y-0.5 transition-transform" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500 relative z-10">
        <StatCard
          title="Total Assignments"
          value={rows.length}
          icon={<FileText size={22} />}
          colorTheme="blue"
        />
        <StatCard
          title="Active & Ongoing"
          value={activeAssignments}
          icon={<CheckCircle2 size={22} />}
          colorTheme="emerald"
        />
        <StatCard
          title="Closed / Past Deadline"
          value={inactiveAssignments}
          icon={<Clock size={22} />}
          colorTheme="rose"
        />
      </div>

      {/* DATA GRID CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] flex flex-col animate-in slide-in-from-bottom-6 duration-700 relative z-10">
        
        {/* TABLE HEADERS */}
        <div className={`${gridLayout} px-6 py-4 bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))] text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider hidden md:grid shrink-0`}>
          <div>Assignment Title</div>
          <div>Cohort Details</div>
          <div>Deadline</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {/* TABLE BODY */}
        <div className="flex-1 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-[rgb(var(--zx-text-muted))] space-y-3">
              <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
              <span className="font-medium text-sm tracking-wide">Fetching Assignments...</span>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-[rgb(var(--zx-text-muted))] bg-[rgb(var(--zx-surface))]">
              <div className="w-16 h-16 bg-[rgb(var(--zx-surface-hover))] rounded-2xl flex items-center justify-center mb-4 border border-[rgb(var(--zx-border))] shadow-sm text-[rgb(var(--zx-text-muted))]">
                <Inbox size={24} />
              </div>
              <p className="text-[17px] font-bold text-[rgb(var(--zx-text))]">No Assignments Found</p>
              <p className="text-[14px] text-[rgb(var(--zx-text-muted))] mt-1">Click "Create Assignment" to add a new record.</p>
            </div>
          ) : (
            <div className="divide-y divide-[rgb(var(--zx-border))]">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className={`${gridLayout} px-6 py-4 hover:bg-[rgb(var(--zx-surface-hover))] transition-all duration-200 group items-center`}
                >
                  
                  {/* 1. TITLE */}
                  <div className="flex items-start gap-3 pr-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-teal-500/10 flex flex-shrink-0 items-center justify-center text-brand-teal-500 border border-brand-teal-500/20 group-hover:bg-brand-teal-500/20 transition-colors mt-0.5">
                        <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[rgb(var(--zx-text))] text-sm md:text-base line-clamp-2 group-hover:text-brand-teal-500 transition-colors" title={row.title}>
                        {row.title}
                      </div>
                    </div>
                  </div>

                  {/* 2. COHORT DETAILS */}
                  <div className="min-w-0 pr-4 space-y-1.5">
                    <div className="text-xs font-bold text-[rgb(var(--zx-text))] truncate flex items-center gap-1.5">
                        <BookOpen size={14} className="text-brand-teal-500 shrink-0" />
                        <span className="truncate">{row.course?.name || "N/A"}</span>
                    </div>
                    <div className="text-[11px] font-medium text-[rgb(var(--zx-text-muted))] truncate flex items-center gap-1.5 bg-[rgb(var(--zx-surface-hover))] w-fit px-2.5 py-0.5 rounded-lg border border-[rgb(var(--zx-border))]">
                        <Layers size={12} className="text-[rgb(var(--zx-text-muted))] shrink-0" />
                        <span className="truncate">{row.batch?.name || "N/A"}</span>
                    </div>
                  </div>

                  {/* 3. DEADLINE */}
                  <div className="text-sm font-medium text-[rgb(var(--zx-text-muted))] flex items-center gap-2">
                    <CalendarClock size={16} className="text-[rgb(var(--zx-text-muted))] shrink-0" />
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 bg-brand-teal-500/10 text-brand-teal-500 hover:bg-brand-teal-500/20 border border-brand-teal-500/20 shadow-sm"
                    >
                      <Eye size={14} /> Submissions
                    </button>

                    {row.assignment_file && (
                      <a
                        href={`/api${apiPrefix}/assignments/${row.id}/file`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] shadow-sm"
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
    blue: "bg-brand-blue-500/10 text-brand-blue-500 border-brand-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };

  const iconClasses = themes[colorTheme] || themes.blue;

  return (
    <div className="bg-[rgb(var(--zx-surface))] rounded-3xl p-5 border border-[rgb(var(--zx-border))] shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${iconClasses} shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider mb-0.5">{title}</p>
        <h3 className="text-2xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight">{value}</h3>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  
  if (s === "active" || s === "published") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20 uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
        {status}
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] text-[10px] font-bold border border-[rgb(var(--zx-border))] uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--zx-text-muted))] shrink-0"></span>
      {status || "Inactive"}
    </span>
  );
}