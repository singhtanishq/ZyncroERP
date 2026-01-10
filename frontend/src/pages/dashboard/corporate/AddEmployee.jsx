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
  Building2
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
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in font-sans pb-24">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <User className="text-indigo-600" size={32} />
            Add Employee
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Register a new corporate employee. Ensure all contact details and role assignments are accurate before saving.
          </p>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        
        {/* Form Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
              <Briefcase size={20} />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-lg">Employee Profile</h3>
                <p className="text-xs font-medium text-slate-500">Provide official identity and organizational placement</p>
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                 <ShieldCheck size={14} className="text-indigo-500" /> System Role *
              </label>
              <div className="relative">
                  <select
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
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
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
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
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <p className="text-xs font-medium text-slate-400">
            Fields marked with an asterisk (*) are mandatory.
          </p>
          <button
            onClick={submit}
            disabled={!isFormValid() || loading}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 ${
              isFormValid()
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
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

// ================= REUSABLE INPUT COMPONENT =================
function Input({ label, value, onChange, placeholder, icon: Icon, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-indigo-500" />} {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all placeholder:font-normal placeholder:text-slate-400"
      />
    </div>
  );
}