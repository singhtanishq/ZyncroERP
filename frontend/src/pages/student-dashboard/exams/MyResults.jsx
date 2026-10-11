import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { ErrorState } from "../../../components/common/States";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  BookOpen,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Loader2,
  Inbox,
  Hash,
  TrendingUp,
  Layers
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function MyResults() {
  const [enrollments, setEnrollments] = useState([]);
  const [selected, setSelected] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [resultsError, setResultsError] = useState("");

  const loadEnrollments = () => {
    setEnrollError("");
    api
      .get("/student/results/enrollments")
      .then((res) => setEnrollments(res.data || []))
      .catch(() =>
        setEnrollError("Unable to load your enrollments. Please try again.")
      );
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadResults = async (value) => {
    setSelected(value);
    setResults([]);

    if (!value) {
      setResultsError("");
      return;
    }

    const [courseId, batchId] = value.split("|");

    setLoading(true);
    setResultsError("");

    try {
      const res = await api.get(
        `/student/results/${courseId}/${batchId}`
      );

      setResults(res.data || []);
    } catch (err) {
      setResultsError(
        err?.response?.data?.message ||
          "Unable to load results for this enrollment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const average =
    results.length > 0
      ? (
          results
            .filter((r) => r.score !== null)
            .reduce((sum, r) => sum + Number(r.score), 0) /
          results.filter((r) => r.score !== null).length
        ).toFixed(2)
      : "-";

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 font-sans overflow-x-hidden pb-24">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-4">
            <div className="flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm text-white shrink-0">
              <Award size={24} />
            </div>
            My Results
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-3 text-m max-w-2xl leading-relaxed">
            Review your published examination scores and track your overall academic performance across enrolled courses.
          </p>
        </motion.div>

        {/* CONTROLS & FILTERS */}
        <motion.div variants={itemVariants} className="relative group max-w-xl mb-10 z-20">
          {enrollError ? (
            <ErrorState
              message={enrollError}
              onRetry={loadEnrollments}
            />
          ) : (
            <>
          <BookOpen
            size={20}
            className="absolute left-4 top-3.5 text-[rgb(var(--zx-text-muted))] group-focus-within:text-indigo-500 transition-colors duration-300 z-10"
          />
          <select
            value={selected}
            onChange={(e) => loadResults(e.target.value)}
            className="w-full appearance-none pl-12 pr-10 py-3.5 bg-[rgb(var(--zx-surface))] backdrop-blur-xl rounded-2xl border border-[rgb(var(--zx-border))] shadow-[0_2px_10px_rgb(0,0,0,0.02)] focus:bg-[rgb(var(--zx-surface))] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all duration-300 text-[rgb(var(--zx-text))] font-medium cursor-pointer"
          >
            <option value="">Select Course & Batch...</option>
            {enrollments.map((item, i) => (
              <option
                key={i}
                value={`${item.course_id}|${item.batch_id}`}
              >
                {item.course_name} • {item.batch_name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={20}
            className="absolute right-4 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none"
          />
            </>
          )}
        </motion.div>

        {/* CONTENT AREA */}
        <motion.div variants={itemVariants} className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* STATE 1: NO ENROLLMENT SELECTED */}
            {!selected && (
              <motion.div 
                key="empty-select"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[rgb(var(--zx-surface))] backdrop-blur-2xl rounded-3xl border border-[rgb(var(--zx-border))] shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-32 flex flex-col items-center transition-all duration-500"
              >
                <div className="bg-[rgb(var(--zx-surface-hover))] p-6 rounded-full mb-6">
                  <Search size={48} className="text-[rgb(var(--zx-text-muted))]" />
                </div>
                <h3 className="text-2xl font-bold text-[rgb(var(--zx-text))] tracking-tight">
                  Select an Enrollment
                </h3>
                <p className="mt-2 text-[rgb(var(--zx-text-muted))] font-medium text-center max-w-md">
                  Choose a specific course and batch from the dropdown above to view your examination results.
                </p>
              </motion.div>
            )}

            {/* STATE 2: LOADING RESULTS */}
            {selected && loading && (
              <motion.div 
                key="loading-results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-32 text-[rgb(var(--zx-text-muted))] bg-[rgb(var(--zx-surface))] backdrop-blur-2xl rounded-3xl border border-[rgb(var(--zx-border))] shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
                <p className="font-medium tracking-wide">Fetching scorecards...</p>
              </motion.div>
            )}

            {/* STATE 3: RESULTS FAILED TO LOAD */}
            {selected && !loading && resultsError && (
              <motion.div
                key="error-results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[rgb(var(--zx-surface))] backdrop-blur-2xl rounded-3xl border border-[rgb(var(--zx-border))] shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <ErrorState
                  message={resultsError}
                  onRetry={() => loadResults(selected)}
                />
              </motion.div>
            )}

            {/* STATE 4: ENROLLMENT SELECTED BUT NO RESULTS */}
            {selected && !loading && !resultsError && results.length === 0 && (
              <motion.div 
                key="empty-results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[rgb(var(--zx-surface))] backdrop-blur-2xl rounded-3xl border border-[rgb(var(--zx-border))] shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-32 flex flex-col items-center transition-all duration-500"
              >
                <div className="bg-[rgb(var(--zx-surface-hover))] p-6 rounded-full mb-6">
                  <Inbox size={48} className="text-[rgb(var(--zx-text-muted))]" />
                </div>
                <h3 className="text-2xl font-bold text-[rgb(var(--zx-text))] tracking-tight">
                  No Results Published
                </h3>
                <p className="mt-2 text-[rgb(var(--zx-text-muted))] font-medium text-center max-w-md">
                  Your examination results for this course have not been published yet.
                </p>
              </motion.div>
            )}

            {/* STATE 5: RESULTS RENDERED */}
            {selected && !loading && !resultsError && results.length > 0 && (
              <motion.div 
                key="results-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6"
              >
                {/* OVERALL PERFORMANCE BANNER */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-[0_8px_30px_rgb(79,70,229,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
                >
                  <div className="absolute right-0 top-0 w-64 h-64 bg-[rgb(var(--zx-surface))] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                  
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/20">
                      <TrendingUp size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-2xl tracking-tight">Performance Summary</h3>
                      <p className="text-indigo-100 font-medium text-sm mt-0.5">Aggregate score across all published assessments</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 bg-white/10 px-6 py-4 rounded-2xl border border-white/20 backdrop-blur-sm flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">Cumulative Average</span>
                    <span className="text-3xl font-black text-white">{average}</span>
                  </div>
                </motion.div>

                {/* RESULT TABLE */}
                <div className="bg-[rgb(var(--zx-surface))] backdrop-blur-2xl rounded-3xl border border-[rgb(var(--zx-border))] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                      <thead>
                        <tr className="bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] text-xs uppercase tracking-wider font-bold">
                          <th className="p-5 pl-6">Examination Details</th>
                          <th className="p-5">Program Details</th>
                          <th className="p-5">Status</th>
                          <th className="p-5 pr-6 text-right">Final Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgb(var(--zx-border))]">
                        {results.map((result, idx) => {
                          
                          // Determine theme based on status
                          let theme = {
                            badge: "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border-[rgb(var(--zx-border))]",
                            icon: <Clock size={14} />,
                            scoreColor: "text-[rgb(var(--zx-text))]"
                          };

                          if (result.status === "passed") {
                            theme = {
                              badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
                              icon: <CheckCircle2 size={14} />,
                              scoreColor: "text-emerald-600"
                            };
                          } else if (result.status === "failed") {
                            theme = {
                              badge: "bg-rose-50 text-rose-700 border-rose-200/60",
                              icon: <XCircle size={14} />,
                              scoreColor: "text-rose-600"
                            };
                          } else if (result.status === "pending") {
                            theme = {
                              badge: "bg-amber-50 text-amber-700 border-amber-200/60",
                              icon: <Clock size={14} />,
                              scoreColor: "text-amber-600"
                            };
                          }

                          return (
                            <tr 
                              key={result.exam_id} 
                              className="group hover:bg-[rgb(var(--zx-surface-hover))] transition-all duration-300"
                            >
                              <td className="p-5 pl-6">
                                <div className="flex items-center gap-4">
                                  <div className="bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] rounded-xl p-2.5 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors duration-300 shadow-sm">
                                    <Award size={18} />
                                  </div>
                                  <div className="flex flex-col whitespace-normal min-w-0 max-w-sm">
                                    <h3 className="font-bold text-[rgb(var(--zx-text))] text-base group-hover:text-indigo-900 transition-colors duration-300 line-clamp-2 leading-tight">
                                      {result.exam_name}
                                    </h3>
                                    {result.exam_category && (
                                      <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-[rgb(var(--zx-text-muted))]">
                                        <Hash size={12} className="text-[rgb(var(--zx-text-muted))]" />
                                        {result.exam_category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              
                              <td className="p-5">
                                <div className="flex flex-col gap-1.5 text-sm font-medium">
                                  <span className="text-[rgb(var(--zx-text))] flex items-center gap-2">
                                    <BookOpen size={14} className="text-[rgb(var(--zx-text-muted))]" /> 
                                    {result.course?.name || "N/A"}
                                  </span>
                                  <span className="text-[rgb(var(--zx-text-muted))] flex items-center gap-2">
                                    <Layers size={14} className="text-[rgb(var(--zx-text-muted))]" /> 
                                    {result.batch?.name || "N/A"}
                                  </span>
                                </div>
                              </td>

                              <td className="p-5">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border ${theme.badge}`}>
                                  {theme.icon}
                                  {result.status}
                                </span>
                              </td>

                              <td className="p-5 pr-6 text-right">
                                <span className={`text-xl font-black tracking-tight ${theme.scoreColor}`}>
                                  {result.score ?? "-"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </motion.div>
    </div>
  );
}