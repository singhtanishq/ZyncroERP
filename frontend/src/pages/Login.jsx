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
  BarChart3, Users
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
      
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[80%] sm:w-[50%] h-[50%] rounded-full bg-violet-400/30 blur-[100px] sm:blur-[120px] mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[70%] sm:w-[40%] h-[50%] rounded-full bg-cyan-300/30 blur-[100px] sm:blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[90%] sm:w-[60%] h-[50%] rounded-full bg-yellow-200/30 blur-[100px] sm:blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

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

        /* Abstract Floating Animations for Right Panel */
        @keyframes float {
          0% { transform: translateY(0px) rotate(var(--rotation, 0deg)); }
          50% { transform: translateY(-15px) rotate(var(--rotation, 0deg)); }
          100% { transform: translateY(0px) rotate(var(--rotation, 0deg)); }
        }
        .animate-float-slow {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float 8s ease-in-out infinite;
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
        
        {/* Left Side: Form Area */}
        <div className="w-full lg:w-[45%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-white/80 shrink-0">
          <div>
            <div className="mb-8 sm:mb-12">
              <img
                src="/assets/logos/logo_color.png"
                alt="Zyncro ERP logo"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-sm"
              />
            </div>

            <div className="space-y-2 mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {isPending
                  ? `Hi, ${pendingUser?.name ?? ""}`
                  : user
                  ? `Welcome, ${user.name}`
                  : "Welcome back"}
              </h2>
              {!user && !isPending && (
                <p className="text-sm sm:text-base text-slate-500 font-medium">
                  Enter your credentials to access your account
                </p>
              )}
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Checking session...</p>
              </div>
            ) : !user && !isPending ? (
              // --- NORMAL LOGIN FORM ---
              <form id="login-form" onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@company.com"
                      className="w-full rounded-xl pl-11 pr-4 py-3 sm:py-3.5 bg-white/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-teal-500/50 focus:border-violet-500 outline-none transition-all shadow-sm text-sm sm:text-base"
                    />
                  </div>
                </div>

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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="w-full rounded-xl pl-11 pr-12 py-3 sm:py-3.5 bg-white/50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-teal-500/50 focus:border-violet-500 outline-none transition-all shadow-sm text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={handleShowPasswordToggle}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer group">
                    
                  </label>

                  <button
                    type="button"
                    onClick={openForgotModal}
                    className="text-sm font-semibold text-brand-teal-600 hover:text-brand-teal-700 transition-colors self-start sm:self-auto"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoginDisabled}
                  className="w-full flex items-center justify-center gap-2 bg-brand-teal-500 hover:bg-brand-teal-600 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_rgba(21,150,144,0.35)] hover:shadow-[0_6px_20px_rgba(21,150,144,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-brand-teal-500 disabled:shadow-none disabled:transform-none"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  ) : (
                    <>Sign In <ArrowRight size={18} /></>
                  )}
                </button>
              </form>
            ) : isPending ? (
              // --- 2FA PENDING STATE ---
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 bg-violet-50/50 rounded-2xl border border-violet-100 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="text-brand-teal-600 shrink-0" size={24} />
                    <h3 className="text-base sm:text-lg font-bold text-slate-800">Two-Step Verification</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Protecting your account is our priority. Please authenticate using your email address to continue.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleVerifyEmail}
                    disabled={verificationSent || sendingOtp}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {sendingOtp ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : verificationSent ? (
                      <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                    ) : (
                      <Mail size={18} className="shrink-0" />
                    )}
                    {sendingOtp ? "Sending..." : verificationSent ? "Code Sent" : "Send Verification Code"}
                  </button>

                  <button
                    onClick={handleBackFromPending}
                    className="w-full sm:w-auto px-6 py-3 font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>

                {verificationSent && (
                  <p className="text-sm text-slate-500 mt-4 bg-white/50 p-3 rounded-xl border border-slate-100 break-all">
                    A code was sent to <strong className="text-slate-800 break-normal">{pendingUser?.email}</strong>. Please check your inbox.
                  </p>
                )}
              </div>
            ) : (
              // --- ALREADY LOGGED IN ---
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100 text-center space-y-3">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">You're signed in!</h3>
                  <p className="text-slate-600 text-sm">
                    Logged in as <strong className="text-slate-900">{user?.name}</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
                  <button
                    onClick={() => navigate("/dashboard-role")}
                    className="w-full sm:w-auto flex-1 bg-brand-teal-500 hover:bg-brand-teal-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-brand-teal-600/20 hover:-translate-y-0.5 transition-all"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full sm:w-auto p-3.5 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-red-600 rounded-xl transition-colors flex items-center justify-center gap-2"
                    title="Logout"
                  >
                    <LogOut size={20} /> <span className="sm:hidden font-semibold">Logout</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Message Display */}
            {msg && !submitting && (
              <div className="mt-6 p-4 rounded-xl bg-red-50/80 border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700 font-medium">{msg}</p>
              </div>
            )}
          </div>

          {!user && !isPending && (
            <div className="mt-10 sm:mt-12 text-center text-sm font-medium text-slate-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-brand-teal-600 font-bold hover:text-brand-teal-700 hover:underline transition-all">
                Register here
              </Link>
            </div>
          )}
        </div>

        {/* Right Side: Enterprise brand panel */}
        <div className="hidden lg:flex flex-1 relative flex-col justify-between bg-gradient-to-br from-brand-blue-800 via-brand-blue-700 to-brand-teal-800 overflow-hidden min-h-[400px] p-12">

          {/* Subtle brand texture */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-grid-pattern" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-teal-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-brand-blue-400/20 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <img
              src="/assets/logos/logo_lite.png"
              alt="Zyncro ERP"
              className="h-14 w-auto object-contain"
            />
            <p className="mt-6 text-3xl font-bold text-white tracking-tight leading-snug">
              One platform for your
              <br />
              entire organization.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/70 max-w-sm">
              Students, faculty, franchises and teams — admissions, learning,
              exams, finance and communication, managed in one secure ERP.
            </p>
          </div>

          <div className="relative z-10 space-y-5">
            {[
              { icon: Users, title: "Every role, one system", text: "Dedicated dashboards for admins, faculty, students, franchises and employees." },
              { icon: ShieldCheck, title: "Secure by design", text: "Two-step authentication with one-time codes and role-scoped access." },
              { icon: BarChart3, title: "Decisions from real data", text: "Live revenue, enrollment and attendance reporting." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm shrink-0">
                  <Icon size={18} className="text-brand-teal-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="text-xs text-white/60 mt-0.5 leading-relaxed max-w-xs">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[11px] text-white/50 font-medium">
              © {new Date().getFullYear()} Zyncro ERP
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold tracking-widest text-white/80 uppercase">
              <ShieldCheck size={12} />
              Secure System
            </span>
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
      {otpOpen && isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setOtpOpen(false)} />
          <div className="relative bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-teal-500/10 text-brand-teal-600 rounded-2xl flex items-center justify-center mb-5 sm:mb-6">
              <KeyRound size={24} className="sm:w-7 sm:h-7" />
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Enter OTP</h4>
            <p className="text-sm text-slate-500 mb-6 sm:mb-8 leading-relaxed">
              We've sent a 6-digit verification code to
              <strong className="text-slate-800 break-all block">
                {pendingUser?.email ?? email}
              </strong>
            </p>

            <form onSubmit={handleSubmitOtp} className="space-y-5 sm:space-y-6">
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

              <button
                type="submit"
                disabled={verifyingOtp}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-70 text-sm sm:text-base"
              >
                {verifyingOtp ? "Verifying Code..." : "Verify & Sign In"}
              </button>

              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Didn't receive a code?{" "}
                  <span
                    onClick={() => { if (resendCountdown === 0) handleVerifyEmail(); }}
                    className={`font-semibold ${
                      resendCountdown > 0
                        ? "text-slate-400 cursor-not-allowed"
                        : "text-brand-teal-600 hover:text-brand-teal-700 cursor-pointer"
                    }`}
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend"}
                  </span>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FORGOT PASSWORD MODAL --- */}
      {forgotOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeForgotModal} />
          
          <div className="relative bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex flex-col gap-1">
                {forgotStep !== "email" && (
                  <button type="button" onClick={() => setForgotStep(forgotStep === "otp" ? "security" : forgotStep === "reset" ? "otp" : "email")} className="text-slate-400 hover:text-slate-800 transition-colors -ml-2 p-1 mb-1 sm:mb-2">
                    <ChevronLeft size={20} />
                  </button>
                )}
                <h4 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {forgotStep === "email" ? "Reset Password" : 
                   forgotStep === "security" ? "Verify Identity" : 
                   forgotStep === "otp" ? "Enter Code" : "New Password"}
                </h4>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center shrink-0">
                <Lock size={18} className="sm:w-5 sm:h-5" />
              </div>
            </div>

            {/* STEP 1: EMAIL */}
            {forgotStep === "email" && (
              <form onSubmit={handleForgotStart} className="space-y-4 sm:space-y-5">
                <p className="text-sm text-slate-500 mb-2">
                  Enter your registered email address. We'll ask a few security questions to verify it's you.
                </p>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-teal-500 outline-none transition-all text-sm sm:text-base"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>

                {forgotError && <p className="text-sm text-red-500 font-medium">{forgotError}</p>}

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                  <button type="button" onClick={closeForgotModal} className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm sm:text-base">
                    Cancel
                  </button>
                  <button type="submit" disabled={forgotLoading} className="w-full sm:flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all disabled:opacity-70 text-sm sm:text-base">
                    {forgotLoading ? "Checking..." : "Continue"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: SECURITY */}
            {forgotStep === "security" && (
              <form onSubmit={handleForgotSecurity} className="space-y-4">
                <p className="text-sm text-slate-500 mb-2">
                  Please answer these security questions to confirm your identity.
                </p>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="date"
                      value={forgotDob}
                      onChange={(e) => setForgotDob(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-teal-500 outline-none transition-all text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      value={forgotCountry}
                      onChange={(e) => setForgotCountry(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-teal-500 outline-none transition-all appearance-none text-sm sm:text-base"
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
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile Number</label>
                  <div className="flex gap-2">
                    <div className="w-20 sm:w-24 relative shrink-0">
                      <input
                        type="text"
                        value={forgotDialCode}
                        readOnly
                        className="w-full py-3 text-center rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-medium cursor-not-allowed text-sm sm:text-base"
                      />
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="tel"
                        value={forgotMobile}
                        onChange={(e) => setForgotMobile(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-teal-500 outline-none transition-all text-sm sm:text-base"
                        placeholder="98765 43210"
                        required
                      />
                    </div>
                  </div>
                </div>

                {forgotError && <p className="text-sm text-red-500 font-medium">{forgotError}</p>}

                <div className="pt-2 sm:pt-4">
                  <button type="submit" disabled={forgotLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all disabled:opacity-70 text-sm sm:text-base">
                    {forgotLoading ? "Verifying..." : "Send Verification Code"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: OTP */}
            {forgotStep === "otp" && (
              <form onSubmit={handleForgotVerify} className="space-y-5 sm:space-y-6">
                <p className="text-sm text-slate-500">
                  We've sent a 6-digit code to <strong className="text-slate-800 break-all">{forgotEmail}</strong>.
                </p>
                
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-2xl sm:text-3xl tracking-[0.3em] sm:tracking-[0.5em] font-bold rounded-xl py-3 sm:py-4 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-teal-500 outline-none transition-all"
                  placeholder="------"
                  required
                />

                {forgotError && <p className="text-sm text-red-500 font-medium text-center">{forgotError}</p>}

                <button type="submit" disabled={forgotLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all disabled:opacity-70 text-sm sm:text-base">
                  {forgotLoading ? "Verifying..." : "Verify Code"}
                </button>
              </form>
            )}

            {/* STEP 4: RESET */}
            {forgotStep === "reset" && (
              <form onSubmit={handleForgotReset} className="space-y-4 sm:space-y-5">
                <p className="text-sm text-slate-500 mb-4">
                  Create a strong, new password for your account.
                </p>
                
                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-teal-500 outline-none transition-all text-sm sm:text-base"
                      placeholder="New password"
                      required
                    />
                  </div>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-teal-500 outline-none transition-all text-sm sm:text-base"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                {forgotError && <p className="text-sm text-red-500 font-medium">{forgotError}</p>}

                <button type="submit" disabled={forgotLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all disabled:opacity-70 mt-2 text-sm sm:text-base">
                  {forgotLoading ? "Saving..." : "Save New Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}