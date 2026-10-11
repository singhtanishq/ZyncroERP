import { useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import api from "../../lib/api/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  KeyRound,
  QrCode,
  ScanFace,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight
} from "lucide-react";

export default function MobileAttendance() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /*
   * Synchronous scan lock: the `loading` state is stale across rapid QR
   * scan frames (multiple onScan fires before a re-render), so guard the
   * mark-attendance request with a ref instead.
   */
  const scanLockRef = useRef(false);

  const sendOtp = async () => {
    try {
      setLoading(true);
      const res = await api.post("/attendance/send-otp", { email });
      setStep("otp");
      setMessage(res.data.message);
    } catch (e) {
      setMessage(
        e?.response?.data?.message || "Invalid student email"
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      await api.post("/attendance/verify-otp", { email, otp });
      setStep("scan");
      setMessage("");
    } catch (e) {
      setMessage(e?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* MARK ATTENDANCE */
  const markAttendance = async (qrToken) => {
    if (scanLockRef.current) return;
    scanLockRef.current = true;

    try {
      setLoading(true);
      await api.post("/attendance/mark", {
        email,
        qr_token: qrToken,
      });

      setMessage("Attendance marked successfully.");
      setStep("done");

      setTimeout(reset, 10000);
    } catch (e) {
      setMessage(
        e?.response?.data?.message ||
          "Attendance failed or session expired"
      );
    } finally {
      setLoading(false);
      scanLockRef.current = false;
    }
  };

  const reset = () => {
    setStep("email");
    setEmail("");
    setOtp("");
    setMessage("");
  };

  // Animation variants for smooth step transitions
  const pageVariants = {
    initial: { opacity: 0, x: 20, scale: 0.95 },
    in: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    out: { opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="w-full max-w-md relative">
        
        {/* Soft Background Glow for Premium Feel */}
        <div className="absolute inset-0 bg-indigo-400/20 blur-[60px] rounded-full z-0 pointer-events-none" />

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-white/80 p-6 sm:p-8 relative z-10 overflow-hidden min-h-[420px] flex flex-col justify-center">
          
          {/* Universal Alert Banner */}
          <AnimatePresence>
            {message && step !== "done" && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mb-6 p-4 rounded-2xl flex items-start gap-3 text-sm font-medium ${
                  message.toLowerCase().includes("invalid") || message.toLowerCase().includes("failed") || message.toLowerCase().includes("denied")
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-blue-50 text-blue-600 border border-blue-100"
                }`}
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span className="leading-snug">{message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* STEP 1 — EMAIL */}
            {step === "email" && (
              <motion.div key="email" variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col h-full justify-center">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-5 rotate-3 shadow-inner border border-indigo-100/50">
                    <ScanFace size={40} strokeWidth={1.5} />
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Check-in</h1>
                  <p className="text-slate-500 mt-2 text-sm font-medium">Enter your registered institution email to begin the attendance process.</p>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      placeholder="student@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-semibold text-slate-700 placeholder:font-normal placeholder:text-slate-400"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <button
                    disabled={!email || loading}
                    onClick={sendOtp}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold transition-all active:scale-[0.98] ${
                      !email || loading
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300"
                    }`}
                  >
                    {loading ? <><Loader2 size={20} className="animate-spin" /> Sending Code...</> : <>Continue <ArrowRight size={20} /></>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2 — OTP */}
            {step === "otp" && (
              <motion.div key="otp" variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col h-full justify-center">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-5 -rotate-3 shadow-inner border border-blue-100/50">
                    <ShieldCheck size={40} strokeWidth={1.5} />
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verify Identity</h1>
                  <p className="text-slate-500 mt-2 text-sm font-medium">We've sent a one-time passcode to <br/><span className="font-bold text-slate-700">{email}</span></p>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <KeyRound size={20} />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter OTP Code"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-4 text-center text-xl tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400 placeholder:tracking-normal"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <button
                    disabled={!otp || loading}
                    onClick={verifyOtp}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold transition-all active:scale-[0.98] ${
                      !otp || loading
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300"
                    }`}
                  >
                    {loading ? <><Loader2 size={20} className="animate-spin" /> Verifying...</> : "Verify & Proceed"}
                  </button>

                  <button 
                    onClick={() => setStep("email")}
                    className="w-full py-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Change Email
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — SCAN */}
            {step === "scan" && (
              <motion.div key="scan" variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col h-full justify-center">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-extrabold text-slate-900 flex items-center justify-center gap-2">
                    <QrCode className="text-indigo-600" /> Scan to Present
                  </h1>
                  <p className="text-slate-500 mt-2 text-sm font-medium">Point your camera at the live QR code displayed on the faculty's screen.</p>
                </div>

                <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-3xl overflow-hidden bg-slate-900 border-[6px] border-slate-100 shadow-inner">
                  {loading && (
                    <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 size={40} className="animate-spin text-white" />
                    </div>
                  )}
                  
                  {/* Scanner Component */}
                  <Scanner
                    constraints={{ video: { facingMode: "environment" } }}
                    onScan={(result) => {
                      if (result?.[0]?.rawValue && !loading) {
                        markAttendance(result[0].rawValue);
                      }
                    }}
                    onError={() => setMessage("Camera access denied or unavailable")}
                    containerStyle={{ width: '100%', height: '100%' }}
                  />

                  {/* Viewfinder Overlay */}
                  <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-white/30 rounded-xl relative">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white rounded-br-xl"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4 — DONE */}
            {step === "done" && (
              <motion.div key="done" variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col h-full justify-center items-center py-8 text-center">
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }} 
                  animate={{ scale: 1, rotate: 0 }} 
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-100"
                >
                  <CheckCircle2 size={48} strokeWidth={2.5} />
                </motion.div>
                
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Success!</h1>
                <p className="text-emerald-600 font-bold text-base mt-3 max-w-[250px] leading-snug">
                  {message}
                </p>

                <div className="mt-10 flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-xs font-bold text-slate-400 uppercase tracking-widest border border-slate-100">
                  <Loader2 size={14} className="animate-spin text-slate-400" /> Auto-closing securely...
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}