import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../lib/auth/useAuth";
import { COUNTRIES } from "../../constants/countries";
import {
  ArrowLeft, User, Calendar, Phone,
  Lock, CheckCircle2, AlertCircle, KeyRound,
  ShieldCheck, Save, Mail, Briefcase, X, ArrowRight,
  Eye, EyeOff
} from "lucide-react";

import {
  updateProfile,
  changePassword,
  sendPasswordOtp,
  verifyOtpPassword
} from "../../lib/api/apiClient";

export default function ManageProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const formatDate = (d) => (d ? d.split("T")[0] : "");

  const [form, setForm] = useState({
    name: "",
    dob: "",
    country: "",
    mobile: ""
  });

  const [initial, setInitial] = useState(form);

  const [method, setMethod] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState("");

  // 🔥 NEW: OTP TIMER
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (user) {
      const data = {
        name: user.name || "",
        dob: formatDate(user.dob),
        country: user.country || "India",
        mobile: user.mobile || ""
      };
      setForm(data);
      setInitial(data);
    }
  }, [user]);

  // 🔥 TIMER LOGIC
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  if (!user) return (
    <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
    </div>
  );

  const isChanged = JSON.stringify(form) !== JSON.stringify(initial);

  // 🔥 UNIVERSAL ERROR PARSER (Fixed to safely extract Laravel errors)
  const parseError = (e) => {
    const data = e?.response?.data;
    
    if (data?.errors) {
      return Object.values(data.errors)[0][0];
    }
    
    return data?.message || e?.message || "Something went wrong";
  };

  // ================= PROFILE =================
  const handleSave = async () => {
    try {
      setLoading(true);
      setMsg("");

      const res = await updateProfile(form);

      updateUser(res.data.user);
      setInitial(form);

      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);

    } catch (e) {
      setMsg(parseError(e));
      setTimeout(() => setMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ================= PASSWORD =================
  const handlePassword = async () => {
    try {
      setLoading(true);
      setMsg("");

      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });

      setSuccess("Password updated successfully");
      setTimeout(() => setSuccess(""), 3000);

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (e) {
      setMsg(parseError(e));
      setTimeout(() => setMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ================= OTP SEND =================
  const handleSendOtp = async () => {
    try {
      setOtpLoading(true);
      setMsg("");

      await sendPasswordOtp();
      setOtpOpen(true);

      setTimer(60); // 🔥 start timer

      setSuccess("OTP sent to your email");
      setTimeout(() => setSuccess(""), 3000);

    } catch (e) {
      setMsg(parseError(e));
      setTimeout(() => setMsg(""), 3000);
    } finally {
      setOtpLoading(false);
    }
  };

  // ================= OTP VERIFY =================
  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      setMsg("");

      await verifyOtpPassword({
        otp,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });

      setSuccess("Password updated successfully");
      setTimeout(() => setSuccess(""), 3000);

      setOtpOpen(false);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (e) {
      setMsg(parseError(e));
      setTimeout(() => setMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in font-sans pb-20">

      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] transition-colors mb-2 w-max">
        <ArrowLeft size={16}/> Back
      </button>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-brand-teal-500/10 text-brand-teal-600"><User size={26} /></span>
            Manage Profile
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm max-w-xl">
            Update your personal information, configure security settings, and manage account access.
          </p>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-2xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 sm:px-8 py-6 border-b border-[rgb(var(--zx-border))] flex flex-col sm:flex-row sm:items-center justify-between bg-[rgb(var(--zx-bg))] gap-4">
            <div>
                <h3 className="text-lg font-bold text-[rgb(var(--zx-text))]">Personal Information</h3>
                <p className="text-xs font-medium text-[rgb(var(--zx-text-muted))] mt-1">Basic details and contact info</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-teal-500/10 border border-brand-teal-500/20 rounded-lg w-max">
                <ShieldCheck size={14} className="text-brand-teal-600" />
                <span className="text-xs font-bold text-brand-teal-700 capitalize tracking-wide">{user.role} Account</span>
            </div>
        </div>

        <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full Name" value={form.name} onChange={v => setForm({...form, name:v})} icon={<User size={16}/>}/>
                <Disabled label="Email Address" value={user.email} icon={<Mail size={16}/>} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input type="date" label="Date of Birth" value={form.dob} onChange={v => setForm({...form, dob:v})} icon={<Calendar size={16}/>}/>
                <Input label="Mobile Number" value={form.mobile} onChange={v => setForm({...form, mobile:v.replace(/\D/g,"")})} icon={<Phone size={16}/>}/>
                <Select value={form.country} onChange={v => setForm({...form, country:v})}/>
            </div>
        </div>

        <div className="px-6 sm:px-8 py-5 border-t border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-bg))] flex justify-end">
            <button
                disabled={!isChanged || loading}
                onClick={handleSave}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                    isChanged && !loading
                    ? "bg-brand-teal-500 text-white hover:bg-brand-teal-600"
                    : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] cursor-not-allowed border border-[rgb(var(--zx-border))]"
                }`}
            >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                {loading ? "Saving..." : "Save Changes"}
            </button>
        </div>
      </div>

      {/* PASSWORD CARD */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-2xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 sm:px-8 py-6 border-b border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-bg))]">
            <h3 className="text-lg font-bold text-[rgb(var(--zx-text))]">Security Settings</h3>
            <p className="text-xs font-medium text-[rgb(var(--zx-text-muted))] mt-1">Update your password and authentication methods</p>
        </div>

        <div className="p-8 space-y-6">
            <div className="space-y-1.5 max-w-sm">
                <label className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Authentication Method</label>
                <select 
                    value={method} 
                    onChange={e=>setMethod(e.target.value)} 
                    className="w-full bg-[rgb(var(--zx-bg))] border border-[rgb(var(--zx-border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-[rgb(var(--zx-text))]"
                >
                    <option value="" disabled>Select Verification Method</option>
                    <option value="old">Verify via Current Password</option>
                    <option value="otp">Verify via Email OTP</option>
                </select>
            </div>

            <div className="w-full h-px bg-[rgb(var(--zx-border))]"></div>

            {method === "old" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <PasswordInput label="Current Password" value={oldPassword} onChange={setOldPassword}/>
                        <PasswordInput label="New Password" value={newPassword} onChange={setNewPassword}/>
                        <PasswordInput label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword}/>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handlePassword}
                            disabled={loading || !oldPassword || newPassword.length < 8 || newPassword !== confirmPassword}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                                (!loading && oldPassword && newPassword.length >= 8 && newPassword === confirmPassword)
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
                                : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] cursor-not-allowed border border-[rgb(var(--zx-border))]"
                            }`}
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock size={16} />}
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </div>
            )}

            {method === "otp" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                        <PasswordInput label="New Password" value={newPassword} onChange={setNewPassword}/>
                        <PasswordInput label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword}/>
                    </div>

                    <div className="flex justify-start pt-2">
                        <button
                            onClick={handleSendOtp}
                            disabled={otpLoading || timer > 0 || newPassword.length < 8 || newPassword !== confirmPassword}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                                (!otpLoading && timer === 0 && newPassword.length >= 8 && newPassword === confirmPassword)
                                ? "bg-brand-teal-500 text-white hover:bg-brand-teal-600"
                                : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] cursor-not-allowed border border-[rgb(var(--zx-border))]"
                            }`}
                        >
                            {otpLoading ? <div className="w-5 h-5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" /> : <Mail size={16} />}
                            {otpLoading ? "Sending..." : timer > 0 ? `Resend Available in ${timer}s` : "Send OTP to Email"}
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* OTP MODAL */}
      {otpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-[rgb(var(--zx-border))]">

            <div className="px-6 py-5 border-b border-[rgb(var(--zx-border))] flex justify-between items-center bg-[rgb(var(--zx-surface-hover))]/50">
                <div>
                    <h2 className="text-xl font-bold text-[rgb(var(--zx-text))]">Security Verification</h2>
                </div>
                <button onClick={()=>setOtpOpen(false)} className="text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface-hover))] p-2 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="p-8 flex flex-col items-center space-y-6">
                <div className="w-16 h-16 bg-brand-teal-500/10 rounded-full flex items-center justify-center text-brand-teal-600 mb-2">
                    <KeyRound size={32} />
                </div>

                <div className="text-center space-y-1">
                    <h3 className="font-bold text-lg text-[rgb(var(--zx-text))]">Enter OTP</h3>
                    <p className="text-sm text-[rgb(var(--zx-text-muted))]">Enter the 6-digit verification code sent to your registered email address.</p>
                </div>

                <div className="w-full relative">
                    <input
                        value={otp}
                        onChange={e=>setOtp(e.target.value.replace(/\D/g,""))}
                        maxLength={6}
                        className="w-full bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] p-4 text-center text-2xl font-mono tracking-[0.5em] font-bold text-[rgb(var(--zx-text))] rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all placeholder:font-normal placeholder:tracking-normal"
                        placeholder="------"
                    />
                </div>

                <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length < 6}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 ${
                        (!loading && otp.length === 6)
                        ? "bg-[rgb(var(--zx-text))] text-[rgb(var(--zx-surface))] hover:opacity-90 shadow-lg"
                        : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] cursor-not-allowed border border-[rgb(var(--zx-border))]"
                    }`}
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Verify & Update Password"}
                </button>

                <div className="text-center pt-2">
                    <button
                        onClick={handleSendOtp}
                        disabled={otpLoading || timer > 0}
                        className="text-xs font-bold uppercase tracking-widest transition-colors hover:underline disabled:no-underline disabled:text-[rgb(var(--zx-text-muted))] text-brand-teal-600 dark:text-brand-teal-400"
                    >
                        {otpLoading ? "Sending..." : timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM TOAST SYSTEM */}
      {(msg || success) && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50 min-w-[300px]">
            <div className={`rounded-full p-1 ${success ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                {success ? <CheckCircle2 size={14} className="text-white" strokeWidth={3} /> : <AlertCircle size={14} className="text-white" strokeWidth={3} />}
            </div>
            <span className="text-sm font-semibold tracking-wide mr-4">{success || msg}</span>
            <button onClick={() => { setMsg(""); setSuccess(""); }} className="ml-auto text-slate-400 hover:text-white transition-colors">
                <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Input({ label, value, onChange, icon, type="text" }) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</div>}
        <input 
            type={type} 
            value={value} 
            onChange={(e)=>onChange(e.target.value)} 
            className={`w-full bg-[rgb(var(--zx-bg))] border border-[rgb(var(--zx-border))] rounded-xl ${icon ? 'pl-11' : 'px-4'} pr-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-[rgb(var(--zx-text))] placeholder:font-normal placeholder:text-[rgb(var(--zx-text-muted))]`}
        />
      </div>
    </div>
  );
}

function PasswordInput({ label, value, onChange }) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Lock size={16}/>
        </div>
        <input 
            type={show ? "text" : "password"} 
            value={value} 
            onChange={(e)=>onChange(e.target.value)} 
            className="w-full bg-[rgb(var(--zx-bg))] border border-[rgb(var(--zx-border))] rounded-xl pl-11 pr-11 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-[rgb(var(--zx-text))] placeholder:font-normal placeholder:text-[rgb(var(--zx-text-muted))]"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[rgb(var(--zx-text))] transition-colors focus:outline-none"
        >
          {show ? <EyeOff size={16}/> : <Eye size={16}/>}
        </button>
      </div>
    </div>
  );
}

function Disabled({ label, value, icon }) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</div>}
        <input 
            value={value || ""} 
            disabled 
            className={`w-full bg-slate-50 border border-slate-200 rounded-xl ${icon ? 'pl-11' : 'px-4'} pr-4 py-3 text-sm font-bold text-slate-500 cursor-not-allowed`}
        />
      </div>
    </div>
  );
}

function Select({ value, onChange }) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[10px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Country</label>
      <select 
        value={value} 
        onChange={(e)=>onChange(e.target.value)} 
        className="w-full bg-[rgb(var(--zx-bg))] border border-[rgb(var(--zx-border))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-[rgb(var(--zx-text))] appearance-none"
      >
        {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
      </select>
    </div>
  );
}