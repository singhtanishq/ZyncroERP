import React, { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../lib/api/apiClient";
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Layers, 
  Monitor, 
  MapPin, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Save,
  CheckCircle2,
  ChevronDown
} from "lucide-react";

const STEPS = [
  "Basic Details",
  "Schedule",
  "Exam Mode",
  "Preview",
  "Submit",
];

export default function ScheduleExam({
    apiPrefix = "/admin",
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    course_id: "",
    batch_id: "",
    exam_category: "",
    custom_exam_category: "",

    start_time: "",
    duration_minutes: "",
    end_time: "",

    mode: "online",
    platform_name: "",
    platform_description: "",
    exam_link: "",

    center_name: "",
    offline_notes: "",
  });

  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // ---------------- API LOADERS ----------------

  useEffect(() => {
    const courseEndpoint =
      apiPrefix === "/faculty"
        ? "/faculty/course-options"
        : `${apiPrefix}/courses`;

    api.get(courseEndpoint).then(res => setCourses(res.data)).catch(() => {});
  }, [apiPrefix]);

  useEffect(() => {
    if (!form.course_id) {
      setBatches([]);
      setForm(f => ({ ...f, batch_id: "" }));
      return;
    }

    const batchEndpoint =
      apiPrefix === "/faculty"
        ? `/faculty/course-options/${form.course_id}/batches`
        : `${apiPrefix}/courses/${form.course_id}/batches`;

    api.get(batchEndpoint)
      .then(res => {
        setBatches(res.data);
        setForm(f => ({ ...f, batch_id: "" }));
      })
      .catch(() => {
        setBatches([]);
        setForm(f => ({ ...f, batch_id: "" }));
      });
  }, [form.course_id, apiPrefix]);
  
  // ---------------- HELPERS ----------------

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // Auto-calc end time
  useEffect(() => {
    if (!form.start_time || !form.duration_minutes) return;

    const start = new Date(form.start_time);
    const end = new Date(start.getTime() + Number(form.duration_minutes) * 60000);
    const pad = (n) => String(n).padStart(2, "0");

    const localEnd =
      end.getFullYear() +
      "-" +
      pad(end.getMonth() + 1) +
      "-" +
      pad(end.getDate()) +
      "T" +
      pad(end.getHours()) +
      ":" +
      pad(end.getMinutes());

    update("end_time", localEnd);

  }, [form.start_time, form.duration_minutes]);

  // ---------------- VALIDATION ----------------

  const isStepValid = () => {
    if (currentStep === 0) {
      if (!form.name) return false;
      if (!form.course_id) return false;
      if (!form.batch_id) return false;
      if (!form.exam_category) return false;
      if (form.exam_category === "Other" && !form.custom_exam_category)
        return false;
    }

    if (currentStep === 1) {
      if (!form.start_time) return false;
      if (!form.duration_minutes) return false;
      if (!form.end_time) return false;
    }

    if (currentStep === 2) {
      if (!form.mode) return false;

      if (form.mode === "online") {
        if (!form.platform_name) return false;
        if (!form.exam_link) return false;
      }

      if (form.mode === "offline") {
        if (!form.center_name) return false;
      }
    }

    return true;
  };

  const next = () => {
    if (!isStepValid()) {
      showToast("Please fill all required fields before continuing.");
      return;
    }
    setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => setCurrentStep(s => Math.max(s - 1, 0));

  // ---------------- SUBMIT ----------------

  const submit = async () => {
    const payload = {
      ...form,
      exam_category:
        form.exam_category === "Other"
          ? form.custom_exam_category
          : form.exam_category,
    };

    await api.post(`${apiPrefix}/exams`, payload);
    showToast("Exam scheduled successfully");
    setTimeout(() => {
      navigate(
        apiPrefix === "/faculty"
            ? "/faculty/exams/manage"
            : "/dashboard/exams"
      );
    }, 800);
  };

  const selectedCourse = courses.find(c => c.id == form.course_id);
  const selectedBatch = batches.find(b => b.id == form.batch_id);

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 font-sans animate-fade-in">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <div className="mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
          <Calendar size={14} strokeWidth={2.5} />
          Assessment Hub
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
          Schedule Online Exam
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
          Configure exam details, timing, and delivery mode.
        </p>
      </div>

      {/* Stepper with Solid Visible Lines */}
      <div className="mb-12 relative z-10">
        <div className="flex items-center w-full">
            {STEPS.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const isLastStep = index === STEPS.length - 1;

                return (
                    <Fragment key={index}>
                        {/* Step Circle & Label */}
                        <div className="relative flex flex-col items-center shrink-0 z-10">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2 
                                ${isActive 
                                    ? "bg-[rgb(var(--zx-surface))] border-brand-teal-500 text-brand-teal-500 scale-110 shadow-lg shadow-brand-teal-500/20" 
                                    : isCompleted 
                                    ? "bg-brand-teal-500 border-brand-teal-500 text-white" 
                                    : "bg-[rgb(var(--zx-surface))] border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))]"
                                }`}
                            >
                                {isCompleted ? <Check size={18} strokeWidth={3} /> : index + 1}
                            </div>
                            
                            {/* Floating Label */}
                            <span className={`absolute top-12 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 w-max text-center hidden sm:block ${isActive ? "text-brand-teal-500" : "text-[rgb(var(--zx-text-muted))]"}`}>
                                {step}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {!isLastStep && (
                            <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-500 ease-out 
                                ${index < currentStep ? "bg-brand-teal-500" : "bg-[rgb(var(--zx-border))]"}
                            `} />
                        )}
                    </Fragment>
                );
            })}
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-3xl shadow-sm p-8 min-h-[400px] flex flex-col relative z-10">
        
        {/* STEP 1: Basic Details */}
        {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-base font-bold text-[rgb(var(--zx-text))] border-b border-[rgb(var(--zx-border))] pb-3 mb-4">Basic Information</h3>
                
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Exam Name *</label>
                    <input
                        className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all font-bold text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal"
                        placeholder="e.g. Mid-Term Physics Assessment"
                        value={form.name}
                        onChange={e => update("name", e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Description</label>
                    <textarea
                        className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-medium shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 resize-none"
                        placeholder="Brief details about the exam syllabus..."
                        rows={3}
                        value={form.description}
                        onChange={e => update("description", e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <BookOpen size={14} className="text-brand-teal-500"/> Course *
                        </label>
                        <div className="relative group">
                            <select
                                className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-semibold cursor-pointer shadow-sm"
                                value={form.course_id}
                                onChange={e => update("course_id", e.target.value)}
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <Layers size={14} className="text-brand-teal-500"/> Batch *
                        </label>
                        <div className="relative group">
                            <select
                                className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                value={form.batch_id}
                                disabled={!batches.length}
                                onChange={e => update("batch_id", e.target.value)}
                            >
                                <option value="">
                                {batches.length ? "Select Batch" : "Select Course First"}
                                </option>
                                {batches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Category *</label>
                    <div className="relative group">
                        <select
                            className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-semibold cursor-pointer shadow-sm"
                            value={form.exam_category}
                            onChange={e => update("exam_category", e.target.value)}
                        >
                            <option value="">Select Category</option>
                            <option>Assessment</option>
                            <option>Final Evaluation</option>
                            <option>Practice / Mock</option>
                            <option>Re-attempt</option>
                            <option>Other</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none" size={16} />
                    </div>
                </div>

                {form.exam_category === "Other" && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                        <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Custom Category Name *</label>
                        <input
                            className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-semibold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                            placeholder="e.g. Surprise Quiz"
                            value={form.custom_exam_category}
                            onChange={e => update("custom_exam_category", e.target.value)}
                        />
                    </div>
                )}
            </div>
        )}

        {/* STEP 2: Schedule */}
        {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-base font-bold text-[rgb(var(--zx-text))] border-b border-[rgb(var(--zx-border))] pb-3 mb-4">Timing & Duration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <Calendar size={14} className="text-brand-teal-500"/> Start Time *
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-semibold shadow-sm cursor-pointer"
                            value={form.start_time}
                            onChange={e => update("start_time", e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <Clock size={14} className="text-brand-teal-500"/> Duration (Minutes) *
                        </label>
                        <input
                            type="number"
                            className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-semibold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                            placeholder="e.g. 60"
                            value={form.duration_minutes}
                            onChange={e => update("duration_minutes", e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <Clock size={14} className="text-[rgb(var(--zx-text-muted))]"/> End Time (Auto-calculated)
                    </label>
                    <input
                        type="datetime-local"
                        className="w-full bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] rounded-xl px-4 py-3 text-sm font-medium text-[rgb(var(--zx-text-muted))] cursor-not-allowed shadow-inner"
                        value={form.end_time}
                        readOnly
                    />
                </div>
            </div>
        )}

        {/* STEP 3: Exam Mode */}
        {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-base font-bold text-[rgb(var(--zx-text))] border-b border-[rgb(var(--zx-border))] pb-3 mb-4">Delivery Mode</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => update("mode", "online")}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                            form.mode === "online" 
                            ? "border-brand-teal-500 bg-brand-teal-500/10 text-brand-teal-500 shadow-sm" 
                            : "border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text-muted))] hover:border-brand-teal-500/40 hover:bg-[rgb(var(--zx-surface-hover))]"
                        }`}
                    >
                        <Monitor size={32} className="mb-2" />
                        <span className="font-bold text-sm">Online Exam</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => update("mode", "offline")}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                            form.mode === "offline" 
                            ? "border-brand-teal-500 bg-brand-teal-500/10 text-brand-teal-500 shadow-sm" 
                            : "border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text-muted))] hover:border-brand-teal-500/40 hover:bg-[rgb(var(--zx-surface-hover))]"
                        }`}
                    >
                        <MapPin size={32} className="mb-2" />
                        <span className="font-bold text-sm">Offline Center</span>
                    </button>
                </div>

                {form.mode === "online" && (
                    <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Platform Name *</label>
                            <input
                                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-semibold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                                placeholder="e.g. Google Forms, Moodle, Custom Portal"
                                value={form.platform_name}
                                onChange={e => update("platform_name", e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Platform Description</label>
                            <textarea
                                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-medium shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 resize-none"
                                placeholder="Instructions for accessing the platform..."
                                value={form.platform_description}
                                onChange={e => update("platform_description", e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Exam Link *</label>
                            <input
                                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-brand-teal-500 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-semibold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 font-mono"
                                placeholder="https://..."
                                value={form.exam_link}
                                onChange={e => update("exam_link", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {form.mode === "offline" && (
                    <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Exam Center Name *</label>
                            <input
                                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-semibold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                                placeholder="e.g. Main Hall, Block A"
                                value={form.center_name}
                                onChange={e => update("center_name", e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Notes / Instructions</label>
                            <textarea
                                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-medium shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 resize-none"
                                placeholder="Bring ID card, pens, etc..."
                                value={form.offline_notes}
                                onChange={e => update("offline_notes", e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* STEP 4: Preview */}
        {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-base font-bold text-[rgb(var(--zx-text))] border-b border-[rgb(var(--zx-border))] pb-3 mb-4">Review & Confirm</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PreviewCard label="Exam Name" value={form.name} />
                    <PreviewCard label="Category" value={form.exam_category === "Other" ? form.custom_exam_category : form.exam_category} />
                    <PreviewCard label="Course" value={selectedCourse?.name} />
                    <PreviewCard label="Batch" value={selectedBatch?.name} />
                    <PreviewCard label="Start Time" value={form.start_time ? new Date(form.start_time).toLocaleString() : ""} />
                    <PreviewCard label="Duration" value={form.duration_minutes ? `${form.duration_minutes} Minutes` : ""} />
                    <PreviewCard label="Mode" value={form.mode} capitalize />
                </div>

                <div className="bg-[rgb(var(--zx-surface-hover))]/50 rounded-2xl p-5 border border-[rgb(var(--zx-border))] mt-4">
                    <h4 className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest mb-2">
                        {form.mode === "online" ? "Online Platform Details" : "Venue Details"}
                    </h4>
                    {form.mode === "online" ? (
                        <div className="space-y-1.5 text-sm text-[rgb(var(--zx-text))] font-medium">
                            <p><span className="font-bold text-[rgb(var(--zx-text-muted))]">Platform:</span> {form.platform_name}</p>
                            <p className="truncate"><span className="font-bold text-[rgb(var(--zx-text-muted))]">Link:</span> {form.exam_link}</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5 text-sm text-[rgb(var(--zx-text))] font-medium">
                            <p><span className="font-bold text-[rgb(var(--zx-text-muted))]">Center:</span> {form.center_name}</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* STEP 5: Confirm */}
        {currentStep === 4 && (
            <div className="flex flex-col items-center justify-center flex-1 animate-in fade-in zoom-in duration-300 text-center py-10">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 shadow-sm text-emerald-500">
                    <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-extrabold text-[rgb(var(--zx-text))] mb-2">Ready to Schedule?</h3>
                <p className="text-[rgb(var(--zx-text-muted))] max-w-sm mb-8 text-sm leading-relaxed font-medium">
                    Please confirm that all details are correct. Once scheduled, notifications may be sent to students.
                </p>
                <button
                    type="button"
                    onClick={submit}
                    className="px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold text-base hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                >
                    <Save size={20} /> Confirm & Schedule
                </button>
            </div>
        )}

        {/* Navigation Footer */}
        <div className="flex justify-between items-center mt-auto pt-8 border-t border-[rgb(var(--zx-border))]">
            {currentStep > 0 && currentStep < 4 ? (
                <button 
                    type="button"
                    onClick={prev} 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] font-bold text-sm hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
                >
                    <ArrowLeft size={16} /> Back
                </button>
            ) : <div></div>}

            {currentStep < STEPS.length - 1 && (
                <button
                    type="button"
                    onClick={next}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 ${
                    isStepValid()
                        ? "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-brand-teal-500/20"
                        : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
                    }`}
                >
                    Next Step <ArrowRight size={16} />
                </button>
            )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[rgb(var(--zx-border))] backdrop-blur-xl">
            <div className="bg-emerald-500/20 text-emerald-500 rounded-full p-1 border border-emerald-500/30">
                <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-sm font-bold tracking-wide">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* Helper Component for Preview */
function PreviewCard({ label, value, capitalize = false }) {
    return (
        <div className="bg-[rgb(var(--zx-surface-hover))]/50 rounded-2xl p-4 border border-[rgb(var(--zx-border))]">
            <div className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest mb-1">{label}</div>
            <div className={`font-bold text-sm text-[rgb(var(--zx-text))] ${capitalize ? 'capitalize' : ''}`}>{value || "-"}</div>
        </div>
    );
}