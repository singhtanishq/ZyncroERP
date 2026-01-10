import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";

import {
  X,
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">

        {/* HEADER */}

        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">

          <div className="flex items-center gap-3">

            <div className="bg-amber-100 text-amber-600 p-3 rounded-xl">

              <Megaphone size={22} />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">

                Edit Communication

              </h2>

              <p className="text-xs text-slate-500 mt-1">

                Update published communication

              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 transition"
          >
            <X size={20} />
          </button>

        </div>

        {/* BODY */}

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* TITLE */}

          <div>

            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-2">

              <Type size={14} />

              Title

              <span className="text-red-500">

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
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />

          </div>

          {/* MESSAGE */}

          <div>

            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-2">

              <AlignLeft size={14} />

              Message

              <span className="text-red-500">

                *

              </span>

            </label>

            <textarea
              rows={8}
              value={form.message}
              onChange={(e) =>
                setForm({
                  ...form,
                  message:
                    e.target.value,
                })
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />

          </div>

          {/* AUDIENCE */}

          {!isFaculty && (

          <div>

            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">

              Audience

            </label>

            <div className="grid md:grid-cols-3 gap-3">

              {[
                {
                  id: "all",
                  label:
                    "All Students",
                  icon: (
                    <Globe size={18} />
                  ),
                },
                {
                  id: "course",
                  label:
                    "Specific Course",
                  icon: (
                    <BookOpen size={18} />
                  ),
                },
                {
                  id: "batch",
                  label:
                    "Specific Batch",
                  icon: (
                    <Layers size={18} />
                  ),
                },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() =>
                    setAccessType(
                      option.id
                    )
                  }
                  className={`rounded-xl border p-4 flex flex-col items-center gap-2 transition ${
                    accessType ===
                    option.id
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 hover:border-indigo-300"
                  }`}
                >

                  {option.icon}

                  <span className="font-semibold text-sm">

                    {option.label}

                  </span>

                </button>
              ))}

            </div>

          </div>
          )}

          {(accessType ===
            "course" ||
            accessType ===
              "batch") && (

            <div>

              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">

                Course

              </label>

              <div className="relative">

                <select
                  value={courseId}
                  onChange={(e) =>
                    setCourseId(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                  size={18}
                  className="absolute right-4 top-4 text-slate-400"
                />

              </div>

            </div>

          )}

          {accessType ===
            "batch" && (

            <div>

              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">

                Batch

              </label>

              <div className="relative">

                <select
                  value={batchId}
                  onChange={(e) =>
                    setBatchId(
                      e.target.value
                    )
                  }
                  disabled={!courseId}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 appearance-none disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                  size={18}
                  className="absolute right-4 top-4 text-slate-400"
                />

              </div>

            </div>

          )}

          {error && (

            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3 text-red-600">

              <AlertCircle
                size={18}
              />

              <span className="text-sm font-medium">

                {error}

              </span>

            </div>

          )}

        </div>

        {/* FOOTER */}

        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-semibold transition"
          >

            Cancel

          </button>

          <button
            disabled={saving}
            onClick={save}
            className={`px-6 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 transition ${
              saving
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >

            {saving ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>

                Saving...

              </>
            ) : (
              <>
                <Save size={17} />

                Save Changes

              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
}
