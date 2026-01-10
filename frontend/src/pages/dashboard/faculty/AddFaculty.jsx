import { useState } from "react";
import api from "../../../lib/api/apiClient";
import { 
  Save, 
  GraduationCap, 
  User, 
  Phone, 
  Mail, 
  BookOpen, 
  Briefcase, 
  Check,
  ArrowRight
} from "lucide-react";

export default function AddFaculty() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    qualification: "",
    specialization: "",
    join_date: "",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    return form.name && form.phone && form.email && form.qualification && form.specialization && form.join_date;  };

  const submit = async () => {
    try {
      setLoading(true);
      await api.post("/faculties", form);
      
      showToast("Faculty registered successfully");

      setForm({
        name: "",
        phone: "",
        email: "",
        qualification: "",
        specialization: "",
        join_date: "",
      });
      
    } catch (e) {
      console.error(e);
      showToast("Failed to add faculty member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans animate-fade-in">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <GraduationCap className="text-indigo-600" size={32} />
            Add New Faculty
        </h1>
        <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Register a new educator. Configure academic credentials and professional specialization.
        </p>
      </div>

      {/* MAIN FORM CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 p-8 flex flex-col">
        
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6">Faculty Profile</h3>
        
        <div className="space-y-6">
            {/* Faculty Name - Spans Full Width */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                    <User size={14} className="text-indigo-500"/> Full Name *
                </label>
                <input
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400"
                    placeholder="e.g. Dr. Jane Smith"
                    value={form.name}
                    onChange={e => update("name", e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Qualification */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-indigo-500"/> Highest Qualification *
                    </label>
                    <input
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                        placeholder="e.g. Ph.D. in Computer Science"
                        value={form.qualification}
                        onChange={e => update("qualification", e.target.value)}
                    />
                </div>

                {/* Specialization */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                        <Briefcase size={14} className="text-indigo-500"/> Specialization *
                    </label>
                    <input
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                        placeholder="e.g. Neural Networks & AI"
                        value={form.specialization}
                        onChange={e => update("specialization", e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                        <Mail size={14} className="text-indigo-500"/> Official Email *
                    </label>
                    <input
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                        placeholder="faculty@zyncroerp.local"
                        value={form.email}
                        onChange={e => update("email", e.target.value)}
                    />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                        <Phone size={14} className="text-indigo-500"/> Phone Number *
                    </label>
                    <input
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                        placeholder="+91 00000 00000"
                        value={form.phone}
                        onChange={e => update("phone", e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                        Joining Date *
                    </label>
                    <input
                        type="date"
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
                        value={form.join_date}
                        onChange={(e) => update("join_date", e.target.value)}
                    />
                    </div>
            </div>
        </div>

        {/* NAVIGATION FOOTER */}
        <div className="flex justify-between items-center pt-8 mt-4 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
                All fields are mandatory for registration *
            </p>

            <button
                onClick={submit}
                disabled={loading || !isFormValid()}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                isFormValid() && !loading
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300 active:scale-95"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                }`}
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <Save size={18} /> Register Faculty <ArrowRight size={16} className="opacity-50" />
                    </>
                )}
            </button>
        </div>
      </div>

      {/* TOAST SYSTEM */}
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