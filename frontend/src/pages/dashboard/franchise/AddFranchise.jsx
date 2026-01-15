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
  ArrowRight
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
      
    } catch (e) {
      console.error(e);
      showToast("Failed to add franchise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 font-sans animate-fade-in">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <div className="mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
          <Store size={14} strokeWidth={2.5} />
          Network Expansion
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
          Add New Franchise
        </h1>
        <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
          Establish a new branch under the network. Configure ownership and contact parameters.
        </p>
      </div>

      {/* MAIN FORM CARD */}
      <div className="bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-3xl shadow-sm p-8 flex flex-col relative z-10">
        
        <h3 className="text-base font-bold text-[rgb(var(--zx-text))] border-b border-[rgb(var(--zx-border))] pb-3 mb-6">Branch Details</h3>
        
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Franchise Name */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Franchise Name *</label>
                    <input
                        className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all font-bold text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal"
                        placeholder="e.g. Zyncro North Campus"
                        value={form.name}
                        onChange={e => update("name", e.target.value)}
                    />
                </div>

                {/* Franchise Code */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <Hash size={14} className="text-brand-teal-500"/> Franchise Code *
                    </label>
                    <input
                        className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all font-bold text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal font-mono"
                        placeholder="FST-001"
                        value={form.code}
                        onChange={e => update("code", e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Owner Name */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <User size={14} className="text-brand-teal-500"/> Owner Name *
                    </label>
                    <input
                        className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-semibold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                        placeholder="Enter full name"
                        value={form.owner_name}
                        onChange={e => update("owner_name", e.target.value)}
                    />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                        <Phone size={14} className="text-brand-teal-500"/> Primary Phone *
                    </label>
                    <input
                        className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-semibold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                        placeholder="+91 00000 00000"
                        value={form.phone}
                        onChange={e => update("phone", e.target.value)}
                    />
                </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Mail size={14} className="text-brand-teal-500"/> Official Email Address *
                </label>
                <input
                    className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-semibold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                    placeholder="franchise@zyncroerp.local"
                    value={form.email}
                    onChange={e => update("email", e.target.value)}
                />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <MapPin size={14} className="text-brand-teal-500"/> Physical Address
                </label>
                <textarea
                    className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 focus:outline-none focus:border-brand-teal-500 transition-all text-sm font-medium shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 resize-none"
                    placeholder="Enter the full operational address..."
                    rows={3}
                    value={form.address}
                    onChange={e => update("address", e.target.value)}
                />
            </div>
        </div>

        {/* NAVIGATION FOOTER */}
        <div className="flex justify-between items-center pt-8 border-t border-[rgb(var(--zx-border))] mt-8">
            <p className="text-[10px] text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-widest hidden sm:block">
                Required fields are marked with *
            </p>

            <button
                type="button"
                onClick={submit}
                disabled={loading || !isFormValid()}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${
                isFormValid() && !loading
                    ? "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-brand-teal-500/20 active:scale-95"
                    : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
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