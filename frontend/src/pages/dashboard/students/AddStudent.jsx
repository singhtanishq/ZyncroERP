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
  Loader2
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

  // Helper to check if Step 1 is valid (Name and Email are required)
  const isStep1Valid = form.name.trim() !== "" && form.email.trim() !== "";

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

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
    <div className="max-w-4xl mx-auto p-6 font-sans animate-fade-in">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <User className="text-indigo-600" size={32} />
            Add New Student
        </h1>
        <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Register a new student, assign courses, and generate credentials.
        </p>
      </div>

      {/* STEPPER */}
      <div className="mb-12">
        <div className="flex items-center w-full">
            {STEPS.map((label, index) => {
                const stepNum = index + 1;
                const isActive = stepNum === step;
                const isCompleted = stepNum < step;
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
                                {isCompleted ? <Check size={18} strokeWidth={3} /> : stepNum}
                            </div>
                            
                            {/* Floating Label */}
                            <span className={`absolute top-12 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 w-max text-center hidden sm:block ${isActive ? "text-indigo-600" : "text-slate-400"}`}>
                                {label}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {!isLastStep && (
                            <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-500 ease-out 
                                ${stepNum < step ? "bg-indigo-600" : "bg-slate-200"}
                            `} />
                        )}
                    </Fragment>
                );
            })}
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 p-8 min-h-[400px] flex flex-col">
        
        {/* STEP 1: Details */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6">Student Information</h3>

            <div className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input
                    name="name"
                    placeholder="e.g. John Doe"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white font-medium text-slate-700 shadow-sm placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input
                    name="email"
                    type="email"
                    placeholder="e.g. john@email.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white font-medium text-slate-700 shadow-sm placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Course</label>
                  <div className="relative group">
                    <BookOpen className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <select
                      name="course_id"
                      value={form.course_id}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-xl pl-12 pr-10 py-3 text-sm appearance-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white font-medium text-slate-600 shadow-sm cursor-pointer hover:border-indigo-300"
                    >
                      <option value="">Select Course</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none text-slate-400 opacity-70">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                </div>

                {/* Batch Select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Batch</label>
                  <div className="relative group">
                    <Layers className={`absolute left-4 top-3.5 transition-colors ${!form.course_id ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-indigo-500'}`} size={20} />
                    <select
                      name="batch_id"
                      value={form.batch_id}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-xl pl-12 pr-10 py-3 text-sm appearance-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white font-medium text-slate-600 shadow-sm disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer hover:border-indigo-300"
                      disabled={!form.course_id}
                    >
                      <option value="">Select Batch</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.start_year}-{b.end_year})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none text-slate-400 opacity-70">
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
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold transition-all ${
                    isStep1Valid
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-[0.98]"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  Continue to Preview <ArrowRight size={20} />
                </button>
                
                {message && (
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-rose-600 mt-6 bg-rose-50 p-3 rounded-xl border border-rose-100 animate-in slide-in-from-top-2">
                    <AlertCircle size={18} /> {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Preview */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6">Review Details</h3>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-200/60 mb-8 shadow-inner">
              <Preview label="Full Name" value={form.name} icon={<User size={18} />} />
              <Preview label="Email Address" value={form.email} icon={<Mail size={18} />} />
              <Preview 
                  label="Course" 
                  value={courses.find(c => c.id == form.course_id)?.name || <span className="text-slate-400 italic">Not Selected</span>} 
                  icon={<BookOpen size={18} />} 
                />
                <Preview 
                  label="Batch" 
                  value={batches.find(b => b.id == form.batch_id)?.name || <span className="text-slate-400 italic">Not Selected</span>} 
                  icon={<Layers size={18} />} 
                />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 rounded-xl py-3.5 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl py-3.5 font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                Confirm Details <Check size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirm */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300 text-center flex-1 flex flex-col justify-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 border border-amber-100 shadow-sm">
              <AlertCircle size={40} />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Confirm Action</h1>
            <p className="text-slate-600 text-base leading-relaxed mb-10 max-w-sm mx-auto">
              New login credentials will be generated and sent to <span className="font-bold text-slate-900">{form.email}</span>. <br/>Are you sure you want to proceed?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 rounded-xl py-3.5 font-bold hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white rounded-xl py-3.5 font-bold hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
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
                className={`mt-8 p-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
                  message.toLowerCase().includes("exists") ||
                  message.toLowerCase().includes("failed")
                    ? "bg-rose-50 text-rose-700 border border-rose-100"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                }`}
              >
                {message.toLowerCase().includes("exists") ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {message}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50">
                <div className="bg-emerald-500 rounded-full p-1">
                    <Check size={14} className="text-white" strokeWidth={3} />
                </div>
                <div className="text-sm font-semibold tracking-wide">Student added successfully</div>
            </div>
        </div>
      )}
    </div>
  );
}

/* --- Sub Components --- */

function Preview({ label, value, icon }) {
  return (
    <div className="flex justify-between items-center px-8 py-5 hover:bg-slate-50 transition-colors group">
      <div className="flex items-center gap-3 text-slate-500 group-hover:text-indigo-600 transition-colors">
        <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm group-hover:border-indigo-200 group-hover:shadow-indigo-100 transition-all">
            {icon}
        </div>
        <span className="text-sm font-bold uppercase tracking-wide">{label}</span>
      </div>
      <span className="font-bold text-slate-800 text-right text-base">{value}</span>
    </div>
  );
}