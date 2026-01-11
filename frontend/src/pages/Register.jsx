import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  registerStart,
  registerVerify,
  registerComplete,
} from "../lib/api/apiClient";
import { COUNTRIES } from "../constants/countries";
import { 
  User, Mail, BadgeCheck, Calendar, Globe, Phone, 
  Lock, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, 
  KeyRound, AlertCircle, CheckCircle2, Users, BarChart3, Fingerprint
} from "lucide-react";

// Build a name → dialCode lookup map from COUNTRIES
const COUNTRY_CODE_BY_NAME = (COUNTRIES || []).reduce((map, c) => {
  if (c?.name && c?.dialCode) {
    map[c.name] = c.dialCode;
  }
  return map;
}, {});

export default function RegisterPage() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // Step 1: basic details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  // Step 2: more information
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("India");
  const [mobile, setMobile] = useState("");

  // Step 3: password
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [msg, setMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // step control: "details" | "info" | "password"
  const [step, setStep] = useState("details");

  // Email verification via OTP
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);

  const countryDialCode = COUNTRY_CODE_BY_NAME[country] ?? "";

  function resetOtpState() {
    setOtpOpen(false);
    setOtpCode("");
    setOtpError("");
    setVerifyingOtp(false);
    setOtpAttempts(0);
  }

  async function handleSendSignupOtp() {
    if (emailVerified) return; // already verified, do nothing

    setMsg("");
    setOtpError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      setMsg("Please fill your full name and email before verifying.");
      return;
    }

    if (!role) {
      setMsg("Please select your role before verifying email.");
      return;
    }

    setSendingOtp(true);

    try {
      await registerStart(trimmedName, trimmedEmail, role);
      setEmailVerified(false);
      setOtpOpen(true);
      setSuccessMsg("Verification code sent to your email.");
      setTimeout(() => setSuccessMsg(""), 2500);
    } catch (err) {
      console.error("register start error:", err);

      let msgText = "Unable to send verification code.";

      if (err?.response) {
        const { status, data } = err.response;
        if (status === 422) {
          msgText = "This email is already registered. Please log in instead.";
        } else if (typeof data === "string") {
          try {
            const parsed = JSON.parse(data);
            msgText = parsed?.message ?? data;
          } catch {
            msgText = data;
          }
        } else if (data?.message) {
          if (typeof data.message === "string") {
            try {
              const parsedInner = JSON.parse(data.message);
              msgText = parsedInner?.message ?? data.message;
            } catch {
              msgText = data.message;
            }
          } else {
            msgText = data.message;
          }
        }
      } else if (err?.message) {
        msgText = err.message;
      }

      setMsg(msgText);
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifySignupOtp(e) {
    e.preventDefault();
    setOtpError("");
    setVerifyingOtp(true);

    try {
      const code = otpCode.trim();
      if (!code || code.length !== 6) {
        setOtpError("Please enter the 6-digit code.");
        setVerifyingOtp(false);
        return;
      }

      await registerVerify(code);

      setEmailVerified(true);
      resetOtpState();
      setSuccessMsg("Email verified. You can now continue.");
      setTimeout(() => setSuccessMsg(""), 2500);
    } catch (err) {
      console.error("register verify error:", err);

      setOtpAttempts((prev) => {
        const next = prev + 1;
        const attemptsLeft = Math.max(0, 3 - next);

        if (attemptsLeft > 0) {
          setOtpError(
            `Incorrect or expired code. ${attemptsLeft} attempt(s) left.`
          );
        } else {
          resetOtpState();
          setMsg(
            "Maximum OTP attempts reached. Please request a new verification code."
          );
        }

        return next;
      });
    } finally {
      setVerifyingOtp(false);
    }
  }

  // Step 1 → Step 2
  function handleContinueDetails(e) {
    e.preventDefault();
    setMsg("");

    const canContinue = name.trim() && email.trim() && role && emailVerified;

    if (!canContinue) {
      setMsg(
        "Please fill all details and verify your email before continuing."
      );
      return;
    }

    setStep("info");
  }

  // Step 2 → Step 3
  function handleContinueInfo(e) {
    e.preventDefault();
    setMsg("");

    if (!dob) {
      setMsg("Please select your date of birth.");
      return;
    }

    if (!country) {
      setMsg("Please select your country.");
      return;
    }

    if (!mobile.trim()) {
      setMsg("Please enter your mobile number.");
      return;
    }

    setStep("password");
  }

  // Final submit – Step 3
  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      if (!emailVerified) {
        setMsg("Please verify your email first.");
        setSubmitting(false);
        return;
      }

      if (!password || !passwordConfirm) {
        setMsg("Please enter and confirm your password.");
        setSubmitting(false);
        return;
      }

      if (password !== passwordConfirm) {
        setMsg("Passwords do not match.");
        setSubmitting(false);
        return;
      }

      await registerComplete(
        password,
        passwordConfirm,
        dob,
        country,
        mobile.trim()
      );

      setSuccessMsg("Sign up successful. Redirecting to login...");
      setTimeout(() => {
        setSuccessMsg("");
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("register complete error:", err);
      const msgText =
        err?.response?.data?.message ??
        err?.message ??
        "Signup failed. Please try again.";
      setMsg(msgText);
    } finally {
      setSubmitting(false);
    }
  }

  const canContinueDetails =
    name.trim() && email.trim() && role && emailVerified;

  const canContinueInfo = dob && country && mobile.trim();

  function handleFormSubmit(e) {
    if (step === "details") return handleContinueDetails(e);
    if (step === "info") return handleContinueInfo(e);
    return handleSubmit(e);
  }

  const stepConfig = [
    { id: "details", label: "Basics" },
    { id: "info", label: "Details" },
    { id: "password", label: "Security" },
  ];

  return (
    // Outer Container: Locks height to screen on desktop to prevent scroll, flows normally on mobile
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen w-full bg-[#fbfbfd] font-sans selection:bg-teal-500/30">
      
      {/* 
        =========================================
        LEFT SIDE: Form Area
        =========================================
        lg:overflow-y-auto allows just the form side to scroll if needed on short screens
      */}
      <div className="flex-1 lg:w-[45%] flex flex-col justify-center relative px-6 py-12 sm:px-12 lg:px-16 xl:px-24 z-10 lg:overflow-y-auto">
        
        <div className="w-full max-w-[440px] mx-auto">
          {/* Premium Logo Rendering */}
          <div className="mb-8">
            <img
              src="/assets/logos/logo_color.png"
              alt="Zyncro ERP logo"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">
              Request Access
            </h2>
            <p className="text-slate-500 mt-2.5 text-[15px] font-medium">
              Create your account. Activation requires admin approval.
            </p>
          </div>

          {/* Clean Horizontal Stepper */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-100 z-0 rounded-full"></div>
            
            {stepConfig.map((s, idx) => {
              const isActive = step === s.id;
              const isCompleted =
                (step === "info" && s.id === "details") ||
                (step === "password" && (s.id === "details" || s.id === "info"));

              return (
                <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 bg-[#fbfbfd] px-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shadow-sm transition-all duration-300 ${
                      isActive 
                        ? "bg-teal-600 text-white ring-4 ring-teal-500/20" 
                        : isCompleted 
                        ? "bg-slate-900 text-white" 
                        : "bg-white border-2 border-slate-200 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={16} strokeWidth={2.5} /> : idx + 1}
                  </div>
                  <span className={`text-[12px] font-semibold tracking-wide transition-colors ${
                    isActive ? "text-teal-700" : isCompleted ? "text-slate-700" : "text-slate-400"
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Multi-step form */}
          <form onSubmit={handleFormSubmit} className="relative">
            
            {/* STEP 1: DETAILS */}
            {step === "details" && (
              <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-500">
                
                <div>
                  <label htmlFor="name" className="block text-[13px] font-semibold text-slate-700 mb-1.5 ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                      <User size={18} strokeWidth={2.5} />
                    </div>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="John Doe"
                      className="w-full rounded-2xl pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all text-[15px] font-medium shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-[13px] font-semibold text-slate-700 mb-1.5 ml-1">
                    Email Address
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                        <Mail size={18} strokeWidth={2.5} />
                      </div>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailVerified(false);
                        }}
                        required
                        placeholder="you@organization.com"
                        className="w-full rounded-2xl pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all text-[15px] font-medium shadow-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => { if (!emailVerified) handleSendSignupOtp(); }}
                      disabled={sendingOtp || emailVerified}
                      className={`px-5 rounded-2xl font-semibold transition-all shadow-sm text-[14px] flex items-center justify-center gap-1.5 ${
                        emailVerified 
                          ? "bg-slate-100 text-teal-700 border border-slate-200/80 cursor-default" 
                          : "bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                      }`}
                    >
                      {sendingOtp && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                      {!sendingOtp && emailVerified && <CheckCircle2 size={16} strokeWidth={2.5} />}
                      {emailVerified ? "Verified" : sendingOtp ? "" : "Verify"}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-[13px] font-semibold text-slate-700 mb-1.5 ml-1">
                    Organization Role
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                      <BadgeCheck size={18} strokeWidth={2.5} />
                    </div>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      className="w-full appearance-none rounded-2xl pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 text-slate-900 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all text-[15px] font-medium shadow-sm"
                    >
                      <option value="" disabled hidden>Select your role</option>
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="franchise">Franchise</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting || !canContinueDetails}
                    className="w-full flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold py-3.5 rounded-2xl transition-all shadow-[0_8px_16px_-6px_rgba(13,148,136,0.4)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  >
                    {submitting ? "Processing..." : <>Continue <ArrowRight size={18} strokeWidth={2.5} /></>}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: INFO */}
            {step === "info" && (
              <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-500">
                
                <div>
                  <label htmlFor="dob" className="block text-[13px] font-semibold text-slate-700 mb-1.5 ml-1">
                    Date of Birth
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                      <Calendar size={18} strokeWidth={2.5} />
                    </div>
                    <input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      className="w-full rounded-2xl pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all text-[15px] font-medium shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="block text-[13px] font-semibold text-slate-700 mb-1.5 ml-1">
                    Country
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                      <Globe size={18} strokeWidth={2.5} />
                    </div>
                    <select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                      className="w-full appearance-none rounded-2xl pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 text-slate-900 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all text-[15px] font-medium shadow-sm"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-[13px] font-semibold text-slate-700 mb-1.5 ml-1">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <div className="w-24 relative shrink-0">
                      <input
                        type="text"
                        value={countryDialCode}
                        disabled
                        className="w-full text-center rounded-2xl py-3.5 bg-slate-50 border border-slate-200/80 text-slate-500 font-semibold cursor-not-allowed text-[15px]"
                      />
                    </div>
                    <div className="relative flex-1 group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                        <Phone size={16} strokeWidth={2.5} />
                      </div>
                      <input
                        id="mobile"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/[^\d+]/g, ""))}
                        required
                        placeholder="98765 43210"
                        className="w-full rounded-2xl pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all text-[15px] font-medium shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep("details")}
                    className="px-6 py-3.5 rounded-2xl font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-[15px] flex items-center justify-center shadow-sm"
                  >
                    <ArrowLeft size={18} strokeWidth={2.5} />
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !canContinueInfo}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold py-3.5 rounded-2xl transition-all shadow-[0_8px_16px_-6px_rgba(13,148,136,0.4)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  >
                    {submitting ? "Processing..." : <>Continue <ArrowRight size={18} strokeWidth={2.5} /></>}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PASSWORD */}
            {step === "password" && (
              <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-500">
                
                <div>
                  <label htmlFor="password" className="block text-[13px] font-semibold text-slate-700 mb-1.5 ml-1">
                    Secure Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                      <Lock size={18} strokeWidth={2.5} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Minimum 8 characters"
                      className="w-full rounded-2xl pl-11 pr-12 py-3.5 bg-white border border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all text-[15px] font-medium shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="passwordConfirm" className="block text-[13px] font-semibold text-slate-700 mb-1.5 ml-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-600 transition-colors">
                      <ShieldCheck size={18} strokeWidth={2.5} />
                    </div>
                    <input
                      id="passwordConfirm"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                      placeholder="Re-enter your password"
                      className="w-full rounded-2xl pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all text-[15px] font-medium shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep("info")}
                    className="px-6 py-3.5 rounded-2xl font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-[15px] flex items-center justify-center shadow-sm"
                  >
                    <ArrowLeft size={18} strokeWidth={2.5} />
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-2xl shadow-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-[15px]"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Premium Error Message */}
          {msg && (
            <div className="mt-6 p-4 rounded-2xl bg-red-50/50 border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
              <p className="text-[14px] text-red-800 font-medium leading-relaxed">{msg}</p>
            </div>
          )}

          <div className="mt-10 text-center text-[13px] text-slate-500 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
              Sign in securely
            </Link>
          </div>

        </div>
      </div>

      {/* 
        =========================================
        RIGHT SIDE: Apple-style Glassy Enterprise Panel
        =========================================
      */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-slate-950 flex-col items-center justify-center p-12">
        
        {/* Dynamic Glowing Orbs Background */}
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-teal-500/20 blur-[120px] pointer-events-none animate-pulse duration-10000" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />

        {/* Floating Glass Pane */}
        <div className="relative z-10 w-full max-w-2xl bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-12 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wide text-teal-300 uppercase mb-8">
            <Fingerprint size={14} /> Organization Network
          </div>
          
          <h1 className="text-[2.5rem] xl:text-[3rem] font-bold text-white tracking-tight leading-[1.15] mb-6">
            Join the ecosystem built for scale.
          </h1>
          <p className="text-[17px] text-slate-300 leading-relaxed mb-10 font-medium">
            Gain secure access to centralized tools, real-time analytics, and collaborative portals tailored specifically for your operational role.
          </p>

          <div className="space-y-6">
            {[
              { icon: Users, title: "Unified Architecture", text: "Seamless interaction between administrators, faculty, and student portals." },
              { icon: ShieldCheck, title: "Zero-Trust Security", text: "Identity verification and strict access controls protect sensitive data." },
              { icon: BarChart3, title: "Operational Clarity", text: "Role-specific dashboards providing actionable telemetry and insights." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-teal-400 shrink-0">
                  <Icon size={22} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-white mb-1 tracking-wide">{title}</h4>
                  <p className="text-[14px] text-slate-400 leading-relaxed font-medium">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-12 right-12 flex items-center justify-between text-[13px] text-slate-500 font-medium">
          <span>© {currentYear} Zyncro ERP</span>
          <div className="flex gap-6">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </div>

      {/* Global Toast */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-[100] bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="text-teal-400 shrink-0" size={18} strokeWidth={2.5} />
          <span className="font-semibold text-[14px]">{successMsg}</span>
        </div>
      )}

      {/* --- APPLE-STYLE OTP MODAL --- */}
      {otpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="absolute inset-0 transition-opacity" onClick={resetOtpState} />
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 max-w-[400px] w-full shadow-2xl border border-white/50 animate-in zoom-in-95 duration-200 relative">
            
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <KeyRound size={28} strokeWidth={2} />
            </div>
            <h4 className="text-[22px] font-semibold text-slate-900 text-center mb-2 tracking-tight">Verify Email</h4>
            <p className="text-[14px] text-slate-500 text-center font-medium mb-8">
              Enter the 6-digit code sent to <br/><strong className="text-slate-800">{email}</strong>
            </p>

            <form onSubmit={handleVerifySignupOtp} className="space-y-6">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-3xl tracking-[0.5em] font-semibold rounded-2xl py-4 bg-white border border-slate-200 focus:outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm"
                  placeholder="------"
                  autoFocus
                />
              </div>

              {otpError && <div className="text-[13px] font-semibold text-red-600 text-center bg-red-50 py-2.5 rounded-xl">{otpError}</div>}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetOtpState}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-[15px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingOtp}
                  className="w-full sm:flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-2xl shadow-md transition-colors disabled:opacity-70 text-[15px]"
                >
                  {verifyingOtp ? "Verifying..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global styles block for custom scrollbars (Apple-style hidden scrollbars for the left panel if it scrolls) */}
      <style dangerouslySetInnerHTML={{__html: `
        .lg\\:overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .lg\\:overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .lg\\:overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: rgba(0,0,0,0.1);
          border-radius: 20px;
        }
      `}} />
    </div>
  );
}