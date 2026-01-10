import { useEffect, useState } from "react";
import { Clock, Minimize2, ScanLine } from "lucide-react";

export default function StudentAttendanceQrModal({
  open,
  session,
  onClose,
}) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!session?.ends_at) return;

    const expiryMs = new Date(
      session.ends_at
    ).getTime();

    const interval = setInterval(() => {
      const diff = Math.max(
        0,
        Math.floor((expiryMs - Date.now()) / 1000)
      );

      setTimeLeft(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  if (!open || !session) {
    return null;
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    session.qr_token
  )}`;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">

        <div className="px-6 pt-6 pb-2 flex justify-between items-start">

          <div>
            <h2 className="font-bold text-slate-800 text-lg">
              Attendance QR
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              {session.course_name}
              {" • "}
              {session.batch_name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100"
          >
            <Minimize2 size={20} />
          </button>

        </div>

        <div className="p-8 flex justify-center">

          <div className="bg-white p-4 rounded-2xl border shadow">

            <img
              src={qrUrl}
              alt="Attendance QR"
              className="w-52 h-52"
            />

          </div>

        </div>

        {timeLeft !== null && (
          <div className="flex justify-center mb-6">

            <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-slate-100 text-sm font-semibold">

              <Clock size={16} />

              Expires in {formatTime(timeLeft)}

            </div>

          </div>
        )}

        <div className="pb-6 flex justify-center text-xs text-slate-500 uppercase tracking-wider gap-2">
          <ScanLine size={14} />
          Scan from Mobile Attendance Portal
        </div>

      </div>

    </div>
  );
}