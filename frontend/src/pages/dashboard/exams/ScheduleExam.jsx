import { useEffect, useState, Fragment } from "react";
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

api.get(courseEndpoint).then(res => setCourses(res.data));
  }, []);

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
  }, [form.course_id]);
  
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

  // ---------------- UI ----------------

  const selectedCourse = courses.find(c => c.id == form.course_id);
  const selectedBatch = batches.find(b => b.id == form.batch_id);

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans animate-fade-in">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Calendar className="text-indigo-600" size={32} />
            Schedule Online Exam
        </h1>
        <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Configure exam details, timing, and delivery mode.
        </p>
      </div>

      {/* Stepper with Solid Visible Lines */}
      <div className="mb-12">
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
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-4 
                                ${isActive 
                                    ? "bg-white border-indigo-600 text-indigo-600 scale-110 shadow-lg shadow-indigo-100" 
                                    : isCompleted 
                                    ? "bg-indigo-600 border-indigo-600 text-white" 
                                    : "bg-white border-slate-200 text-slate-400"
                                }`}
                            >
                                {isCompleted ? <Check size={18} strokeWidth={3} /> : index + 1}
                            </div>
                            
                            {/* Floating Label */}
                            <span className={`absolute top-12 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 w-max text-center hidden sm:block ${isActive ? "text-indigo-600" : "text-slate-400"}`}>
                                {step}
                            </span>
                        </div>

                        {/* Connector Line (Rendered as a sibling to steps, not inside them) */}
                        {!isLastStep && (
                            <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-500 ease-out 
                                ${index < currentStep ? "bg-indigo-600" : "bg-slate-200"}
                            `} />
                        )}
                    </Fragment>
                );
            })}
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 p-8 min-h-[400px] flex flex-col">
        
        {/* STEP 1: Basic Details */}
        {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Basic Information</h3>
                
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Exam Name *</label>
                    <input
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400"
                        placeholder="e.g. Mid-Term Physics Assessment"
                        value={form.name}
                        onChange={e => update("name", e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Description</label>
                    <textarea
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400 resize-none"
                        placeholder="Brief details about the exam syllabus..."
                        rows={3}
                        value={form.description}
                        onChange={e => update("description", e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                            <BookOpen size={14} className="text-indigo-500"/> Course *
                        </label>
                        <div className="relative group">
                            <select
                                className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
                                value={form.course_id}
                                onChange={e => update("course_id", e.target.value)}
                            >
                                <option value="">Select Course</option>
                                {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                            <Layers size={14} className="text-indigo-500"/> Batch *
                        </label>
                        <div className="relative group">
                            <select
                                className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
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
                            <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Category *</label>
                    <div className="relative group">
                        <select
                            className="w-full appearance-none bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
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
                        <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>

                {form.exam_category === "Other" && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Custom Category Name *</label>
                        <input
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
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
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Timing & Duration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                            <Calendar size={14} className="text-indigo-500"/> Start Time *
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
                            value={form.start_time}
                            onChange={e => update("start_time", e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                            <Clock size={14} className="text-indigo-500"/> Duration (Minutes) *
                        </label>
                        <input
                            type="number"
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
                            placeholder="e.g. 60"
                            value={form.duration_minutes}
                            onChange={e => update("duration_minutes", e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400"/> End Time (Auto-calculated)
                    </label>
                    <input
                        type="datetime-local"
                        className="w-full bg-slate-5 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 cursor-not-allowed"
                        value={form.end_time}
                        readOnly
                    />
                </div>
            </div>
        )}

        {/* STEP 3: Exam Mode */}
        {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Delivery Mode</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => update("mode", "online")}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                            form.mode === "online" 
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700" 
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                    >
                        <Monitor size={32} className="mb-2" />
                        <span className="font-bold">Online Exam</span>
                    </button>
                    <button
                        onClick={() => update("mode", "offline")}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
                            form.mode === "offline" 
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700" 
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                    >
                        <MapPin size={32} className="mb-2" />
                        <span className="font-bold">Offline Center</span>
                    </button>
                </div>

                {form.mode === "online" && (
                    <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Platform Name *</label>
                            <input
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
                                placeholder="e.g. Google Forms, Moodle, Custom Portal"
                                value={form.platform_name}
                                onChange={e => update("platform_name", e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Platform Description</label>
                            <textarea
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 resize-none"
                                placeholder="Instructions for accessing the platform..."
                                value={form.platform_description}
                                onChange={e => update("platform_description", e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Exam Link *</label>
                            <input
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-blue-600 underline-offset-2"
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
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Exam Center Name *</label>
                            <input
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
                                placeholder="e.g. Main Hall, Block A"
                                value={form.center_name}
                                onChange={e => update("center_name", e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Notes / Instructions</label>
                            <textarea
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 resize-none"
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
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Review & Confirm</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PreviewCard label="Exam Name" value={form.name} />
                    <PreviewCard label="Category" value={form.exam_category === "Other" ? form.custom_exam_category : form.exam_category} />
                    <PreviewCard label="Course" value={selectedCourse?.name} />
                    <PreviewCard label="Batch" value={selectedBatch?.name} />
                    <PreviewCard label="Start Time" value={new Date(form.start_time).toLocaleString()} />
                    <PreviewCard label="Duration" value={`${form.duration_minutes} Minutes`} />
                    <PreviewCard label="Mode" value={form.mode} capitalize />
                </div>

                <div className="bg-slate-5 rounded-xl p-5 border border-slate-200 mt-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {form.mode === "online" ? "Online Platform Details" : "Venue Details"}
                    </h4>
                    {form.mode === "online" ? (
                        <div className="space-y-2 text-sm text-slate-700">
                            <p><span className="font-semibold">Platform:</span> {form.platform_name}</p>
                            <p className="truncate"><span className="font-semibold">Link:</span> {form.exam_link}</p>
                        </div>
                    ) : (
                        <div className="space-y-2 text-sm text-slate-700">
                            <p><span className="font-semibold">Center:</span> {form.center_name}</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* STEP 5: Confirm */}
        {currentStep === 4 && (
            <div className="flex flex-col items-center justify-center flex-1 animate-in fade-in zoom-in duration-300 text-center py-10">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-sm">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Ready to Schedule?</h3>
                <p className="text-slate-500 max-w-sm mb-8">
                    Please confirm that all details are correct. Once scheduled, notifications may be sent to students.
                </p>
                <button
                    onClick={submit}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-base hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                >
                    <Save size={20} /> Confirm & Schedule
                </button>
            </div>
        )}

        {/* Navigation Footer */}
        <div className="flex justify-between items-center mt-auto pt-8 border-t border-slate-100">
            {currentStep > 0 && currentStep < 4 ? (
                <button 
                    onClick={prev} 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                    <ArrowLeft size={16} /> Back
                </button>
            ) : <div></div>}

            {currentStep < STEPS.length - 1 && (
                <button
                    onClick={next}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all ${
                    isStepValid()
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
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
          <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50">
            <div className="bg-emerald-500 rounded-full p-1">
                <Check size={14} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-sm font-semibold tracking-wide">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* Helper Component for Preview */
function PreviewCard({ label, value, capitalize = false }) {
    return (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
            <div className={`font-semibold text-slate-800 ${capitalize ? 'capitalize' : ''}`}>{value || "-"}</div>
        </div>
    );
}