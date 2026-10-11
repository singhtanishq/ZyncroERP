import { useEffect, useState, useRef } from "react";
import { Clock, StopCircle, Minimize2, ScanLine } from "lucide-react";
import AppModal from "../../../components/common/AppModal";

export default function LiveQrModal({ session, onMinimize, onEnd }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const endedRef = useRef(false); // ✅ guard against multiple onEnd calls

  useEffect(() => {
    if (!session || !session.expires_at) return;

    endedRef.current = false;

    const expiryMs = new Date(session.expires_at).getTime();
    if (isNaN(expiryMs)) return;

    let intervalId;

    const tick = () => {
      const diff = Math.max(
        0,
        Math.floor((expiryMs - Date.now()) / 1000)
      );

      setTimeLeft(diff);

      if (diff === 0 && !endedRef.current) {
        endedRef.current = true;
        clearInterval(intervalId);
        onEnd(session.session_id); // ✅ fire once only
      }
    };

    tick(); // immediate calculation
    intervalId = setInterval(tick, 1000);

    return () => clearInterval(intervalId);
  }, [session, onEnd]);

  if (!session) return null;

  // Local QR rendering keeps session tokens off third-party services
  const qrUrl = `/api/qr?data=${encodeURIComponent(session.qr_token)}`;

  // Format time mm:ss for better readability
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AppModal
      open={Boolean(session)}
      onClose={onMinimize}
      title="Live Attendance"
      size="sm"
      footer={
        <button
          onClick={() => onEnd(session.session_id)}
          className="flex items-center justify-center gap-2 w-full bg-[rgb(var(--zx-surface))] border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-[0.98] group"
        >
          <StopCircle size={18} className="group-hover:scale-110 transition-transform" />
          End Attendance Session
        </button>
      }
    >
      <div className="flex flex-col items-center space-y-6">
        
        {/* HEADER CONTEXT & MINIMIZE ACTION */}
        <div className="w-full flex justify-between items-start -mt-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Active Broadcast</span>
            </div>
            <p className="text-xs text-[rgb(var(--zx-text-muted))] font-bold uppercase tracking-wide truncate max-w-[260px]">
              {session.course_name ? `${session.course_name} • ` : ""} 
              {session.batch_name || "Attendance Session"}
            </p>
          </div>
          
          <button 
            onClick={onMinimize}
            className="text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] hover:bg-[rgb(var(--zx-surface-hover))] p-2 rounded-xl transition-all"
            title="Minimize to background"
          >
            <Minimize2 size={18} />
          </button>
        </div>

        {/* QR CONTAINER WITH PROPER VERTICAL SPACING */}
        <div className="pt-2 pb-4 relative group w-full flex flex-col items-center">
            <div className="absolute inset-0 bg-brand-teal-500/5 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
            
            <div className="bg-white p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[rgb(var(--zx-border))] relative z-10">
                {/* Scan Indicator Animation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-teal-500/40 animate-[scan_2s_linear_infinite] rounded-full z-20"></div>
                
                <img
                    src={qrUrl}
                    alt="Attendance QR"
                    className="w-48 h-48 object-contain rounded-xl"
                />
                
                {/* Visual decorative corners */}
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-brand-teal-500 rounded-tl-lg"></div>
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-brand-teal-500 rounded-tr-lg"></div>
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-brand-teal-500 rounded-bl-lg"></div>
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-brand-teal-500 rounded-br-lg"></div>
            </div>
            
            {/* Properly spaced out below the card with relative layout */}
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-brand-teal-500 uppercase tracking-widest bg-[rgb(var(--zx-surface))] px-3.5 py-1.5 rounded-full border border-[rgb(var(--zx-border))] shadow-sm relative z-10">
                <ScanLine size={14} /> Scan with App
            </div>
        </div>

        {/* TIMER */}
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-mono text-sm font-bold border transition-colors ${
            timeLeft < 30 
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse" 
                : "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text))] border-[rgb(var(--zx-border))]"
          }`}>
            <Clock size={16} className={timeLeft < 30 ? "text-rose-500" : "text-[rgb(var(--zx-text-muted))]"} />
            <span>
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] uppercase text-[rgb(var(--zx-text-muted))] font-sans tracking-wide ml-1 font-bold">remaining</span>
          </div>
        )}

      </div>
    </AppModal>
  );
}