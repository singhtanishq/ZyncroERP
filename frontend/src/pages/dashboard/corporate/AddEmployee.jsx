import { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
  Building2,
  ChevronDown
} from "lucide-react";

export default function AddEmployee() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role_id: "",
    department: "",
    joining_date: "",
  });

  // ================= FETCH ROLES =================
  const fetchRoles = async () => {
    try {
      const res = await api.get("/corporate/roles");
      setRoles(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch roles", "error");
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // ================= UPDATE FORM =================
  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // ================= TOAST =================
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  // ================= VALIDATION =================
  const isFormValid = () => {
    return (
      form.name &&
      form.email &&
      form.role_id &&
      form.joining_date
    );
  };

  // ================= SUBMIT =================
  const submit = async () => {
    try {
      setLoading(true);

      await api.post("/corporate/employees", form);

      showToast("Employee added successfully", "success");

      setForm({
        name: "",
        email: "",
        phone: "",
        role_id: "",
        department: "",
        joining_date: "",
      });

    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to add employee", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 space-y-8 animate-fade-in font-sans">

      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
            <User size={14} strokeWidth={2.5} />
            Corporate Directory
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Add Employee
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Register a new corporate employee. Ensure all contact details and role assignments are accurate before saving.
          </p>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl shadow-sm border border-[rgb(var(--zx-border))] overflow-hidden relative z-10">
        
        {/* Form Header */}
        <div className="px-8 py-6 border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgb(var(--zx-surface))] rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] shadow-sm">
              <Briefcase size={20} />
            </div>
            <div>
                <h3 className="font-bold text-[rgb(var(--zx-text))] text-base">Employee Profile</h3>
                <p className="text-xs font-medium text-[rgb(var(--zx-text-muted))]">Provide official identity and organizational placement</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* NAME */}
            <Input
              label="Full Legal Name *"
              icon={User}
              placeholder="e.g. Tanishq Singh"
              value={form.name}
              onChange={(v) => update("name", v)}
            />

            {/* EMAIL */}
            <Input
              label="Corporate Email Address *"
              icon={Mail}
              type="email"
              placeholder="name@zyncroerp.local"
              value={form.email}
              onChange={(v) => update("email", v)}
            />

            {/* PHONE */}
            <Input
              label="Contact Number"
              icon={Phone}
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={form.phone}
              onChange={(v) => update("phone", v)}
            />

            {/* ROLE DROPDOWN */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                 <ShieldCheck size={14} className="text-brand-teal-500" /> System Role *
              </label>
              <div className="relative group">
                  <select
                    className="w-full appearance-none bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] rounded-xl px-4 py-3 text-sm font-semibold text-[rgb(var(--zx-text))] focus:outline-none focus:border-brand-teal-500 transition-all cursor-pointer shadow-sm"
                    value={form.role_id}
                    onChange={(e) => update("role_id", e.target.value)}
                  >
                    <option value="" disabled>Select Organizational Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[rgb(var(--zx-text-muted))]">
                    <ChevronDown size={16} />
                  </div>
              </div>
            </div>

            {/* DEPARTMENT */}
            <Input
              label="Department"
              icon={Building2}
              placeholder="e.g. Engineering, HR, Sales"
              value={form.department}
              onChange={(v) => update("department", v)}
            />

            {/* JOINING DATE */}
            <Input
              label="Date of Joining *"
              type="date"
              icon={Calendar}
              value={form.joining_date}
              onChange={(v) => update("joining_date", v)}
            />

          </div>
        </div>

        {/* Form Footer */}
        <div className="px-8 py-5 border-t border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface-hover))] flex items-center justify-between shrink-0">
          <p className="text-xs font-medium text-[rgb(var(--zx-text-muted))]">
            Fields marked with an asterisk (*) are mandatory.
          </p>
          <button
            type="button"
            onClick={submit}
            disabled={!isFormValid() || loading}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg active:scale-95 ${
              isFormValid() && !loading
                ? "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-brand-teal-500/20"
                : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border border-[rgb(var(--zx-border))] cursor-not-allowed shadow-none"
            }`}
          >
            {loading ? (
               <>
                 <Loader2 size={16} className="animate-spin" /> Processing...
               </>
            ) : (
              <>
                <Save size={16} /> Save Employee Profile
              </>
            )}
          </button>
        </div>
      </div>

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

// ================= REUSABLE INPUT COMPONENT =================
function Input({ label, value, onChange, placeholder, icon: Icon, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1 flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-brand-teal-500" />} {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand-teal-500 transition-all shadow-sm placeholder:font-normal placeholder:text-[rgb(var(--zx-text-muted))]/60"
      />
    </div>
  );
}