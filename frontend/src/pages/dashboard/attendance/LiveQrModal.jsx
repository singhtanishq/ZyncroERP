import { useEffect, useState, useRef } from "react";
import { Clock, StopCircle, Minimize2, ScanLine } from "lucide-react";

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

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    session.qr_token
  )}`;

  // Format time mm:ss for better readability
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col items-center relative border border-slate-100 transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="w-full px-6 pt-6 pb-2 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <h2 className="font-bold text-slate-800 text-lg tracking-tight">Live Attendance</h2>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
              {session.course_name ? `${session.course_name} • ` : ""} 
              {session.batch_name || "Attendance Session"}
            </p>
          </div>
          
          <button 
            onClick={onMinimize}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
            title="Minimize to background"
          >
            <Minimize2 size={20} />
          </button>
        </div>

        {/* QR CONTAINER */}
        <div className="p-8 relative group w-full flex justify-center">
            <div className="absolute inset-0 bg-indigo-50/50 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
            
            <div className="bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 relative z-10">
                {/* Scan Indicator Animation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/30 animate-[scan_2s_linear_infinite] rounded-full z-20"></div>
                
                <img
                    src={qrUrl}
                    alt="Attendance QR"
                    className="w-52 h-52 object-contain rounded-lg"
                />
                
                {/* Visual decorative corners */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-indigo-600 rounded-tl-lg"></div>
                <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-indigo-600 rounded-tr-lg"></div>
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-indigo-600 rounded-bl-lg"></div>
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-indigo-600 rounded-br-lg"></div>
            </div>
            
            <div className="absolute bottom-4 flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest opacity-60">
                <ScanLine size={14} /> Scan with App
            </div>
        </div>

        {/* TIMER */}
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-sm font-bold border transition-colors mb-6 ${
            timeLeft < 30 
                ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" 
                : "bg-slate-50 text-slate-700 border-slate-200"
          }`}>
            <Clock size={16} className={timeLeft < 30 ? "text-rose-500" : "text-slate-400"} />
            <span>
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] uppercase text-slate-400 font-sans tracking-wide ml-1 font-bold">remaining</span>
          </div>
        )}

        {/* FOOTER ACTION */}
        <div className="w-full p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={() => onEnd(session.session_id)}
            className="flex items-center justify-center gap-2 w-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow active:scale-[0.98] group"
          >
            <StopCircle size={18} className="group-hover:scale-110 transition-transform" />
            End Attendance Session
          </button>
        </div>

      </div>
    </div>
  );
}