import React, { useState, useEffect, useRef } from "react";
import useAuth from "../lib/auth/useAuth";
import {
  sendOtp,
  verifyOtp,
  cancelPendingLogin,
  forgotPasswordStart,
  forgotPasswordSecurity,
  forgotPasswordVerify,
  resetPassword,
} from "../lib/api/apiClient";
import { Link, useNavigate } from "react-router-dom";
import { COUNTRIES } from "../constants/countries";
import { 
  Mail, Lock, Eye, EyeOff, ShieldCheck, 
  ArrowRight, Calendar, Globe, Phone, KeyRound, 
  AlertCircle, CheckCircle2, ChevronLeft, LogOut,
  BarChart3, Users, LayoutDashboard, Fingerprint
} from "lucide-react";

export default function LoginPage() {
  const { user, login, loginComplete, logout, loading } = useAuth();

  // login form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP + pending login state
  const [verificationSent, setVerificationSent] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Forgot password flow
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSecurityAttempts, setForgotSecurityAttempts] = useState(0);
  const [forgotOtpAttempts, setForgotOtpAttempts] = useState(0);
  const [forgotDob, setForgotDob] = useState("");
  const [forgotCountry, setForgotCountry] = useState("India");
  const [forgotMobile, setForgotMobile] = useState("");

  const selectedForgotCountry =
    COUNTRIES.find((c) => c.name === forgotCountry) ||
    COUNTRIES.find((c) => c.name === "India") ||
    COUNTRIES[0];
  const forgotDialCode = selectedForgotCountry?.dialCode || "";

  const isPending = !!pendingUser && !user;
  const navigate = useNavigate();
  const resendTimerRef = useRef(null);

  const isLoginDisabled = !email.trim() || !password.trim() || submitting;

  useEffect(() => {
    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
    };
  }, []);

  function openForgotModal() {
    setForgotOpen(true);
    setForgotStep("email");
    setForgotEmail("");
    setForgotDob("");
    setForgotCountry("India");
    setForgotMobile("");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setForgotError("");
    setForgotLoading(false);
    setForgotSecurityAttempts(0);
    setForgotOtpAttempts(0);
  }

  function closeForgotModal() {
    setForgotOpen(false);
    setForgotStep("email");
    setForgotEmail("");
    setForgotDob("");
    setForgotCountry("India");
    setForgotMobile("");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setForgotError("");
    setForgotLoading(false);
    setForgotSecurityAttempts(0);
    setForgotOtpAttempts(0);
  }

  async function handleForgotStart(e) {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      const emailValue = forgotEmail.trim();
      if (!emailValue) {
        setForgotError("Please enter your email address.");
        setForgotLoading(false);
        return;
      }

      await forgotPasswordStart(emailValue);
      setForgotStep("security");
    } catch (err) {
      console.error("forgot start error:", err);
      let msgText =
        err?.response?.data?.message ??
        err?.message ??
        "Unable to start password reset.";

      if (err?.response?.status === 422 || err?.response?.status === 404) {
        msgText = "This email is not registered. Please sign up first.";
      }
      setForgotError(msgText);
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleForgotSecurity(e) {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      const dobValue = forgotDob.trim();
      const countryValue = forgotCountry.trim();
      const mobileValue = forgotMobile.trim();

      if (!dobValue || !countryValue || !mobileValue) {
        setForgotError("Please fill your date of birth, country, and mobile number.");
        setForgotLoading(false);
        return;
      }

      await forgotPasswordSecurity({
        dob: dobValue,
        country: countryValue,
        mobile: mobileValue,
      });

      setForgotStep("otp");
    } catch (err) {
      console.error("forgot security error:", err);
      setForgotSecurityAttempts((prev) => {
        const next = prev + 1;
        const attemptsLeft = Math.max(0, 3 - next);

        if (attemptsLeft > 0) {
          setForgotError(`One or more security details are incorrect. ${attemptsLeft} attempt(s) left.`);
        } else {
          closeForgotModal();
          setMsg("Maximum attempts reached for password reset. Please try again.");
        }
        return next;
      });
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleForgotVerify(e) {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      const code = forgotOtp.trim();
      if (!code || code.length !== 6) {
        setForgotError("Please enter the 6-digit code.");
        setForgotLoading(false);
        return;
      }

      await forgotPasswordVerify(code);
      setForgotStep("reset");
    } catch (err) {
      console.error("forgot verify error:", err);
      setForgotOtpAttempts((prev) => {
        const next = prev + 1;
        const attemptsLeft = Math.max(0, 3 - next);

        if (attemptsLeft > 0) {
          setForgotError(`Incorrect or expired code. ${attemptsLeft} attempt(s) left.`);
        } else {
          closeForgotModal();
          setMsg("Maximum OTP attempts reached for password reset. Please try again.");
        }
        return next;
      });
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleForgotReset(e) {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);

    try {
      if (!forgotNewPassword || !forgotConfirmPassword) {
        setForgotError("Please enter and confirm your new password.");
        setForgotLoading(false);
        return;
      }

      if (forgotNewPassword !== forgotConfirmPassword) {
        setForgotError("Passwords do not match.");
        setForgotLoading(false);
        return;
      }

      await resetPassword(forgotNewPassword, forgotConfirmPassword);

      closeForgotModal();
      setSuccessMsg("Password reset successful. Please login with your new password.");
      setTimeout(() => setSuccessMsg(""), 2500);
    } catch (err) {
      console.error("forgot reset error:", err);
      const msgText =
        err?.response?.data?.message ?? err?.message ?? "Unable to reset password.";
      setForgotError(msgText);
    } finally {
      setForgotLoading(false);
    }
  }

  function handleShowPasswordToggle() {
    const newValue = !showPassword;
    setShowPassword(newValue);
    if (newValue) {
      setTimeout(() => setShowPassword(false), 2000);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("");
    setSuccessMsg("");
    setSubmitting(true);
    setOtpError("");
    setOtpCode("");
    setVerificationSent(false);
    setPendingUser(null);
    setOtpAttempts(0);

    try {
      const pending = await login(email, password);
      if (pending) {
        setPendingUser(pending);
        setSuccessMsg("Credentials verified. Please verify your email.");
        setTimeout(() => setSuccessMsg(""), 1800);
      } else {
        setMsg("Unexpected error: no user returned.");
      }
    } catch (err) {
      console.error("login error:", err);
      const serverMessage =
        err?.message ??
        err?.response?.data?.errors?.email?.[0] ??
        err?.response?.data?.message ??
        "Invalid credentials";
      setMsg(serverMessage);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    setMsg("");
    try {
      await logout();
      setMsg("");
      setPendingUser(null);
      setVerificationSent(false);
      setOtpOpen(false);
      setOtpCode("");
      setOtpError("");
      setOtpAttempts(0);
    } catch (err) {
      console.error("logout error:", err);
      setMsg("Logout failed — check console");
    }
  }

  async function handleVerifyEmail() {
    setMsg("");
    setOtpError("");
    setSendingOtp(true);

    if (!pendingUser) {
      setMsg("No login in progress. Please enter your credentials again.");
      setSendingOtp(false);
      return;
    }

    try {
      await sendOtp();
      setVerificationSent(true);
      setOtpOpen(true);
      setSuccessMsg("Verification email sent — check your inbox");
      setTimeout(() => setSuccessMsg(""), 2200);

      setResendCountdown(60);
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }

      resendTimerRef.current = setInterval(() => {
        setResendCountdown((s) => {
          if (s <= 1) {
            clearInterval(resendTimerRef.current);
            resendTimerRef.current = null;
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("verify email error:", err);
      const serverMessage =
        err?.response?.data?.message ?? "Failed to send verification email — try again";
      setMsg(serverMessage);
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleSubmitOtp(e) {
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

      await verifyOtp(code);
      await loginComplete();
      navigate("/dashboard-role", { replace: true });

      setSuccessMsg("Verified — you are now signed in");
      setTimeout(() => setSuccessMsg(""), 2500);

      setOtpOpen(false);
      setOtpCode("");
      setVerificationSent(false);
      setPendingUser(null);
      setOtpAttempts(0);
    } catch (err) {
      console.error("verify otp error:", err);
      setOtpAttempts((prev) => {
        const next = prev + 1;
        const attemptsLeft = Math.max(0, 3 - next);

        if (attemptsLeft > 0) {
          setOtpError(`Incorrect or expired code. ${attemptsLeft} attempt(s) left.`);
        } else {
          cancelPendingLogin().catch(() => {});
          setPendingUser(null);
          setOtpOpen(false);
          setVerificationSent(false);
          setOtpCode("");
          setMsg("Maximum OTP attempts reached. Please login again.");
        }
        return next;
      });
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleBackFromPending() {
    try {
      await cancelPendingLogin();
    } catch (_) {}
    setPendingUser(null);
    setVerificationSent(false);
    setOtpOpen(false);
    setOtpCode("");
    setOtpError("");
    setOtpAttempts(0);
    setMsg("");
  }

  return (
    <div className="min-h-screen flex w-full bg-white font-sans overflow-hidden">
      
      {/* 
        =========================================
        LEFT SIDE: Form Area
        =========================================
      */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center relative px-6 sm:px-12 lg:px-20 xl:px-28 z-10 bg-white shadow-[10px_0_30px_rgba(0,0,0,0.03)]">
        
        <div className="w-full max-w-md mx-auto">
          {/* Logo Section */}
          <div className="mb-10">
            <img
              src="/assets/logos/logo_color.png"
              alt="Zyncro ERP logo"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isPending
                ? `Verify your identity`
                : user
                ? `Welcome back, ${user.name}`
                : "Sign in to your account"}
            </h2>
            {!user && !isPending && (
              <p className="text-slate-500 mt-2 text-[15px]">
                Enter your credentials to access the secure portal.
              </p>
            )}
            {isPending && (
              <p className="text-slate-500 mt-2 text-[15px]">
                Hi {pendingUser?.name ?? ""}, we need to verify it's you.
              </p>
            )}
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-2 border-slate-100 border-t-teal-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium text-sm">Authenticating session...</p>
            </div>
          ) : !user && !isPending ? (
            
            // --- NORMAL LOGIN FORM ---
            <form id="login-form" onSubmit={handleLogin} className="space-y-5">
              
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@organization.com"
                    className="w-full rounded-lg pl-10 pr-4 py-3 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-all text-[15px] shadow-sm bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full rounded-lg pl-10 pr-12 py-3 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-all text-[15px] shadow-sm bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleShowPasswordToggle}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  {/* Future Remember Me checkbox could go here */}
                </label>
                <button
                  type="button"
                  onClick={openForgotModal}
                  className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoginDisabled}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition-colors shadow-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          ) : isPending ? (
            
            // --- 2FA PENDING STATE ---
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="text-teal-600 shrink-0" size={20} />
                  <h3 className="text-[15px] font-semibold text-slate-900">Security Check Required</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  To keep your organization's data safe, we require two-step authentication. Send a secure code to your email to continue.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleVerifyEmail}
                  disabled={verificationSent || sendingOtp}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sendingOtp ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : verificationSent ? (
                    <CheckCircle2 size={18} className="text-white shrink-0" />
                  ) : (
                    <Mail size={18} className="shrink-0" />
                  )}
                  {sendingOtp ? "Sending..." : verificationSent ? "Code Sent" : "Send Verification Code"}
                </button>

                <button
                  onClick={handleBackFromPending}
                  className="w-full px-6 py-3 font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel & Go Back
                </button>
              </div>

              {verificationSent && (
                <p className="text-sm text-slate-500 mt-4 text-center">
                  Code sent to <strong className="text-slate-800">{pendingUser?.email}</strong>.
                </p>
              )}
            </div>
          ) : (
            
            // --- ALREADY LOGGED IN ---
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="p-6 bg-teal-50/50 rounded-xl border border-teal-100 text-center space-y-3">
                <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Authentication Active</h3>
                <p className="text-slate-600 text-sm">
                  You are currently logged in as <strong className="text-slate-900 block mt-1">{user?.name}</strong>
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={() => navigate("/dashboard-role")}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition-colors shadow-sm"
                >
                  <LayoutDashboard size={18} /> Continue to Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full p-3 font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-transparent rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {msg && !submitting && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-800 font-medium leading-relaxed">{msg}</p>
            </div>
          )}

          {!user && !isPending && (
            <div className="mt-12 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline transition-all">
                Request Access
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 
        =========================================
        RIGHT SIDE: Enterprise Brand Panel
        =========================================
      */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] bg-slate-900 relative overflow-hidden">
        
        {/* Subtle, premium abstract background geometry */}
        <div className="absolute inset-0 z-0 opacity-20">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Soft elegant glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-600/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-center flex-grow p-16 xl:p-24 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-semibold tracking-wide text-teal-300 uppercase mb-8 w-max">
            <Fingerprint size={14} /> Enterprise Grade Security
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-6">
            Centralized intelligence for modern institutions.
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed mb-12 max-w-xl">
            Streamline operations, unify data, and empower your teams. Zyncro ERP provides role-scoped access and real-time analytics in one secure ecosystem.
          </p>

          <div className="space-y-6">
            {[
              { icon: Users, title: "Role-Based Access Control", text: "Dedicated, secure environments for administrators, faculty, and students." },
              { icon: ShieldCheck, title: "Bank-Grade Encryption", text: "End-to-end security protocols with mandatory two-factor authentication." },
              { icon: BarChart3, title: "Real-Time Telemetry", text: "Live reporting on enrollment, performance, and financial metrics." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-teal-400 shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-white mb-1">{title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 p-10 xl:px-24 flex items-center justify-between text-sm text-slate-500">
          <span>© {new Date().getFullYear()} Zyncro ERP. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Global Toast */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-[100] bg-slate-900 text-white px-5 py-3.5 rounded-lg shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="text-teal-400 shrink-0" size={18} />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* --- OTP MODAL --- */}
      {otpOpen && isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 relative">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6">
              <KeyRound size={24} />
            </div>
            <h4 className="text-2xl font-bold text-slate-900 mb-2">Verify it's you</h4>
            <p className="text-[15px] text-slate-500 mb-8">
              Enter the 6-digit verification code sent to <strong className="text-slate-800">{pendingUser?.email ?? email}</strong>
            </p>

            <form onSubmit={handleSubmitOtp} className="space-y-6">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-3xl tracking-[0.5em] font-bold rounded-lg py-4 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-all shadow-sm bg-white"
                  placeholder="------"
                  autoFocus
                />
              </div>

              {otpError && <div className="text-sm font-medium text-red-600 text-center bg-red-50 py-2 rounded-md">{otpError}</div>}

              <button
                type="submit"
                disabled={verifyingOtp}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg shadow-sm transition-colors disabled:opacity-70 text-[15px]"
              >
                {verifyingOtp ? "Verifying..." : "Verify & Sign In"}
              </button>

              <div className="text-center pt-2">
                <p className="text-sm text-slate-500">
                  Didn't receive a code?{" "}
                  <button
                    type="button"
                    onClick={() => { if (resendCountdown === 0) handleVerifyEmail(); }}
                    disabled={resendCountdown > 0}
                    className={`font-semibold transition-colors ${
                      resendCountdown > 0
                        ? "text-slate-400 cursor-not-allowed"
                        : "text-teal-600 hover:text-teal-700"
                    }`}
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend"}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FORGOT PASSWORD MODAL --- */}
      {forgotOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto relative">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                {forgotStep !== "email" && (
                  <button 
                    type="button" 
                    onClick={() => setForgotStep(forgotStep === "otp" ? "security" : forgotStep === "reset" ? "otp" : "email")} 
                    className="flex items-center text-sm text-slate-500 hover:text-slate-900 mb-3 transition-colors"
                  >
                    <ChevronLeft size={16} className="mr-1" /> Back
                  </button>
                )}
                <h4 className="text-2xl font-bold text-slate-900">
                  {forgotStep === "email" ? "Reset Password" : 
                   forgotStep === "security" ? "Verify Identity" : 
                   forgotStep === "otp" ? "Enter Code" : "New Password"}
                </h4>
              </div>
              <button onClick={closeForgotModal} className="text-slate-400 hover:text-slate-600 p-1">
                ✕
              </button>
            </div>

            {/* STEP 1: EMAIL */}
            {forgotStep === "email" && (
              <form onSubmit={handleForgotStart} className="space-y-5">
                <p className="text-[15px] text-slate-500 mb-2">
                  Enter the email address associated with your account.
                </p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-all text-[15px] shadow-sm bg-white"
                      placeholder="name@organization.com"
                      required
                    />
                  </div>
                </div>

                {forgotError && <p className="text-sm text-red-600 font-medium bg-red-50 p-2 rounded-md">{forgotError}</p>}

                <div className="pt-2">
                  <button type="submit" disabled={forgotLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition-colors shadow-sm disabled:opacity-70 text-[15px]">
                    {forgotLoading ? "Locating account..." : "Continue"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: SECURITY */}
            {forgotStep === "security" && (
              <form onSubmit={handleForgotSecurity} className="space-y-4">
                <p className="text-[15px] text-slate-500 mb-2">
                  Answer the following questions to confirm it's you.
                </p>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="date"
                      value={forgotDob}
                      onChange={(e) => setForgotDob(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-all text-[15px] shadow-sm bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      value={forgotCountry}
                      onChange={(e) => setForgotCountry(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-all appearance-none text-[15px] shadow-sm bg-white"
                      required
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number</label>
                  <div className="flex gap-2">
                    <div className="w-24 relative shrink-0">
                      <input
                        type="text"
                        value={forgotDialCode}
                        readOnly
                        className="w-full py-3 text-center rounded-lg bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed text-[15px]"
                      />
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="tel"
                        value={forgotMobile}
                        onChange={(e) => setForgotMobile(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-all text-[15px] shadow-sm bg-white"
                        placeholder="98765 43210"
                        required
                      />
                    </div>
                  </div>
                </div>

                {forgotError && <p className="text-sm text-red-600 font-medium bg-red-50 p-2 rounded-md">{forgotError}</p>}

                <div className="pt-4">
                  <button type="submit" disabled={forgotLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition-colors shadow-sm disabled:opacity-70 text-[15px]">
                    {forgotLoading ? "Verifying..." : "Send Verification Code"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: OTP */}
            {forgotStep === "otp" && (
              <form onSubmit={handleForgotVerify} className="space-y-6">
                <p className="text-[15px] text-slate-500">
                  We've sent a secure code to <strong className="text-slate-800">{forgotEmail}</strong>.
                </p>
                
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-3xl tracking-[0.5em] font-bold rounded-lg py-4 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-all shadow-sm bg-white"
                  placeholder="------"
                  required
                  autoFocus
                />

                {forgotError && <p className="text-sm text-red-600 font-medium text-center bg-red-50 py-2 rounded-md">{forgotError}</p>}

                <button type="submit" disabled={forgotLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition-colors shadow-sm disabled:opacity-70 text-[15px]">
                  {forgotLoading ? "Verifying..." : "Verify Code"}
                </button>
              </form>
            )}

            {/* STEP 4: RESET */}
            {forgotStep === "reset" && (
              <form onSubmit={handleForgotReset} className="space-y-5">
                <p className="text-[15px] text-slate-500 mb-2">
                  Create a strong, new password for your account.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="password"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-all text-[15px] shadow-sm bg-white"
                        placeholder="Must be at least 8 characters"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-all text-[15px] shadow-sm bg-white"
                        placeholder="Re-enter password"
                        required
                      />
                    </div>
                  </div>
                </div>

                {forgotError && <p className="text-sm text-red-600 font-medium bg-red-50 p-2 rounded-md">{forgotError}</p>}

                <div className="pt-2">
                  <button type="submit" disabled={forgotLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition-colors shadow-sm disabled:opacity-70 text-[15px]">
                    {forgotLoading ? "Saving..." : "Save New Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}