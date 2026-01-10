import { useState } from "react";
import api from "../../../lib/api/apiClient";
import { 
  Save, 
  Store, 
  User, 
  Phone, 
  Mail, 
  Hash, 
  MapPin, 
  Check,
  ArrowRight,
  PlusCircle
} from "lucide-react";

export default function AddFranchise() {
  const [form, setForm] = useState({
    name: "",
    code: "",
    owner_name: "",
    phone: "",
    email: "",
    address: "",
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
    return form.name && form.code && form.owner_name && form.phone && form.email;
  };

  const submit = async () => {
    try {
      setLoading(true);
      await api.post("/franchises", form);
      
      showToast("Franchise registered successfully");

      setForm({
        name: "",
        code: "",
        owner_name: "",
        phone: "",
        email: "",
        address: "",
      });
      
      // Optional: Redirect like in ScheduleExam
      // setTimeout(() => { window.location.href = "/dashboard/franchises"; }, 800);
      
    } catch (e) {
      console.error(e);
      showToast("Failed to add franchise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans animate-fade-in">
      
      {/* HEADER */}
      <div className="mb-8">
        
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Store className="text-indigo-600" size={32} />
            Add New Franchise
        </h1>
        <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Establish a new branch under the network. Configure ownership and contact parameters.
        </p>
      </div>

      {/* MAIN FORM CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 p-8 flex flex-col">
        
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6">Branch Details</h3>
        
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Franchise Name */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Franchise Name *</label>
                    <input
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400"
                        placeholder="e.g. Zyncro North Campus"
                        value={form.name}
                        onChange={e => update("name", e.target.value)}
                    />
                </div>

                {/* Franchise Code */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                        <Hash size={14} className="text-indigo-500"/> Franchise Code *
                    </label>
                    <input
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400"
                        placeholder="FST-001"
                        value={form.code}
                        onChange={e => update("code", e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Owner Name */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                        <User size={14} className="text-indigo-500"/> Owner Name *
                    </label>
                    <input
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                        placeholder="Enter full name"
                        value={form.owner_name}
                        onChange={e => update("owner_name", e.target.value)}
                    />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                        <Phone size={14} className="text-indigo-500"/> Primary Phone *
                    </label>
                    <input
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                        placeholder="+91 00000 00000"
                        value={form.phone}
                        onChange={e => update("phone", e.target.value)}
                    />
                </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                    <Mail size={14} className="text-indigo-500"/> Official Email Address *
                </label>
                <input
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                    placeholder="franchise@zyncroerp.local"
                    value={form.email}
                    onChange={e => update("email", e.target.value)}
                />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                    <MapPin size={14} className="text-indigo-500"/> Physical Address
                </label>
                <textarea
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400 resize-none"
                    placeholder="Enter the full operational address..."
                    rows={3}
                    value={form.address}
                    onChange={e => update("address", e.target.value)}
                />
            </div>
        </div>

        {/* NAVIGATION FOOTER */}
        <div className="flex justify-between items-center  pt-8 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
                Required fields are marked with *
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
                        <Save size={18} /> Register Franchise <ArrowRight size={16} className="opacity-50" />
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