import React, { useEffect, useState, Fragment } from "react";
import api from "../../../lib/api/apiClient";
import { useToast } from "../../../components/common/ToastProvider";
import { 
  Award, 
  BookOpen, 
  Layers, 
  Search, 
  Lock, 
  Edit2, 
  Save, 
  ChevronDown,
  X,
  MoreHorizontal,
  Filter,
  Loader2,
  Users
} from "lucide-react";

export default function PublishResults({
    apiPrefix = "/admin",
}) {
  const { toast } = useToast();

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");

  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [scoresDraft, setScoresDraft] = useState({});
  const [savingStudentId, setSavingStudentId] = useState(null);
  const [saveError, setSaveError] = useState("");

  // ---------------- LOADERS ----------------

  useEffect(() => {
    const courseEndpoint =
    apiPrefix === "/faculty"
        ? "/faculty/course-options"
        : `${apiPrefix}/courses`;
        api.get(courseEndpoint).then(res => setCourses(res.data)).catch(() => {});
  }, [apiPrefix]);

  useEffect(() => {
    if (!courseId) return;
    const batchEndpoint =
    apiPrefix === "/faculty"
        ? `/faculty/course-options/${courseId}/batches`
        : `${apiPrefix}/courses/${courseId}/batches`;

    api.get(batchEndpoint)
      .then(res => setBatches(res.data))
      .catch(() => {});
  }, [courseId, apiPrefix]);

  const loadResults = async () => {
    if (!courseId || !batchId) return;

    setIsLoading(true);
    try {
      const res = await api.get(`${apiPrefix}/exam-results`, {
        params: { course_id: courseId, batch_id: batchId },
      });

      setExams(res.data.exams || []);
      setStudents(res.data.students || []);
      setResults(res.data.results || {});
      setHasFetched(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- HELPERS ----------------

  const getScore = (studentId, examId) => {
    const row = results[studentId]?.find(r => r.exam_id === examId);
    return row?.score ?? "";
  };

  const isLocked = (studentId, examId) => {
    const row = results[studentId]?.find(r => r.exam_id === examId);
    return !!row?.certificate?.issued_at;
  };

  const calculateAverage = (studentId) => {
    const rows = results[studentId] || [];
    const valid = rows.filter(r => r.score !== null && r.score !== "");
    if (!valid.length) return "-";
    const sum = valid.reduce((a, b) => a + Number(b.score), 0);
    return (sum / valid.length).toFixed(2);
  };

  const toggleExpand = (studentId) => {
    if (expandedStudentId === studentId) {
        setExpandedStudentId(null);
        setEditingStudentId(null);
    } else {
        setExpandedStudentId(studentId);
    }
  };

  const startEdit = (studentId, e) => {
    e.stopPropagation();
    setEditingStudentId(studentId);
    setSaveError("");

    const draft = {};
    exams.forEach(exam => {
      draft[exam.id] = getScore(studentId, exam.id);
    });

    setScoresDraft(draft);
  };

  const saveScores = async (studentId, e) => {
    e.stopPropagation();

    // Client-side validation: scores must be between 0 and 100
    const hasInvalidScore = Object.entries(scoresDraft).some(([examId, score]) => {
      if (score === "" || isLocked(studentId, Number(examId))) return false;
      const num = Number(score);
      return Number.isNaN(num) || num < 0 || num > 100;
    });

    if (hasInvalidScore) {
      setSaveError("Scores must be between 0 and 100.");
      return;
    }

    const scores = Object.entries(scoresDraft)
      .filter(([examId]) => !isLocked(studentId, Number(examId)))
      .map(([examId, score]) => ({
        exam_id: examId,
        score: score === "" ? null : score,
      }));

    if (!scores.length) {
      setEditingStudentId(null);
      setSaveError("");
      return;
    }

    const payload = {
      student_id: studentId,
      scores,
    };

    setSavingStudentId(studentId);
    setSaveError("");
    try {
      await api.post(
        `${apiPrefix}/exam-results/save`,
        payload
      );

      setEditingStudentId(null);
      setScoresDraft({});
      loadResults();
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to save scores. Please try again.";
      toast(message, "error");
      setSaveError(message);
    } finally {
      setSavingStudentId(null);
    }
  };

  // ---------------- UI ----------------

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 space-y-8 animate-fade-in font-sans">
      {/* Custom Scrollbar */}
      <style>{`
        .custom-dashboard-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-dashboard-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb { background: rgb(var(--zx-border)); border-radius: 10px; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: rgb(var(--zx-text-muted)); }
      `}</style>
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
            <Award size={14} strokeWidth={2.5} />
            Assessment Results
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Publish Results
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Enter and manage exam scores for students. Locked scores indicate a certificate has already been issued.
          </p>
        </div>
      </div>

      {/* FILTERS & CONTROLS */}
      <div className="bg-[rgb(var(--zx-surface))]/90 p-4 rounded-2xl border border-[rgb(var(--zx-border))] shadow-sm flex flex-col md:flex-row gap-4 items-center sticky top-4 z-30 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider px-2 shrink-0">
            <Filter size={16} /> Cohort Filter
        </div>

        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Course Select */}
            <div className="relative group">
                <select
                    className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm cursor-pointer shadow-sm"
                    value={courseId}
                    onChange={(e) => {
                      setCourseId(e.target.value);
                      setExams([]);
                      setStudents([]);
                      setHasFetched(false);
                    }}
                >
                    <option value="">Select Academic Course</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <BookOpen className="absolute left-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
                <ChevronDown className="absolute right-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
            </div>

            {/* Batch Select */}
            <div className="relative group">
                <select
                    className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    value={batchId}
                    onChange={(e) => {
                      setBatchId(e.target.value);
                      setExams([]);
                      setStudents([]);
                      setHasFetched(false);
                    }}
                    disabled={!courseId}
                >
                    <option value="">Select Target Batch</option>
                    {batches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
                <Layers className="absolute left-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
                <ChevronDown className="absolute right-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
            </div>
        </div>

        <button 
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 shrink-0 w-full md:w-auto text-sm ${
              !courseId || !batchId || isLoading
              ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
              : "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-brand-teal-500/20"
            }`}
            onClick={loadResults}
            disabled={!courseId || !batchId || isLoading}
        >
          {isLoading ? (
            <><Loader2 size={16} className="animate-spin" /> Loading...</>
          ) : (
            <><Search size={16} /> Load Results</>
          )}
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] flex flex-col relative z-10">
        
        {/* Table Toolbar */}
        <div className="px-6 py-5 bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))] flex items-center justify-between">
            <h2 className="font-bold text-[rgb(var(--zx-text))] flex items-center gap-2 text-sm">
              <Award size={18} className="text-brand-teal-500" />
              Examination Results Matrix
            </h2>
            {students.length > 0 && (
              <span className="bg-brand-teal-500/10 border border-brand-teal-500/20 text-brand-teal-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {students.length} Students
              </span>
            )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!courseId || !batchId ? (
            <div className="flex flex-col items-center justify-center py-24 text-[rgb(var(--zx-text-muted))] m-auto">
              <div className="w-16 h-16 bg-[rgb(var(--zx-surface-hover))] rounded-2xl flex items-center justify-center mb-4 border border-[rgb(var(--zx-border))] shadow-sm text-[rgb(var(--zx-text-muted))]">
                <Filter size={24} />
              </div>
              <p className="text-[17px] font-bold text-[rgb(var(--zx-text))]">Select Cohort Parameters</p>
              <p className="text-[14px] text-[rgb(var(--zx-text-muted))] mt-1">Choose a specific course and batch to view results.</p>
            </div>
          ) : isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
              <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
              <span className="font-medium text-sm">Loading exams...</span>
            </div>
          ) : !hasFetched ? (
            <div className="flex flex-col items-center justify-center py-24 text-[rgb(var(--zx-text-muted))] m-auto">
              <div className="w-16 h-16 bg-[rgb(var(--zx-surface-hover))] rounded-2xl flex items-center justify-center mb-4 border border-[rgb(var(--zx-border))] shadow-sm text-[rgb(var(--zx-text-muted))]">
                <Search size={24} />
              </div>
              <p className="text-[17px] font-bold text-[rgb(var(--zx-text))]">Ready to Fetch</p>
              <p className="text-[14px] text-[rgb(var(--zx-text-muted))] mt-1">Click "Load Results" to fetch examination data.</p>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-[rgb(var(--zx-text-muted))] m-auto">
              <div className="w-16 h-16 bg-[rgb(var(--zx-surface-hover))] rounded-2xl flex items-center justify-center mb-4 border border-[rgb(var(--zx-border))] shadow-sm text-[rgb(var(--zx-text-muted))]">
                <Users size={24} />
              </div>
              <p className="text-[17px] font-bold text-[rgb(var(--zx-text))]">No Students Enrolled</p>
              <p className="text-[14px] text-[rgb(var(--zx-text-muted))] mt-1">There are currently no students mapped to this batch.</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-[rgb(var(--zx-text-muted))] m-auto">
              <div className="w-16 h-16 bg-[rgb(var(--zx-surface-hover))] rounded-2xl flex items-center justify-center mb-4 border border-[rgb(var(--zx-border))] shadow-sm text-[rgb(var(--zx-text-muted))]">
                <Award size={24} />
              </div>
              <p className="text-[17px] font-bold text-[rgb(var(--zx-text))]">No Exams Found</p>
              <p className="text-[14px] text-[rgb(var(--zx-text-muted))] mt-1">There are no completed exams configured for this cohort.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-dashboard-scroll">
              <table className="min-w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-[rgb(var(--zx-surface))] border-b border-[rgb(var(--zx-border))]">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider sticky left-0 bg-[rgb(var(--zx-surface))] z-10 border-r border-[rgb(var(--zx-border))] shadow-[1px_0_5px_-2px_rgba(0,0,0,0.1)]">SID</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Student Name</th>
                    {exams.map(exam => (
                      <th key={exam.id} className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider text-center">
                        {exam.name}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider text-center">Average</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[rgb(var(--zx-border))]">
                  {students.map(student => {
                    const isExpanded = expandedStudentId === student.id;
                    const isEditing = editingStudentId === student.id;

                    return (
                      <Fragment key={student.id}>
                        {/* DATA ROW */}
                        <tr 
                          className={`cursor-pointer transition-colors ${isExpanded ? 'bg-brand-teal-500/5' : 'hover:bg-[rgb(var(--zx-surface-hover))]'}`}
                          onClick={() => toggleExpand(student.id)}
                        >
                          <td className="px-6 py-5 sticky left-0 bg-[rgb(var(--zx-surface))] group-hover:bg-[rgb(var(--zx-surface-hover))] border-r border-[rgb(var(--zx-border))] shadow-[1px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">
                            <span className="font-mono text-[rgb(var(--zx-text-muted))] text-xs font-semibold bg-[rgb(var(--zx-surface-hover))] px-2.5 py-1 rounded-lg border border-[rgb(var(--zx-border))]">
                                {student.sid}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-bold text-[rgb(var(--zx-text))] text-sm">{student.user.name}</div>
                          </td>

                          {exams.map(exam => {
                            const locked = isLocked(student.id, exam.id);

                            return (
                              <td 
                                key={exam.id} 
                                className="px-6 py-5 text-center"
                              >
                                {isEditing ? (
                                  <div className="flex justify-center">
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`w-20 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:border-brand-teal-500 text-center font-bold text-[rgb(var(--zx-text))] transition-all ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                                        disabled={locked}
                                        placeholder="-"
                                        value={scoresDraft[exam.id] ?? ""}
                                        onChange={e =>
                                          !locked &&
                                          setScoresDraft(d => ({
                                            ...d,
                                            [exam.id]: e.target.value,
                                          }))
                                        }
                                      />
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-[rgb(var(--zx-text))]">
                                    {getScore(student.id, exam.id) || <span className="text-[rgb(var(--zx-text-muted))] font-normal">-</span>}
                                    {locked && (
                                      <Lock size={12} strokeWidth={3} className="text-[rgb(var(--zx-text-muted))]" />
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}

                          <td className="px-6 py-5 text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20 font-bold text-xs">
                                {calculateAverage(student.id)}
                            </span>
                          </td>
                          
                          <td className="px-6 py-5 text-right">
                              <div className={`p-2 rounded-xl inline-flex transition-transform duration-200 ${isExpanded ? 'rotate-90 bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20' : 'text-[rgb(var(--zx-text-muted))]'}`}>
                                  <MoreHorizontal size={18} />
                              </div>
                          </td>
                        </tr>

                        {/* EXPANDED ACTION ROW */}
                        {isExpanded && (
                          <tr className="bg-[rgb(var(--zx-surface-hover))]/50 animate-in fade-in duration-200">
                            <td colSpan={exams.length + 4} className="px-6 py-4 border-b border-[rgb(var(--zx-border))]">
                              <div className="flex justify-end gap-3">
                                <span className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider mr-auto flex items-center">
                                  {isEditing ? "Editing Scores..." : "Actions"}
                                </span>
                                
                                {isEditing ? (
                                  <>
                                    {saveError && (
                                      <span className="flex items-center text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 rounded-xl">
                                        {saveError}
                                      </span>
                                    )}

                                    <button
                                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] bg-[rgb(var(--zx-surface))] shadow-sm text-xs font-bold uppercase tracking-wider hover:bg-[rgb(var(--zx-surface-hover))] transition-all"
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingStudentId(null);
                                          setSaveError("");
                                      }}
                                    >
                                      <X size={14} /> Cancel
                                    </button>
                                    <button
                                      className={`flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white shadow-sm text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all active:scale-95 ${
                                        savingStudentId === student.id
                                          ? "opacity-70 cursor-not-allowed active:scale-100"
                                          : ""
                                      }`}
                                      onClick={(e) => saveScores(student.id, e)}
                                      disabled={savingStudentId === student.id}
                                    >
                                      {savingStudentId === student.id ? (
                                        <>
                                          <Loader2 size={14} className="animate-spin" /> Saving...
                                        </>
                                      ) : (
                                        <>
                                          <Save size={14} /> Save Scores
                                        </>
                                      )}
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] bg-[rgb(var(--zx-surface))] shadow-sm text-xs font-bold uppercase tracking-wider hover:border-brand-teal-500 hover:text-brand-teal-500 transition-all active:scale-95"
                                    onClick={(e) => startEdit(student.id, e)}
                                  >
                                    <Edit2 size={14} /> Enter Scores
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
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