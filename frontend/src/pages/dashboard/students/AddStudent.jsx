import { useEffect, useState, Fragment } from "react";
import api from "../../../lib/api/apiClient";
import { 
  User, 
  Mail, 
  BookOpen, 
  Layers, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Save,
  Loader2,
  UserPlus
} from "lucide-react";

const STEPS = ["Details", "Preview", "Confirm"];

export default function AddStudent() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    course_id: "",
    batch_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isStep1Valid = form.name.trim() !== "" && form.email.trim() !== "";

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  // Helper function to cleanly format raw ISO date strings into readable dates (e.g. Jun 1, 2026)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const cleanDate = dateString.split("T")[0];
    const date = new Date(cleanDate);
    if (isNaN(date.getTime())) return cleanDate;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  useEffect(() => {
    api.get("/admin/courses").then((res) => {
      setCourses(res.data.filter((c) => c.status === "active"));
    });
  }, []);

  useEffect(() => {
    if (!form.course_id) {
      setBatches([]);
      setForm((f) => ({ ...f, batch_id: "" }));
      return;
    }

    api
      .get(`/admin/courses/${form.course_id}/batches`)
      .then((res) =>
        setBatches(res.data.filter((b) => b.status === "active"))
      );
  }, [form.course_id]);

  const submit = async () => {
    setLoading(true);
    setMessage("");

    try {
      await api.post("/admin/students", {
        name: form.name,
        email: form.email,
        course_id: form.course_id || null,
        batch_id: form.batch_id || null,
      });

      setMessage("Student added successfully");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setForm({ name: "", email: "", course_id: "", batch_id: "" });
      setStep(1);
    } catch (err) {
      const status = err?.response?.status;
      const errorMsg = err?.response?.data?.message || "";

      if (
        status === 422 ||
        status === 409 ||
        errorMsg.toLowerCase().includes("email") ||
        errorMsg.toLowerCase().includes("unique")
      ) {
        setMessage("Student with this email already exists");
      } else {
        setMessage("Failed to add student");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 pt-0 space-y-8 animate-fade-in">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <div className="relative z-10 flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
          <UserPlus size={14} strokeWidth={2.5} />
          Student Onboarding
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
          Add New Student
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] text-[15px] max-w-2xl leading-relaxed mt-1">
          Register a new student, assign courses, and generate credentials.
        </p>
      </div>

      {/* MAIN CONTENT LAYOUT */}
      <div className="flex flex-col gap-10 relative z-10 w-full pt-4">
        
        {/* TOP: STEPPER */}
        <div className="w-full max-w-2xl mx-auto mb-4 sm:mb-8 px-4">
          <div className="flex flex-row items-center justify-between w-full">
              {STEPS.map((label, index) => {
                  const stepNum = index + 1;
                  const isActive = stepNum === step;
                  const isCompleted = stepNum < step;
                  const isLastStep = index === STEPS.length - 1;

                  return (
                      <Fragment key={index}>
                          {/* Step Circle & Label */}
                          <div className="relative flex flex-col items-center shrink-0 z-10 group cursor-default">
                              <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2 shrink-0
                                  ${isActive 
                                      ? "bg-brand-teal-500 border-brand-teal-500 text-white scale-110 shadow-lg shadow-brand-teal-500/25" 
                                      : isCompleted 
                                      ? "bg-brand-teal-500 border-brand-teal-500 text-white" 
                                      : "bg-[rgb(var(--zx-surface))] border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))]"
                                  }`}
                              >
                                  {isCompleted ? <Check size={18} strokeWidth={3} /> : stepNum}
                              </div>
                              
                              {/* Floating/Inline Label */}
                              <span className={`absolute top-14 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 w-max text-center hidden sm:block
                                  ${isActive ? "text-brand-teal-500" : "text-[rgb(var(--zx-text-muted))]"}`}>
                                  {label}
                              </span>
                          </div>

                          {/* Connector Line */}
                          {!isLastStep && (
                              <div className={`flex-1 h-[2px] mx-2 sm:mx-4 rounded-full transition-colors duration-500 ease-out 
                                  ${stepNum < step ? "bg-brand-teal-500" : "bg-[rgb(var(--zx-border))]" }
                              `} />
                          )}
                      </Fragment>
                  );
              })}
          </div>
        </div>

        {/* MAIN FORM CARD */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-3xl shadow-sm p-6 sm:p-8 min-h-[400px] flex flex-col">
            
            {/* STEP 1: Details */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-xs font-extrabold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest border-b border-[rgb(var(--zx-border))] pb-4 mb-6 flex items-center gap-2">
                  <User size={16} /> Student Information
                </h3>

                <div className="space-y-6">
                  
                  {/* Row 1: Name */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-3.5 text-[rgb(var(--zx-text-muted))] group-focus-within:text-brand-teal-500 transition-colors" size={20} />
                      <input
                        name="name"
                        placeholder="e.g. John Doe"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border border-[rgb(var(--zx-border))] rounded-xl pl-12 pr-4 py-3.5 text-[14px] bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] focus:border-brand-teal-500 focus:outline-none focus:ring-0 transition-all placeholder:text-[rgb(var(--zx-text-muted))]/60 font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Email */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 text-[rgb(var(--zx-text-muted))] group-focus-within:text-brand-teal-500 transition-colors" size={20} />
                      <input
                        name="email"
                        type="email"
                        placeholder="e.g. john@email.com"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border border-[rgb(var(--zx-border))] rounded-xl pl-12 pr-4 py-3.5 text-[14px] bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] focus:border-brand-teal-500 focus:outline-none focus:ring-0 transition-all placeholder:text-[rgb(var(--zx-text-muted))]/60 font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 3: Course & Batch */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Course Select */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">
                        Course
                      </label>
                      <div className="relative group">
                        <BookOpen className="absolute left-4 top-3.5 text-[rgb(var(--zx-text-muted))] group-focus-within:text-brand-teal-500 transition-colors" size={20} />
                        <select
                          name="course_id"
                          value={form.course_id}
                          onChange={handleChange}
                          className="w-full border border-[rgb(var(--zx-border))] rounded-xl pl-12 pr-10 py-3.5 text-[14px] appearance-none bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] focus:border-brand-teal-500 focus:outline-none focus:ring-0 transition-all cursor-pointer font-medium hover:border-[rgb(var(--zx-border-hover))]"
                        >
                          <option value="">Select Course</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-4 pointer-events-none text-[rgb(var(--zx-text-muted))]">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                      </div>
                    </div>

                    {/* Batch Select */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">
                        Batch
                      </label>
                      <div className="relative group">
                        <Layers className={`absolute left-4 top-3.5 transition-colors ${!form.course_id ? 'text-[rgb(var(--zx-border))]' : 'text-[rgb(var(--zx-text-muted))] group-focus-within:text-brand-teal-500'}`} size={20} />
                        <select
                          name="batch_id"
                          value={form.batch_id}
                          onChange={handleChange}
                          className="w-full border border-[rgb(var(--zx-border))] rounded-xl pl-12 pr-10 py-3.5 text-[14px] appearance-none bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] focus:border-brand-teal-500 focus:outline-none focus:ring-0 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:border-[rgb(var(--zx-border-hover))]"
                          disabled={!form.course_id}
                        >
                          <option value="">Select Batch</option>
                          {batches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({formatDate(b.start_date)} - {formatDate(b.end_date)})
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-4 pointer-events-none text-[rgb(var(--zx-text-muted))]">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 1 Actions */}
                  <div className="pt-6">
                    <button
                      disabled={!isStep1Valid}
                      onClick={() => {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(form.email)) {
                          setMessage("Please enter a valid email address");
                          return;
                        }
                        setMessage("");
                        setStep(2);
                      }}
                      className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold transition-all ${
                        isStep1Valid
                          ? "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-lg shadow-brand-teal-500/20 active:scale-[0.98]"
                          : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] cursor-not-allowed border border-[rgb(var(--zx-border))]"
                      }`}
                    >
                      Continue to Preview <ArrowRight size={20} />
                    </button>
                    
                    {message && (
                      <div className="flex items-center justify-center gap-2 text-[13px] font-medium text-amber-500 mt-6 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 animate-in slide-in-from-top-2">
                        <AlertCircle size={16} /> {message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Preview */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xs font-extrabold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest border-b border-[rgb(var(--zx-border))] pb-4 mb-6 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Review Details
                </h3>

                <div className="bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] rounded-3xl overflow-hidden divide-y divide-[rgb(var(--zx-border))] mb-8">
                  
                  {/* Row 1: Name */}
                  <div className="px-6 py-4">
                    <PreviewAuto label="Full Name" value={form.name} icon={<User size={16} />} />
                  </div>
                  
                  {/* Row 2: Email */}
                  <div className="px-6 py-4">
                    <PreviewAuto label="Email Address" value={form.email} icon={<Mail size={16} />} />
                  </div>
                  
                  {/* Row 3: Course and Batch side-by-side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[rgb(var(--zx-border))]">
                    <div className="px-6 py-4 flex items-center">
                      <PreviewAuto 
                        label="Course" 
                        value={courses.find(c => c.id == form.course_id)?.name || <span className="text-[rgb(var(--zx-text-muted))] italic">Not Selected</span>} 
                        icon={<BookOpen size={16} />} 
                      />
                    </div>
                    <div className="px-6 py-4 flex items-center">
                      <PreviewAuto 
                        label="Batch" 
                        value={(() => {
                          const batch = batches.find(b => b.id == form.batch_id);
                          if (!batch) return <span className="text-[rgb(var(--zx-text-muted))] italic">Not Selected</span>;
                          return `${batch.name} (${formatDate(batch.start_date)} - ${formatDate(batch.end_date)})`;
                        })()} 
                        icon={<Layers size={16} />} 
                      />
                    </div>
                  </div>

                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-2xl py-3.5 text-[15px] font-bold hover:bg-[rgb(var(--zx-surface-hover))] transition-colors"
                  >
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-[2] flex items-center justify-center gap-2 bg-brand-teal-500 text-white rounded-2xl py-3.5 text-[15px] font-bold hover:bg-brand-teal-600 shadow-lg shadow-brand-teal-500/20 transition-all active:scale-[0.98]"
                  >
                    Confirm Details <Check size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Confirm */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center flex-1 flex flex-col justify-center py-6">
                <div className="w-20 h-20 bg-brand-teal-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-brand-teal-500 border border-brand-teal-500/20">
                  <AlertCircle size={36} strokeWidth={2.5} />
                </div>
                
                <h1 className="text-2xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight mb-3">
                  Confirm Action
                </h1>
                <p className="text-[rgb(var(--zx-text-muted))] text-[15px] leading-relaxed mb-10 max-w-sm mx-auto">
                  New login credentials will be generated and sent to <br className="hidden sm:block" /> <span className="font-bold text-[rgb(var(--zx-text))]">{form.email}</span>. Are you sure you want to proceed?
                </p>

                <div className="flex gap-4 max-w-md mx-auto w-full">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-2xl py-4 text-[15px] font-bold hover:bg-[rgb(var(--zx-surface-hover))] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submit}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-teal-500 text-white rounded-2xl py-4 text-[15px] font-bold hover:bg-brand-teal-600 shadow-lg shadow-brand-teal-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Processing...</>
                    ) : (
                      <>Create Student <Save size={18} /></>
                    )}
                  </button>
                </div>

                {message && (
                  <div
                    className={`mt-8 p-4 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 max-w-md mx-auto w-full animate-in fade-in slide-in-from-bottom-2 ${
                      message.toLowerCase().includes("exists") ||
                      message.toLowerCase().includes("failed")
                        ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    }`}
                  >
                    {message.toLowerCase().includes("exists") ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                    {message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-[rgb(var(--zx-text))] text-[rgb(var(--zx-surface))] px-6 py-4 rounded-2xl shadow-2xl shadow-black/20 flex items-center gap-3">
                <div className="bg-emerald-500 rounded-full p-1 text-white">
                    <Check size={14} strokeWidth={3} />
                </div>
                <div className="text-[14px] font-bold tracking-wide">Student added successfully</div>
            </div>
        </div>
      )}
    </div>
  );
}

/* --- Sub Components --- */

function PreviewAuto({ label, value, icon }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 text-[rgb(var(--zx-text-muted))]">
        <div className="p-2 bg-[rgb(var(--zx-surface))] rounded-lg border border-[rgb(var(--zx-border))] shadow-sm">
            {icon}
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest">{label}:</span>
      </div>
      <span className="font-bold text-[rgb(var(--zx-text))] text-[14px] truncate">{value}</span>
    </div>
  );
}