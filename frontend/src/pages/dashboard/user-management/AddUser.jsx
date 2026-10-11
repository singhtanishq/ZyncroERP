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
  X,
  ChevronDown
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
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 font-sans">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <div className="mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
          <UserPlus size={14} strokeWidth={2.5} />
          User Provisioning
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight">
          Add New User
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
          Provision a new account within the system. Access credentials will be automatically securely emailed to the user.
        </p>
      </div>

      {/* MAIN FORM CARD */}
      <form onSubmit={handleSubmit} className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-3xl shadow-sm flex flex-col overflow-hidden relative z-10">
        
        <div className="px-8 py-6 border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))]">
            <h3 className="font-bold text-[rgb(var(--zx-text))] text-base">Account Details</h3>
            <p className="text-xs font-medium text-[rgb(var(--zx-text-muted))] mt-0.5">Configure user identity and system privileges</p>
        </div>
        
        <div className="p-8 space-y-6">
            {/* Full Name */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <User size={14} className="text-brand-teal-500"/> Full Name *
                </label>
                <input
                    className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all font-bold text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal"
                    placeholder="e.g. John Doe"
                    value={form.name}
                    onChange={e => update("name", e.target.value)}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Address */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <Mail size={14} className="text-brand-teal-500"/> Email Address *
                    </label>
                    <input
                        type="email"
                        className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-semibold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                        placeholder="user@zyncroerp.local"
                        value={form.email}
                        onChange={e => update("email", e.target.value)}
                        required
                    />
                </div>

                {/* Role Selection */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-brand-teal-500"/> System Role *
                    </label>
                    <div className="relative group">
                      <select
                          value={form.role}
                          onChange={e => update("role", e.target.value)}
                          className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-bold cursor-pointer shadow-sm"
                          required
                      >
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="admin">Administrator</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-4 top-3.5 text-[rgb(var(--zx-text-muted))] pointer-events-none"
                      />
                    </div>
                    <p className="text-[11px] text-[rgb(var(--zx-text-muted))] font-medium ml-1">
                      Franchise and Employee logins are created via their dedicated management pages.
                    </p>
                </div>
            </div>
        </div>

        {/* NAVIGATION FOOTER */}
        <div className="flex justify-between items-center px-8 py-5 border-t border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))]">
            <p className="text-[11px] text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-widest hidden sm:block">
                All fields are mandatory *
            </p>

            <button
                type="submit"
                disabled={loading || !isFormValid()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg active:scale-95 ${
                isFormValid() && !loading
                    ? "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-brand-teal-500/25"
                    : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
                }`}
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <Save size={16} /> 
                )}
                {loading ? "Provisioning..." : "Create Account"} 
                {!loading && <ArrowRight size={16} className="opacity-50" />}
            </button>
        </div>
      </form>

      {/* DUAL-STATE TOAST NOTIFICATION */}
      {toast.msg && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[rgb(var(--zx-border))] backdrop-blur-xl min-w-[300px]">
            <div className={`rounded-full p-1 border ${toast.type === "success" ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-rose-500/20 text-rose-500 border-rose-500/30'}`}>
                {toast.type === "success" 
                    ? <CheckCircle2 size={14} strokeWidth={3} /> 
                    : <AlertCircle size={14} strokeWidth={3} />
                }
            </div>
            <span className="text-sm font-bold tracking-wide mr-4">{toast.msg}</span>
            <button type="button" onClick={() => setToast({ msg: "", type: "success" })} className="ml-auto text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] transition-colors">
                <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}