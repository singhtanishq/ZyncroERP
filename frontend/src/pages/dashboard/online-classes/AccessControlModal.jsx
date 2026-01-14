import { useEffect, useState } from "react";
import { Users, BookOpen, Layers, ChevronDown, CheckCircle2 } from "lucide-react";
import api from "../../../lib/api/apiClient";
import AppModal from "../../../components/common/AppModal";

export default function AccessControlModal({
  open,
  onClose,
  onBack,
  onSubmit,
  initialData = null,
  apiPrefix = "/admin",
  isFaculty = false,
}) {
  const [accessType, setAccessType] = useState(
      isFaculty ? "batch" : "all"
  );
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");

  const [loading, setLoading] = useState(false);

  /* ================= INIT / RESET ================= */

  useEffect(() => {
    if (!open) {
      setAccessType("all");
      setCourseId("");
      setBatchId("");
      setBatches([]);
      setLoading(false);
      return;
    }

    api.get(
        isFaculty
            ? "/faculty/course-options"
            : "/admin/courses"
    ).then((res) => {
      setCourses(res.data);
    }).catch(() => setCourses([]));
  }, [open, isFaculty]);

  /* ================= PREFILL (EDIT MODE) ================= */

  useEffect(() => {
    if (!open || !initialData) return;

    setAccessType(initialData.access_type || "all");
    setCourseId(
      initialData.course_id ? String(initialData.course_id) : ""
    );
    setBatchId(
      initialData.batch_id ? String(initialData.batch_id) : ""
    );
  }, [open, initialData]);

  /* ================= LOAD BATCHES ================= */

  useEffect(() => {
    let cancelled = false;

    if (accessType === "batch" && courseId) {
      setBatches([]);

      api.get(
        isFaculty
            ? `/faculty/course-options/${courseId}/batches`
            : `/admin/courses/${courseId}/batches`
    )
        .then((res) => {
          if (!cancelled) {
            setBatches(res.data);
          }
        })
        .catch(() => {
          if (!cancelled) setBatches([]);
        });
    } else {
      setBatches([]);
      setBatchId("");
    }

    return () => {
      cancelled = true;
    };
  }, [accessType, courseId, isFaculty]);

  if (!open) return null;

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (loading) return;

    if (accessType === "course" && !courseId) {
      alert("Please select a course");
      return;
    }

    if (accessType === "batch" && (!courseId || !batchId)) {
      alert("Please select both course and batch");
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        access_type: accessType,
        course_id:
          accessType === "batch" || accessType === "course"
              ? Number(courseId)
              : null,
        batch_id: accessType === "batch" ? Number(batchId) : null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Access Control"
      size="lg"
      footer={
        <div className="w-full flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
          >
            Back
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              loading
                ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
                : "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-brand-teal-500/20"
            }`}
          >
            {loading ? (
                 <>
                   <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   <span>Saving...</span>
                 </>
            ) : (
                "Save & Finish"
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* SUBHEADER CONTEXT */}
        <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2">
          Who can view this lecture?
        </p>

        {/* ACCESS TYPE SELECTION CARDS */}
        <div className="space-y-3">
            {(
                isFaculty
                    ? [
                        {
                            id: "batch",
                            label: "Assigned Batch",
                            desc: "Only your assigned batch can join",
                            icon: <Layers size={20} />,
                        }
                    ]
                    : [
                        {
                            id: "all",
                            label: "All Students",
                            desc: "Any enrolled student can join",
                            icon: <Users size={20} />,
                        },
                        {
                            id: "course",
                            label: "Specific Course",
                            desc: "Restrict access to a full course",
                            icon: <BookOpen size={20} />,
                        },
                        {
                            id: "batch",
                            label: "Specific Batch",
                            desc: "Restrict access to a specific batch",
                            icon: <Layers size={20} />,
                        },
                    ]
            ).map((opt) => (
                <label
                    key={opt.id}
                    className={`relative flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 group ${
                        accessType === opt.id
                            ? "border-brand-teal-500 bg-brand-teal-500/5 shadow-sm"
                            : "border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] hover:border-brand-teal-500/40 hover:bg-[rgb(var(--zx-surface-hover))]"
                    }`}
                >
                    <input
                        type="radio"
                        className="sr-only"
                        checked={accessType === opt.id}
                        onChange={() => setAccessType(opt.id)}
                    />

                    <div
                        className={`p-3 rounded-xl transition-colors ${
                            accessType === opt.id
                                ? "bg-brand-teal-500 text-white shadow-md shadow-brand-teal-500/20"
                                : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))]"
                        }`}
                    >
                        {opt.icon}
                    </div>

                    <div>
                        <div
                            className={`font-bold text-sm ${
                                accessType === opt.id
                                    ? "text-[rgb(var(--zx-text))]"
                                    : "text-[rgb(var(--zx-text))] opacity-90"
                            }`}
                        >
                            {opt.label}
                        </div>

                        <div className="text-xs text-[rgb(var(--zx-text-muted))] mt-0.5 font-medium">
                            {opt.desc}
                        </div>
                    </div>

                    {accessType === opt.id && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-teal-500 animate-in zoom-in duration-200">
                            <CheckCircle2 size={20} />
                        </div>
                    )}
                </label>
            ))}
        </div>

        {/* DYNAMIC FORM FIELDS */}
        <div className={`space-y-4 transition-all duration-300 ${accessType === 'all' ? 'opacity-50 grayscale pointer-events-none hidden' : 'opacity-100'}`}>
          
          {/* COURSE */}
          {(
              isFaculty
                  ? accessType === "batch"
                  : (accessType === "course" || accessType === "batch")
          ) && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 block ml-1">Select Course <span className="text-rose-500">*</span></label>
              <div className="relative group">
                  <select
                    className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm cursor-pointer shadow-sm"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  >
                    <option value="">-- Choose a Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[rgb(var(--zx-text-muted))]">
                      <ChevronDown size={16} />
                  </div>
              </div>
            </div>
          )}

          {/* BATCH */}
          {accessType === "batch" && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 block ml-1">Select Batch <span className="text-rose-500">*</span></label>
              <div className="relative group">
                  <select
                    className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    disabled={!courseId}
                  >
                    <option value="">{courseId ? "-- Choose a Batch --" : "Select a Course first"}</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[rgb(var(--zx-text-muted))]">
                      <ChevronDown size={16} />
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
}