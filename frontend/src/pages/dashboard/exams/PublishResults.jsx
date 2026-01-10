import React, { useEffect, useState, Fragment } from "react";
import api from "../../../lib/api/apiClient";
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
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");

  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); // NEW: Tracks if we have actually fetched data

  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [scoresDraft, setScoresDraft] = useState({});

  // ---------------- LOADERS ----------------

  useEffect(() => {
    const courseEndpoint =
    apiPrefix === "/faculty"
        ? "/faculty/course-options"
        : `${apiPrefix}/courses`;
        api.get(courseEndpoint).then(res => setCourses(res.data));
  }, []);

  useEffect(() => {
    if (!courseId) return;
    const batchEndpoint =
    apiPrefix === "/faculty"
        ? `/faculty/course-options/${courseId}/batches`
        : `${apiPrefix}/courses/${courseId}/batches`;

api.get(batchEndpoint)
      .then(res => setBatches(res.data));
  }, [courseId]);

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
      setHasFetched(true); // Marks that a fetch successfully completed
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
        setEditingStudentId(null); // Cancel editing if row is collapsed
    } else {
        setExpandedStudentId(studentId);
    }
  };

  const startEdit = (studentId, e) => {
    e.stopPropagation(); // Prevent row from collapsing when clicking edit
    setEditingStudentId(studentId);

    const draft = {};
    exams.forEach(exam => {
      draft[exam.id] = getScore(studentId, exam.id);
    });

    setScoresDraft(draft);
  };

  const saveScores = async (studentId, e) => {
    e.stopPropagation();

    const scores = Object.entries(scoresDraft)
      .filter(([examId]) => !isLocked(studentId, Number(examId)))
      .map(([examId, score]) => ({
        exam_id: examId,
        score: score === "" ? null : score,
      }));

    if (!scores.length) {
      setEditingStudentId(null);
      return;
    }

    const payload = {
      student_id: studentId,
      scores,
    };

    await api.post(
    `${apiPrefix}/exam-results/save`,
    payload
);

    setEditingStudentId(null);
    setScoresDraft({});
    loadResults(); // Refetch to get updated results
  };

  // ---------------- UI ----------------

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
            <Award className="text-indigo-600" size={32} />
            Publish Results
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Enter and manage exam scores for students. Locked scores indicate a certificate has already been issued.
          </p>
        </div>
      </div>

      {/* FILTERS & CONTROLS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center sticky top-4 z-30 backdrop-blur-xl bg-white/90">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">
            <Filter size={16} /> Cohort Filter
        </div>

        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Course Select */}
            <div className="relative group">
                <select
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-semibold text-sm cursor-pointer"
                    value={courseId}
                    onChange={(e) => {
                      setCourseId(e.target.value);
                      // Clear results out of view when changing filters
                      setExams([]);
                      setStudents([]);
                      setHasFetched(false); // Reset fetch status
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
                      // Clear results out of view when changing filters
                      setExams([]);
                      setStudents([]);
                      setHasFetched(false); // Reset fetch status
                    }}
                    disabled={!courseId}
                >
                    <option value="">Select Target Batch</option>
                    {batches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
                <Layers className={`absolute left-3.5 top-3.5 pointer-events-none transition-colors ${!courseId ? 'text-slate-300' : 'text-slate-400 group-hover:text-indigo-500'}`} size={16} />
                <ChevronDown className={`absolute right-3.5 top-3.5 pointer-events-none transition-colors ${!courseId ? 'text-slate-300' : 'text-slate-400'}`} size={16} />
            </div>
        </div>

        <button 
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 shrink-0 w-full md:w-auto ${
              !courseId || !batchId || isLoading
              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-green-600 text-white hover:bg-green-700 shadow-slate-200"
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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px] flex flex-col">
        
        {/* Table Toolbar */}
        <div className="px-6 py-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between backdrop-blur-sm">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Award size={18} className="text-indigo-500" />
              Examination Results Matrix
            </h2>
            {students.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  {students.length} Students
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
              <p className="text-lg font-bold text-slate-600">Select Cohort Parameters</p>
              <p className="text-sm mt-1">Choose a specific course and batch to view results.</p>
            </div>
          ) : isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="font-medium">Loading exams...</span>
            </div>
          ) : !hasFetched ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 m-auto">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <Search size={24} className="text-indigo-400" />
              </div>
              <p className="text-lg font-bold text-slate-600">Ready to Fetch</p>
              <p className="text-sm mt-1">Click "Load Results" to fetch examination data.</p>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 m-auto">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <Users size={24} className="text-indigo-400" />
              </div>
              <p className="text-lg font-bold text-slate-600">No Students Enrolled</p>
              <p className="text-sm mt-1">There are currently no students mapped to this batch.</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 m-auto">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <Award size={24} className="text-indigo-400" />
              </div>
              <p className="text-lg font-bold text-slate-600">No Exams Found</p>
              <p className="text-sm mt-1">There are no completed exams configured for this cohort.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-dashboard-scroll">
              <table className="min-w-full text-left border-collapse whitespace-nowrap">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[1px_0_5px_-2px_rgba(0,0,0,0.1)]">SID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                    {exams.map(exam => (
                      <th key={exam.id} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        {exam.name}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Average</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {students.map(student => {
                    const isExpanded = expandedStudentId === student.id;
                    const isEditing = editingStudentId === student.id;

                    return (
                      <Fragment key={student.id}>
                        {/* DATA ROW */}
                        <tr 
                          className={`cursor-pointer transition-colors ${isExpanded ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
                          onClick={() => toggleExpand(student.id)}
                        >
                          <td className="px-6 py-5 sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100 shadow-[1px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">
                            <span className="font-mono text-slate-500 text-xs font-bold bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                {student.sid}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="font-bold text-slate-800 text-sm">{student.user.name}</div>
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
                                        onClick={(e) => e.stopPropagation()} // Prevent row toggle when typing
                                        className={`w-20 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-center font-bold text-slate-800 transition-all ${locked ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200" : ""}`}
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
                                  <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-slate-700">
                                    {getScore(student.id, exam.id) || <span className="text-slate-300 font-normal">-</span>}
                                    {locked && (
                                      <Lock size={12} strokeWidth={3} className="text-slate-400" />
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}

                          <td className="px-6 py-5 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-xs">
                                {calculateAverage(student.id)}
                            </span>
                          </td>
                          
                          <td className="px-6 py-5 text-right">
                              <div className={`p-1.5 rounded-full inline-block transition-transform duration-200 ${isExpanded ? 'rotate-90 bg-indigo-100 text-indigo-600' : 'text-slate-300'}`}>
                                  <MoreHorizontal size={18} />
                              </div>
                          </td>
                        </tr>

                        {/* EXPANDED ACTION ROW */}
                        {isExpanded && (
                          <tr className="bg-indigo-50/30 animate-in fade-in duration-200">
                            <td colSpan={exams.length + 4} className="px-6 py-4 border-b border-slate-100">
                              <div className="flex justify-end gap-3">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-auto flex items-center">
                                  {isEditing ? "Editing Scores..." : "Actions"}
                                </span>
                                
                                {isEditing ? (
                                  <>
                                    <button
                                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 bg-white shadow-sm text-xs font-bold uppercase tracking-wide hover:bg-slate-50 transition-all"
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingStudentId(null);
                                      }}
                                    >
                                      <X size={14} /> Cancel
                                    </button>
                                    <button
                                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white shadow-sm text-xs font-bold uppercase tracking-wide hover:bg-emerald-700 transition-all active:scale-95"
                                      onClick={(e) => saveScores(student.id, e)}
                                    >
                                      <Save size={14} /> Save Scores
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 bg-white shadow-sm text-xs font-bold uppercase tracking-wide hover:border-indigo-300 hover:text-indigo-600 transition-all active:scale-95"
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