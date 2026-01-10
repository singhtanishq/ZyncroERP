import { useEffect, useState } from "react";
import { X, Users, BookOpen, Layers } from "lucide-react";
import api from "../../../lib/api/apiClient";

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
    });
  }, [open]);

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
        });
    } else {
      setBatches([]);
      setBatchId("");
    }

    return () => {
      cancelled = true;
    };
  }, [accessType, courseId]);

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
          accessType === "batch"
              ? Number(courseId)
              : null,
        batch_id: accessType === "batch" ? Number(batchId) : null,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white w-[500px] rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Access Control</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Who can view this lecture?</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          
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
                              active: "border-purple-600 bg-purple-50/30",
                              iconBg: "bg-purple-600 text-white",
                              iconIdle: "bg-slate-100 text-slate-500 group-hover:bg-purple-100 group-hover:text-purple-600",
                              dot: "bg-purple-600 shadow-purple-300",
                              text: "text-purple-900",
                          }
                      ]
                      : [
                          {
                              id: "all",
                              label: "All Students",
                              desc: "Any enrolled student can join",
                              icon: <Users size={20} />,
                              active: "border-indigo-600 bg-indigo-50/30",
                              iconBg: "bg-indigo-600 text-white",
                              iconIdle: "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600",
                              dot: "bg-indigo-600 shadow-indigo-300",
                              text: "text-indigo-900",
                          },
                          {
                              id: "course",
                              label: "Specific Course",
                              desc: "Restrict access to a full course",
                              icon: <BookOpen size={20} />,
                              active: "border-blue-600 bg-blue-50/30",
                              iconBg: "bg-blue-600 text-white",
                              iconIdle: "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600",
                              dot: "bg-blue-600 shadow-blue-300",
                              text: "text-blue-900",
                          },
                          {
                              id: "batch",
                              label: "Specific Batch",
                              desc: "Restrict access to a specific batch",
                              icon: <Layers size={20} />,
                              active: "border-purple-600 bg-purple-50/30",
                              iconBg: "bg-purple-600 text-white",
                              iconIdle: "bg-slate-100 text-slate-500 group-hover:bg-purple-100 group-hover:text-purple-600",
                              dot: "bg-purple-600 shadow-purple-300",
                              text: "text-purple-900",
                          },
                      ]
              ).map((opt) => (
                  <label
                      key={opt.id}
                      className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                          accessType === opt.id
                              ? opt.active
                              : "border-slate-100 hover:bg-slate-50"
                      }`}
                  >
                      <input
                          type="radio"
                          className="sr-only"
                          checked={accessType === opt.id}
                          onChange={() => setAccessType(opt.id)}
                      />

                      <div
                          className={`p-3 rounded-full ${
                              accessType === opt.id
                                  ? opt.iconBg
                                  : opt.iconIdle
                          }`}
                      >
                          {opt.icon}
                      </div>

                      <div>
                          <div
                              className={`font-bold text-sm ${
                                  accessType === opt.id
                                      ? opt.text
                                      : "text-slate-700"
                              }`}
                          >
                              {opt.label}
                          </div>

                          <div className="text-xs text-slate-500 mt-0.5">
                              {opt.desc}
                          </div>
                      </div>

                      {accessType === opt.id && (
                          <div
                              className={`absolute right-4 w-3 h-3 rounded-full ${opt.dot}`}
                          />
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
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block ml-1">Select Course <span className="text-red-500">*</span></label>
                <div className="relative">
                    <select
                      className="w-full appearance-none bg-white border border-slate-300 text-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm"
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
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                </div>
              </div>
            )}

            {/* BATCH */}
            {accessType === "batch" && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block ml-1">Select Batch <span className="text-red-500">*</span></label>
                <div className="relative">
                    <select
                      className="w-full appearance-none bg-white border border-slate-300 text-slate-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
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
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-200 transition-all text-sm"
          >
            Back
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
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
      </div>
    </div>
  );
}