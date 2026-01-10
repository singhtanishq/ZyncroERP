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
  KeyRound, AlertCircle, CheckCircle2, Layers
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
    { id: "details", label: "Basic details" },
    { id: "info", label: "More information" },
    { id: "password", label: "Password" },
  ];

  const progressPercent = 
    step === "details" ? "0%" : 
    step === "info" ? "50%" : 
    "100%";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      
      {/* 1. Dynamic Animated Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[80%] sm:w-[50%] h-[50%] rounded-full bg-violet-400/30 blur-[100px] sm:blur-[120px] mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[70%] sm:w-[40%] h-[50%] rounded-full bg-cyan-300/30 blur-[100px] sm:blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[90%] sm:w-[60%] h-[50%] rounded-full bg-yellow-200/30 blur-[100px] sm:blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      {/* 2. Modern Grid Overlay Pattern */}
      <div className="absolute inset-0 z-0 bg-grid-pattern pointer-events-none opacity-60"></div>

      <style>{`
        /* Blob Animations */
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite alternate ease-in-out;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        /* Modern Abstract Grid */
        .bg-grid-pattern {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
        }

        /* Custom Glass Input Autosense Fix */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px white inset !important;
            -webkit-text-fill-color: #0f172a !important;
            border-radius: 0.75rem;
        }
      `}</style>

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden bg-white/60 backdrop-blur-2xl border border-white/40 min-h-[75vh]">
        
        {/* Left Side: Branding & Steps (Dark Panel) */}
        <div className="w-full lg:w-[35%] xl:w-[40%] flex flex-col p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-brand-blue-700 via-brand-teal-800 to-brand-teal-950 relative overflow-hidden shrink-0">
          
          {/* Ambient Lighting */}
          <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.25)_0%,transparent_60%)] pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10 mb-8 lg:mb-12">
            <img
              src="/assets/logos/logo_lite.png"
              alt="Zyncro ERP logo"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm"
            />
          </div>

          {/* Responsive Steps (Horizontal Mobile, Vertical Desktop Boxed) */}
          <div className="relative z-10 flex flex-row lg:flex-col items-center lg:items-stretch justify-between lg:justify-start lg:gap-4 mb-4 lg:mb-0">
            
            {/* Horizontal Line (Mobile Only - kept for minimal top view) */}
            <div className="absolute top-4 left-0 w-full h-1 bg-white/10 rounded-full z-0 lg:hidden"></div>
            <div className="absolute top-4 left-0 h-1 bg-brand-teal-500 rounded-full z-0 transition-all duration-500 ease-in-out lg:hidden" style={{ width: progressPercent }}></div>

            {/* Vertical Line (Desktop Only - connecting boxes) */}
            <div className="absolute top-6 left-[22px] w-0.5 h-[calc(100%-48px)] bg-white/10 rounded-full z-0 hidden lg:block"></div>
            <div className="absolute top-6 left-[22px] w-0.5 bg-brand-teal-500 rounded-full z-0 transition-all duration-500 ease-in-out hidden lg:block" style={{ height: progressPercent }}></div>

            {stepConfig.map((s, idx) => {
              const isActive = step === s.id;
              const isCompleted =
                (step === "info" && s.id === "details") ||
                (step === "password" && (s.id === "details" || s.id === "info"));

              return (
                <div 
                  key={s.id} 
                  className={`relative z-10 flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4 px-2 lg:px-4 lg:py-3 rounded-xl transition-all duration-300 ${
                    isActive && "lg:bg-white/10 lg:border lg:border-white/20 lg:shadow-lg lg:backdrop-blur-sm" 
                  } ${
                    !isActive && isCompleted && "lg:bg-white/5 lg:border lg:border-transparent"
                  } ${
                    !isActive && !isCompleted && "lg:opacity-60"
                  }`}
                >
                  <div
                    className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-all duration-300 shrink-0 ${
                      isActive 
                        ? "bg-brand-teal-500 text-white ring-4 ring-brand-teal-400/30 scale-110 lg:scale-100" 
                        : isCompleted 
                        ? "bg-emerald-400 text-white" 
                        : "bg-white/10 text-white/50 border border-white/20"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={18} /> : idx + 1}
                  </div>
                  <div className="flex flex-col text-center lg:text-left">
                    <span className={`text-[10px] sm:text-xs lg:text-sm font-semibold lg:font-bold tracking-wide uppercase mt-1 lg:mt-0 transition-colors ${
                      isActive ? "text-brand-teal-300" : isCompleted ? "text-green-300" : "text-white/60"
                    }`}>
                      {s.label}
                    </span>
                    {isActive && (
                      <span className="hidden lg:block text-xs text-indigo-200 mt-0.5">
                        {idx === 0 ? "Enter your core info" : idx === 1 ? "Provide additional details" : "Secure your account"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spacer to push copyright to bottom */}
          <div className="flex-1 hidden lg:block"></div>

          {/* Copyright Mobile (hidden on desktop, placed here if needed) */}
          <div className="hidden lg:flex w-full justify-center relative z-10 mt-auto pt-8">
            <div className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] text-indigo-200 font-semibold tracking-wide">
              © {currentYear} Zyncro ERP
            </div>
          </div>
        </div>

        {/* Right Side: Form Area */}
        <div className="w-full lg:w-[65%] xl:w-[60%] flex flex-col justify-center p-6 sm:p-10 lg:p-12 bg-white/80 shrink-0">
          
          <div className="w-full max-w-lg mx-auto">
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Create your account
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Your account will be activated after admin approval.
              </p>
            </div>

            {/* Multi-step form */}
            <form onSubmit={handleFormSubmit} className="relative">
              
              {/* STEP 1: DETAILS */}
              {step === "details" && (
                <div className="space-y-4 sm:space-y-5 animate-in slide-in-from-right-4 fade-in duration-500">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                      Full name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <User size={18} />
                      </div>
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="John Doe"
                        className="w-full rounded-xl pl-11 pr-4 py-3 bg-white/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-teal-500/50 focus:border-violet-500 outline-none transition-all shadow-sm text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                      Email address
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Mail size={18} />
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
                          placeholder="you@company.com"
                          className="w-full rounded-xl pl-11 pr-4 py-3 bg-white/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-teal-500/50 focus:border-violet-500 outline-none transition-all shadow-sm text-sm sm:text-base"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => { if (!emailVerified) handleSendSignupOtp(); }}
                        disabled={sendingOtp || emailVerified}
                        className={`sm:w-auto w-full flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-xl transition-all shadow-sm text-sm ${
                          emailVerified 
                            ? "bg-green-100 text-green-700 border border-green-200" 
                            : "bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-70"
                        }`}
                      >
                        {sendingOtp && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {!sendingOtp && emailVerified && <CheckCircle2 size={18} />}
                        {emailVerified ? "Verified" : sendingOtp ? "Sending..." : "Verify"}
                      </button>
                    </div>
                    {emailVerified && (
                      <p className="mt-1 text-xs font-medium text-green-600 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Email verified successfully.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="role" className="block text-sm font-semibold text-slate-700">
                      Role
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <BadgeCheck size={18} />
                      </div>
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        className="w-full appearance-none rounded-xl pl-11 pr-4 py-3 bg-white/50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-teal-500/50 focus:border-violet-500 outline-none transition-all shadow-sm text-sm sm:text-base"
                      >
                        <option value="" disabled hidden>Select role</option>
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="franchise">Franchise</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={submitting || !canContinueDetails}
                      className="w-full flex items-center justify-center gap-2 bg-brand-teal-500 hover:bg-yellow-300 text-slate-900 font-bold py-3.5 rounded-xl shadow-[0_4px_14px_rgba(250,204,21,0.3)] hover:shadow-[0_6px_20px_rgba(250,204,21,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {submitting ? "Processing..." : <>Continue <ArrowRight size={18} /></>}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: INFO */}
              {step === "info" && (
                <div className="space-y-4 sm:space-y-5 animate-in slide-in-from-right-4 fade-in duration-500">
                  <div className="space-y-1.5">
                    <label htmlFor="dob" className="block text-sm font-semibold text-slate-700">
                      Date of birth
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Calendar size={18} />
                      </div>
                      <input
                        id="dob"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                        className="w-full rounded-xl pl-11 pr-4 py-3 bg-white/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-teal-500/50 focus:border-violet-500 outline-none transition-all shadow-sm text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="country" className="block text-sm font-semibold text-slate-700">
                      Country
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Globe size={18} />
                      </div>
                      <select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                        className="w-full appearance-none rounded-xl pl-11 pr-4 py-3 bg-white/50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-teal-500/50 focus:border-violet-500 outline-none transition-all shadow-sm text-sm sm:text-base"
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

                  <div className="space-y-1.5">
                    <label htmlFor="mobile" className="block text-sm font-semibold text-slate-700">
                      Mobile number
                    </label>
                    <div className="flex gap-2">
                      <div className="w-20 sm:w-24 relative shrink-0">
                        <input
                          type="text"
                          value={countryDialCode}
                          disabled
                          className="w-full text-center rounded-xl px-2 py-3 bg-slate-100 border border-slate-200 text-slate-600 font-medium cursor-not-allowed text-sm sm:text-base"
                        />
                      </div>
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Phone size={16} />
                        </div>
                        <input
                          id="mobile"
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/[^\d+]/g, ""))}
                          required
                          placeholder="98765 43210"
                          className="w-full rounded-xl pl-10 pr-4 py-3 bg-white/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-teal-500/50 focus:border-violet-500 outline-none transition-all shadow-sm text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="px-6 py-3.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={18} /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !canContinueInfo}
                      className="flex-1 flex items-center justify-center gap-2 bg-brand-teal-500 hover:bg-yellow-300 text-slate-900 font-bold py-3.5 rounded-xl shadow-[0_4px_14px_rgba(250,204,21,0.3)] hover:shadow-[0_6px_20px_rgba(250,204,21,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                    >
                      {submitting ? "Processing..." : <>Continue <ArrowRight size={18} /></>}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PASSWORD */}
              {step === "password" && (
                <div className="space-y-4 sm:space-y-5 animate-in slide-in-from-right-4 fade-in duration-500">
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Lock size={18} />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Create a strong password"
                        className="w-full rounded-xl pl-11 pr-12 py-3 bg-white/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-teal-500/50 focus:border-violet-500 outline-none transition-all shadow-sm text-sm sm:text-base"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="passwordConfirm" className="block text-sm font-semibold text-slate-700">
                      Confirm password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <ShieldCheck size={18} />
                      </div>
                      <input
                        id="passwordConfirm"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                        placeholder="Re-enter your password"
                        className="w-full rounded-xl pl-11 pr-4 py-3 bg-white/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-teal-500/50 focus:border-violet-500 outline-none transition-all shadow-sm text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setStep("info")}
                      className="px-6 py-3.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={18} /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Error Message Display */}
            {msg && (
              <div className="mt-5 p-4 rounded-xl bg-red-50/80 border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700 font-medium">{msg}</p>
              </div>
            )}

            <div className="mt-8 text-center text-sm font-medium text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-brand-teal-600 font-bold hover:text-brand-teal-700 hover:underline transition-all">
                Login here
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Global Toast for Success Messages */}
      {successMsg && (
        <div className="fixed top-4 sm:top-8 right-4 sm:right-8 z-[100] bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-8 max-w-[90vw] sm:max-w-md">
          <CheckCircle2 className="text-green-400 shrink-0" size={20} />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* --- OTP MODAL --- */}
      {otpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={resetOtpState} />
          <div className="relative bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-teal-500/10 text-brand-teal-600 rounded-2xl flex items-center justify-center mb-5 sm:mb-6">
              <KeyRound size={24} className="sm:w-7 sm:h-7" />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Verify Email</h4>
            <p className="text-sm text-slate-500 mb-6 sm:mb-8 leading-relaxed">
              We've sent a 6-digit verification code to <strong className="text-slate-800 break-all block">{email}</strong>.
            </p>

            <form onSubmit={handleVerifySignupOtp} className="space-y-5 sm:space-y-6">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-2xl sm:text-3xl tracking-[0.3em] sm:tracking-[0.5em] font-bold rounded-xl py-3 sm:py-4 bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-teal-500 focus:border-violet-500 outline-none transition-all"
                  placeholder="------"
                  autoFocus
                />
              </div>

              {otpError && <div className="text-sm font-medium text-red-500 text-center">{otpError}</div>}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetOtpState}
                  className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingOtp}
                  className="w-full sm:flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 sm:py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-70 text-sm sm:text-base"
                >
                  {verifyingOtp ? "Verifying..." : "Verify Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}