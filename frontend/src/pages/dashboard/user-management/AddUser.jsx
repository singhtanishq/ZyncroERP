import React, { useState } from "react";
import api from "../../../lib/api/apiClient";
import { 
  UserPlus, 
  User, 
  Mail, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  X
} from "lucide-react";

export default function AddUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "student",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    return form.name.trim() !== "" && form.email.trim() !== "" && form.role !== "";
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setLoading(true);
      
      // Using your standard apiClient for consistency
      await api.post("/admin/users", form);

      showToast("User created & credentials sent securely", "success");

      setForm({ name: "", email: "", role: "student" });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create user", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans animate-fade-in pb-20">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <UserPlus className="text-indigo-600" size={32} />
            Add New User
        </h1>
        <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Provision a new account within the system. Access credentials will be automatically securely emailed to the user.
        </p>
      </div>

      {/* MAIN FORM CARD */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 flex flex-col overflow-hidden">
        
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800">Account Details</h3>
            <p className="text-xs font-medium text-slate-500 mt-1">Configure user identity and system privileges</p>
        </div>
        
        <div className="p-8 space-y-6">
            {/* Full Name */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <User size={14} className="text-indigo-500"/> Full Name *
                </label>
                <input
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400"
                    placeholder="e.g. John Doe"
                    value={form.name}
                    onChange={e => update("name", e.target.value)}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Address */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <Mail size={14} className="text-indigo-500"/> Email Address *
                    </label>
                    <input
                        type="email"
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                        placeholder="user@zyncroerp.local"
                        value={form.email}
                        onChange={e => update("email", e.target.value)}
                        required
                    />
                </div>

                {/* Role Selection */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-indigo-500"/> System Role *
                    </label>
                    <select
                        value={form.role}
                        onChange={e => update("role", e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                        required
                    >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="franchise">Franchise</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>
            </div>
        </div>

        {/* NAVIGATION FOOTER */}
        <div className="flex justify-between items-center px-8 py-5 border-t border-slate-100 bg-slate-50">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
                All fields are mandatory *
            </p>

            <button
                type="submit"
                disabled={loading || !isFormValid()}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                isFormValid() && !loading
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                }`}
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <Save size={18} /> 
                )}
                {loading ? "Provisioning..." : "Create Account"} 
                {!loading && <ArrowRight size={16} className="opacity-50" />}
            </button>
        </div>
      </form>

      {/* DUAL-STATE TOAST NOTIFICATION */}
      {toast.msg && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50 min-w-[300px]">
            <div className={`rounded-full p-1 ${toast.type === "success" ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                {toast.type === "success" 
                    ? <CheckCircle2 size={14} className="text-white" strokeWidth={3} /> 
                    : <AlertCircle size={14} className="text-white" strokeWidth={3} />
                }
            </div>
            <span className="text-sm font-semibold tracking-wide mr-4">{toast.msg}</span>
            <button onClick={() => setToast({ msg: "", type: "success" })} className="ml-auto text-slate-400 hover:text-white transition-colors">
                <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}