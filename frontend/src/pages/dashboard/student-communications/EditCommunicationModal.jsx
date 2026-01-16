import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import AppModal from "../../../components/common/AppModal";

import {
  Save,
  Megaphone,
  Globe,
  BookOpen,
  Layers,
  ChevronDown,
  AlertCircle,
  Type,
  AlignLeft,
} from "lucide-react";

export default function EditCommunicationModal({
  apiPrefix="/admin",
  open,
  communication,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    title: "",
    message: "",
  });

  const [accessType, setAccessType] =
    useState("all");

  const [courseId, setCourseId] =
    useState("");

  const [batchId, setBatchId] =
    useState("");

  const [courses, setCourses] =
    useState([]);

  const [batches, setBatches] =
    useState([]);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const isFaculty =
    apiPrefix === "/faculty";

  useEffect(() => {
    if (!open) return;

   const courseEndpoint =
    isFaculty
        ? "/faculty/course-options"
        : `${apiPrefix}/courses`;

    api.get(courseEndpoint)
      .then((res) =>
        setCourses(res.data || [])
      )
      .catch(() => {});
  }, [open, apiPrefix, isFaculty]);

  useEffect(() => {
    if (!courseId) {
      setBatchId("");
      setBatches([]);
      return;
    }

    const batchEndpoint =
    isFaculty
        ? `/faculty/course-options/${courseId}/batches`
        : `${apiPrefix}/courses/${courseId}/batches`;

    api.get(batchEndpoint)
      .then((res) =>
        setBatches(res.data || [])
      )
      .catch(() => {});
  }, [courseId, apiPrefix, isFaculty]);

  useEffect(() => {
    if (!open || !communication) return;

      async function loadCommunication() {

          setForm({
              title: communication.title || "",
              message: communication.message || "",
          });

          setError("");

          try {

              const res = await api.get(
                  `${apiPrefix}/student-communications/${communication.id}/access`
              );

              const access = res.data?.[0];

              if (!access) {

                  setAccessType(
                      isFaculty
                          ? "batch"
                          : "all"
                  );

                  setCourseId("");
                  setBatchId("");

                  return;
              }

              setAccessType(
                isFaculty
                    ? "batch"
                    : access.access_type
            );

              setCourseId(
                  access.course_id
                      ? String(access.course_id)
                      : ""
              );

              setBatchId(
                  access.batch_id
                      ? String(access.batch_id)
                      : ""
              );

          } catch {

            setAccessType(
                isFaculty
                    ? "batch"
                    : "all"
            );

            setCourseId("");
            setBatchId("");
        }
      }

      loadCommunication();

  }, [
    open,
    communication,
    apiPrefix,
    isFaculty,
]);
 
  if (!open || !communication)
    return null;

  function validate() {
    if (!form.title.trim()) {
      return "Title is required.";
    }

    if (!form.message.trim()) {
      return "Message is required.";
    }

    if (
      accessType === "course" &&
      !courseId
    ) {
      return "Please select a course.";
    }

    if (
      accessType === "batch" &&
      (!courseId || !batchId)
    ) {
      return "Please select course and batch.";
    }

    return null;
  }

  async function save() {
    const validation =
      validate();

    if (validation) {
      setError(validation);
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.put(
          `${apiPrefix}/student-communications/${communication.id}`,
          {
              title: form.title,
              message: form.message,
          }
      );

      await api.post(
          `${apiPrefix}/student-communications/${communication.id}/access`,
          {
              access_type:
              isFaculty
                  ? "batch"
                  : accessType,
              course_id:
              isFaculty
                  ? courseId
                  : accessType !== "all"
                      ? courseId
                      : null,
              batch_id:
                  accessType === "batch"
                      ? batchId
                      : null,
          }
      );

      onSaved();
      
    } catch (e) {
      setError(
        e?.response?.data
          ?.message ||
          "Failed to update communication."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Edit Communication"
      subtitle="Update published communication"
      size="lg"
      footer={
        <div className="w-full flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={save}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg active:scale-95 flex items-center gap-2 ${
              saving
                ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
                : "bg-brand-teal-500 hover:bg-brand-teal-600 shadow-brand-teal-500/20"
            }`}
          >
            {saving ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-5 max-h-[70vh] overflow-y-auto custom-dashboard-scroll pr-1">
        {/* TITLE */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] flex items-center gap-1.5 mb-1.5 ml-1">
            <Type size={14} className="text-brand-teal-500" />
            Title
            <span className="text-rose-500">
              *
            </span>
          </label>

          <input
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title:
                  e.target.value,
              })
            }
            placeholder="Communication title"
            className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-bold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal"
          />
        </div>

        {/* MESSAGE */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] flex items-center gap-1.5 mb-1.5 ml-1">
            <AlignLeft size={14} className="text-brand-teal-500" />
            Message
            <span className="text-rose-500">
              *
            </span>
          </label>

          <textarea
            rows={7}
            value={form.message}
            onChange={(e) =>
              setForm({
                ...form,
                message:
                  e.target.value,
              })
            }
            placeholder="Write your communication..."
            className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-medium shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 resize-none"
          />
        </div>

        {/* AUDIENCE */}
        {!isFaculty && (
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-2 block ml-1">
              Audience
            </label>

            <div className="grid md:grid-cols-3 gap-3">
              {[
                {
                  id: "all",
                  label: "All Students",
                  icon: (
                    <Globe size={18} />
                  ),
                },
                {
                  id: "course",
                  label: "Specific Course",
                  icon: (
                    <BookOpen size={18} />
                  ),
                },
                {
                  id: "batch",
                  label: "Specific Batch",
                  icon: (
                    <Layers size={18} />
                  ),
                },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setAccessType(
                      option.id
                    )
                  }
                  className={`rounded-2xl border p-4 flex flex-col items-center gap-2 transition cursor-pointer shadow-sm ${
                    accessType ===
                    option.id
                      ? "border-brand-teal-500 bg-brand-teal-500/10 text-brand-teal-500"
                      : "border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text-muted))] hover:border-brand-teal-500/40 hover:bg-[rgb(var(--zx-surface-hover))]"
                  }`}
                >
                  {option.icon}

                  <span className="font-bold text-xs">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {(accessType === "course" || accessType === "batch") && (
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 block ml-1">
              Course
            </label>

            <div className="relative group">
              <select
                value={courseId}
                onChange={(e) =>
                  setCourseId(
                    e.target.value
                  )
                }
                className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-semibold cursor-pointer shadow-sm"
              >
                <option value="">
                  Select Course
                </option>

                {courses.map(
                  (course) => (
                    <option
                      key={
                        course.id
                      }
                      value={
                        course.id
                      }
                    >
                      {course.name}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={16}
                className="absolute right-4 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none"
              />
            </div>
          </div>
        )}

        {accessType === "batch" && (
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 block ml-1">
              Batch
            </label>

            <div className="relative group">
              <select
                value={batchId}
                onChange={(e) =>
                  setBatchId(
                    e.target.value
                  )
                }
                disabled={!courseId}
                className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <option value="">
                  Select Batch
                </option>

                {batches.map(
                  (batch) => (
                    <option
                      key={
                        batch.id
                      }
                      value={
                        batch.id
                      }
                    >
                      {batch.name}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={16}
                className="absolute right-4 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 flex items-center gap-3 text-rose-500">
            <AlertCircle size={18} />
            <span className="font-bold text-xs">
              {error}
            </span>
          </div>
        )}
      </div>
    </AppModal>
  );
}