import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { 
  X, 
  PlayCircle, 
  BookOpen, 
  Layers, 
  AlertCircle, 
  Info,
  ChevronDown
} from "lucide-react";

export default function StartAttendanceModal({
    open,
    onClose,
    onStarted,
    apiPrefix = "/admin",
    isFaculty = false,
}) {
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- LOAD COURSES ---------------- */
  useEffect(() => {
    if (!open) return;

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
  }, [open]);

  /* ---------------- LOAD BATCHES ---------------- */
  useEffect(() => {
    if (!open || !courseId) {
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
  }, [open, courseId]);

  if (!open) return null;

  const startAttendance = async () => {
    if (loading) return;

    if (!courseId || !batchId) {
      setError("Please select both course and batch");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post(
        `${apiPrefix}/attendance/sessions/start`,
        {
          course_id: Number(courseId),
          batch_id: Number(batchId),
        }
      );

      let data = res.data;

      if (typeof data === "string") {
        data = JSON.parse(data.replace(/^\uFEFF/, "").trim());
      }

      if (!data?.session_id || !data?.qr_token || !data?.expires_at) {
        console.error("Invalid attendance response:", data);
        throw new Error("Invalid server response");
      }

      onStarted(data);
    } catch (err) {
      console.error("Start attendance failed:", err);

      const message =
        err?.response?.data?.message ||
        "Failed to start attendance. Try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col relative transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Start Attendance</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-wide">Select cohort to launch QR session</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          
          {/* COURSE SELECT */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <BookOpen size={14} className="text-indigo-500" /> Select Course
            </label>
            <div className="relative group">
              <select
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none text-sm text-slate-700 font-medium disabled:opacity-50 cursor-pointer shadow-sm"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                disabled={loading}
              >
                <option value="">Choose a course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none opacity-60" size={16} />
            </div>
          </div>

          {/* BATCH SELECT */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-500" /> Select Batch
            </label>
            <div className="relative group">
              <select
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none text-sm text-slate-700 font-medium disabled:opacity-50 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                disabled={loading || !courseId}
              >
                <option value="">Choose a batch...</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} 
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none opacity-60" size={16} />
            </div>
          </div>

          {/* INFO BOX */}
          <div className="flex gap-3 bg-indigo-50/50 p-4 rounded-xl text-indigo-900 text-xs leading-relaxed border border-indigo-100 items-start">
              <div className="bg-white p-1 rounded-full shadow-sm text-indigo-500 shrink-0">
                  <Info size={14} />
              </div>
              <p className="pt-0.5">A unique QR code will be generated immediately. Students must scan it within the active time window to mark their presence.</p>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 animate-in slide-in-from-top-2 shadow-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all"
            >
                Cancel
            </button>
            <button
                disabled={loading}
                onClick={startAttendance}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                loading
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300"
                }`}
            >
                {loading ? (
                    <>
                        <span className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></span>
                        <span>Initializing...</span>
                    </>
                ) : (
                <>
                    <PlayCircle size={18} /> Launch Session
                </>
                )}
            </button>
        </div>

      </div>
    </div>
  );
}