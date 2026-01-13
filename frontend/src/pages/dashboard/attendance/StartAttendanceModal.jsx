import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import AppModal from "../../../components/common/AppModal";
import { 
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
  }, [open, isFaculty]);

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
  }, [open, courseId, isFaculty]);

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
    <AppModal
      open={open}
      onClose={onClose}
      title="Start Attendance"
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={startAttendance}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              loading
                ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
                : "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-brand-teal-500/20"
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <PlayCircle size={18} /> Launch Session
              </>
            )}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium uppercase tracking-wide -mt-2">
          Select cohort to launch QR session
        </p>

        {/* COURSE SELECT */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <BookOpen size={14} className="text-brand-teal-500" /> Select Course
          </label>
          <div className="relative group">
            <select
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] focus:outline-none focus:border-brand-teal-500 transition-all appearance-none text-sm text-[rgb(var(--zx-text))] font-semibold disabled:opacity-50 cursor-pointer shadow-sm"
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
            <ChevronDown className="absolute right-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
          </div>
        </div>

        {/* BATCH SELECT */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <Layers size={14} className="text-brand-teal-500" /> Select Batch
          </label>
          <div className="relative group">
            <select
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] focus:outline-none focus:border-brand-teal-500 transition-all appearance-none text-sm text-[rgb(var(--zx-text))] font-semibold disabled:opacity-50 disabled:bg-[rgb(var(--zx-surface-hover))] disabled:text-[rgb(var(--zx-text-muted))] disabled:cursor-not-allowed cursor-pointer shadow-sm"
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
            <ChevronDown className="absolute right-3.5 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
          </div>
        </div>

        {/* INFO BOX */}
        <div className="flex gap-3 bg-brand-teal-500/10 p-4 rounded-2xl text-[rgb(var(--zx-text))] text-xs leading-relaxed border border-brand-teal-500/20 items-start">
            <div className="bg-[rgb(var(--zx-surface))] p-1.5 rounded-xl shadow-sm text-brand-teal-500 shrink-0 border border-[rgb(var(--zx-border))]">
                <Info size={14} />
            </div>
            <p className="pt-0.5 font-medium">A unique QR code will be generated immediately. Students must scan it within the active time window to mark their presence.</p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="flex items-center gap-3 text-sm text-rose-500 bg-rose-500/10 p-3.5 rounded-2xl border border-rose-500/20 animate-in slide-in-from-top-2 shadow-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}
      </div>
    </AppModal>
  );
}