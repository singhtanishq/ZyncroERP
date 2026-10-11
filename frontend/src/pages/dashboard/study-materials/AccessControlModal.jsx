import { useState, useEffect } from "react";
import api from "../../../lib/api/apiClient";
import AppModal from "../../../components/common/AppModal";
import { 
  Shield, 
  Users, 
  BookOpen, 
  Layers, 
  Save, 
  AlertCircle,
  Lock,
  CheckCircle2,
  ChevronDown
} from "lucide-react";

export default function AccessControlModal({
    open,
    material,
    onClose,
    onSaved,
    apiPrefix="/admin",
    isFaculty=false,
}) {
  const [accessType, setAccessType] = useState(
        isFaculty ? "batch" : "all"
    );
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [loadingAccess, setLoadingAccess] = useState(false);

  /* ================= LOAD ================= */

  useEffect(() => {
    if (!open) return;

    api.get(
        isFaculty
            ? "/faculty/course-options"
            : "/admin/courses"
    )
    .then((res) => setCourses(res.data))
    .catch(() => setCourses([]));
  }, [open, isFaculty]);

  useEffect(() => {
    if (!open || !material) return;

    const loadAccess = async () => {
        try {
            setLoadingAccess(true);

            const accessRes = await api.get(
                `${apiPrefix}/study-materials/${material.id}/access`
            );

            const rule = accessRes.data;

            setAccessType(rule.access_type);
            setCourseId(rule.course_id ?? "");

            if (rule.access_type === "batch" && rule.course_id) {
                const batchRes = await api.get(
                    isFaculty
                        ? `/faculty/course-options/${rule.course_id}/batches`
                        : `/admin/courses/${rule.course_id}/batches`
                );

                setBatches(batchRes.data);
                setBatchId(rule.batch_id ?? "");
            } else {
                setBatches([]);
                setBatchId("");
            }

            setError("");
        } catch {
            setError("Failed to load access settings");
        } finally {
            setLoadingAccess(false);
        }
    };

    loadAccess();
  }, [open, material?.id, apiPrefix, isFaculty]);

  useEffect(() => {
    if (loadingAccess) return;

    if (!courseId) {
        setBatches([]);
        setBatchId("");
        return;
    }

    api
      .get(isFaculty
        ? `/faculty/course-options/${courseId}/batches`
        : `/admin/courses/${courseId}/batches`)
      .then((res) => setBatches(res.data))
      .catch(() => setBatches([]));
  }, [courseId, loadingAccess, isFaculty]);

  if (!open || !material) return null;

  /* ================= SAVE ================= */

  const save = async () => {
    setError("");

    if (accessType === "course" && !courseId) {
      setError("Please select a course");
      return;
    }

    if (accessType === "batch" && (!courseId || !batchId)) {
      setError("Please select both course and batch");
      return;
    }

    try {
      setSaving(true);

      await api.post(`${apiPrefix}/study-materials/${material.id}/access`, {
        access_type: accessType,
        course_id:
        accessType === "batch" || accessType === "course"
            ? Number(courseId)
            : null,
        batch_id: accessType === "batch" ? Number(batchId) : null,
      });

      if (onSaved) {
        onSaved();
      } else {
        onClose();
      }
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Failed to update access rules"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Access Control"
      size="lg"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            disabled={loadingAccess || saving}
            onClick={save}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              saving
                ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
                : "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-brand-teal-500/20"
            }`}
          >
            {saving ? (
                <>
                 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                 <span>Updating...</span>
                </>
            ) : (
                <>
                    <Save size={16} /> Update Access
                </>
            )}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        
        {loadingAccess ? (
            <div className="py-16 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
                <p className="mt-5 text-sm text-[rgb(var(--zx-text-muted))] font-medium">
                    Loading access settings...
                </p>
            </div>
        ) : (
            <div className="space-y-6">
        
              {/* INFO BANNER */}
              <div className="bg-brand-teal-500/10 border border-brand-teal-500/20 rounded-2xl p-4 flex gap-3 items-start">
                  <div className="bg-[rgb(var(--zx-surface))] p-1.5 rounded-xl shadow-sm text-brand-teal-500 shrink-0 border border-[rgb(var(--zx-border))]">
                      <Lock size={16} />
                  </div>
                  <div className="text-sm text-[rgb(var(--zx-text))] pt-0.5">
                      You are editing permissions for <span className="font-bold block text-brand-teal-500 mt-0.5">{material.title}</span>
                  </div>
              </div>

              {/* ACCESS TYPE SELECT (Visual Cards) */}
              <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] ml-1">Who can view this?</label>
                  <div className="space-y-3">
                      {(isFaculty
                          ? [
                              {
                                  id: "batch",
                                  label: "Assigned Batch",
                                  icon: <Layers size={16}/>
                              }
                          ]
                          : [
                              {
                                  id: "all",
                                  label: "All Students",
                                  icon: <Users size={16}/>
                              },
                              {
                                  id: "course",
                                  label: "By Course",
                                  icon: <BookOpen size={16}/>
                              },
                              {
                                  id: "batch",
                                  label: "By Batch",
                                  icon: <Layers size={16}/>
                              }
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
                              <div className={`p-3 rounded-xl transition-colors ${
                                  accessType === opt.id 
                                  ? "bg-brand-teal-500 text-white shadow-md shadow-brand-teal-500/20" 
                                  : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))]"
                              }`}>
                                  {opt.icon}
                              </div>
                              <div>
                                  <div className={`font-bold text-sm ${accessType === opt.id ? "text-[rgb(var(--zx-text))]" : "text-[rgb(var(--zx-text))] opacity-90"}`}>
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
              </div>

              {/* CONDITIONAL DROPDOWNS */}
              <div className={`space-y-4 transition-all duration-300 ${!isFaculty && accessType === "all" ? 'hidden' : 'block animate-in slide-in-from-top-2'}`}>
                  {(
                      isFaculty
                          ? accessType === "batch"
                          : (accessType === "course" || accessType === "batch")
                  ) && (
                      <div>
                          <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 block ml-1">Select Course <span className="text-rose-500">*</span></label>
                          <div className="relative group">
                              <select
                                  value={courseId}
                                  onChange={(e) => setCourseId(e.target.value)}
                                  className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm cursor-pointer appearance-none shadow-sm"
                              >
                                  <option value="">-- Choose a course --</option>
                                  {courses.map((c) => (
                                      <option key={c.id} value={c.id}>
                                          {c.name}
                                      </option>
                                  ))}
                              </select>
                              <div className="absolute right-3.5 top-3.5 pointer-events-none text-[rgb(var(--zx-text-muted))]">
                                  <ChevronDown size={16} />
                              </div>
                          </div>
                      </div>
                  )}

                  {accessType === "batch" && (
                      <div>
                          <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 block ml-1">Select Batch <span className="text-rose-500">*</span></label>
                          <div className="relative group">
                              <select
                                  value={batchId}
                                  onChange={(e) => setBatchId(e.target.value)}
                                  disabled={!courseId}
                                  className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                              >
                                  <option value="">-- Choose a batch --</option>
                                  {batches.map((b) => (
                                      <option key={b.id} value={b.id}>
                                          {b.name}
                                      </option>
                                  ))}
                              </select>
                              <div className="absolute right-3.5 top-3.5 pointer-events-none text-[rgb(var(--zx-text-muted))]">
                                  <ChevronDown size={16} />
                              </div>
                          </div>
                      </div>
                  )}
              </div>

              {/* ERROR MESSAGE */}
              {error && (
                  <div className="flex items-center gap-3 text-sm text-rose-500 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 shadow-sm">
                      <AlertCircle size={18} className="shrink-0" />
                      <span className="font-semibold">{error}</span>
                  </div>
              )}
            </div>
        )}

      </div>
    </AppModal>
  );
}