import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import { 
  X, 
  Shield, 
  Users, 
  BookOpen, 
  Layers, 
  Save, 
  AlertCircle,
  Lock,
  CheckCircle2
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

}, [open, material?.id]);

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
      .then((res) => setBatches(res.data));
  }, [courseId, loadingAccess]);

  if (!open || !material) return null;

  /* ================= SAVE ================= */

  const save = async () => {
    setError("");

    if (accessType === "batch" && (!courseId || !batchId)) {
      setError("Please select both course and batch");
      return;
    }

    try {
      setSaving(true);

      await api.post(`${apiPrefix}/study-materials/${material.id}/access`, {
        access_type: accessType,
        course_id:
        accessType === "batch"
            ? courseId
            : null,
        batch_id: accessType === "batch" ? batchId : null,
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

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm text-indigo-600">
                <Shield size={20} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-900">Access Control</h2>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Manage visibility permissions</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6">

            {loadingAccess ? (

                <div className="py-16 flex flex-col items-center justify-center">

                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>

                    <p className="mt-5 text-sm text-slate-500 font-medium">
                        Loading access settings...
                    </p>

                </div>

            ) : (

                <div className="space-y-6">
            
            {/* INFO BANNER */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-3 items-start">
                <div className="bg-white p-1.5 rounded-lg shadow-sm text-indigo-500 shrink-0">
                    <Lock size={16} />
                </div>
                <div className="text-sm text-indigo-900 pt-0.5">
                    You are editing permissions for <span className="font-bold block text-indigo-700">{material.title}</span>
                </div>
            </div>

            {/* ACCESS TYPE SELECT (Visual Cards) */}
            <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Who can view this?</label>
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
                            className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                                accessType === opt.id 
                                ? "border-indigo-600 bg-indigo-50/30" 
                                : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                            }`}
                        >
                            <input
                                type="radio"
                                className="sr-only"
                                checked={accessType === opt.id}
                                onChange={() => setAccessType(opt.id)}
                            />
                            <div className={`p-3 rounded-full transition-colors ${
                                accessType === opt.id 
                                ? "bg-indigo-600 text-white" 
                                : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                            }`}>
                                {opt.icon}
                            </div>
                            <div>
                                <div className={`font-bold text-sm ${accessType === opt.id ? "text-indigo-900" : "text-slate-700"}`}>
                                    {opt.label}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5 font-medium">
                                    {opt.desc}
                                </div>
                            </div>
                            {accessType === opt.id && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600 animate-in zoom-in duration-200">
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
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block ml-1">Select Course <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                className="w-full bg-white border border-slate-300 text-slate-700 pl-4 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm appearance-none"
                            >
                                <option value="">-- Choose a course --</option>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                            </div>
                        </div>
                    </div>
                )}

                {accessType === "batch" && (
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block ml-1">Select Batch <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                value={batchId}
                                onChange={(e) => setBatchId(e.target.value)}
                                disabled={!courseId}
                                className="w-full bg-white border border-slate-300 text-slate-700 pl-4 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm appearance-none disabled:bg-slate-50 disabled:text-slate-400"
                            >
                                <option value="">-- Choose a batch --</option>
                                {batches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                             <div className="absolute right-3 top-3 pointer-events-none text-slate-400 opacity-60">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 animate-in slide-in-from-top-2 shadow-sm">
                    <AlertCircle size={18} className="shrink-0" />
                    <span className="font-medium">{error}</span>
                </div>
            )}
                </div>

            )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            disabled={loadingAccess}
            onClick={save}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              saving
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300"
            }`}
          >
            {saving ? (
                <>
                 <span className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></span>
                 <span>Updating...</span>
                </>
            ) : (
                <>
                    <Save size={16} /> Update Access
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
