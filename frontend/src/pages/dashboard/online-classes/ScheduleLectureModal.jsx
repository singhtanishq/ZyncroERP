import { useEffect, useState } from "react";
import { X, Calendar, Clock, Type, AlignLeft, Repeat, Timer, Check } from "lucide-react";

const DAYS = [
  { id: 1, label: "M" },
  { id: 2, label: "T" },
  { id: 3, label: "W" },
  { id: 4, label: "T" },
  { id: 5, label: "F" },
  { id: 6, label: "S" },
  { id: 7, label: "S" },
];

export default function ScheduleLectureModal({
  open,
  mode = "schedule",
  initialData = null,
  onClose,
  onNext,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState([]);
  const [dayPickerOpen, setDayPickerOpen] = useState(false);

  /* ================= INIT / PREFILL ================= */

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      const start = new Date(initialData.start_datetime);

      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setDate(start.toISOString().slice(0, 10));
      setTime(start.toTimeString().slice(0, 5));
      setDuration(initialData.duration_minutes ?? 60);
      setIsRecurring(Boolean(initialData.is_recurring));
      setRecurringDays(initialData.recurring_days || []);
    } else {
      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setDuration(60);
      setIsRecurring(false);
      setRecurringDays([]);
    }

    setDayPickerOpen(false);
  }, [open, initialData]);

  if (!open) return null;

  /* ================= HELPERS ================= */

  const toggleDay = (id) => {
    setRecurringDays((prev) =>
      prev.includes(id)
        ? prev.filter((d) => d !== id)
        : [...prev, id]
    );
  };

  /* ================= SUBMIT ================= */

  const handleNext = () => {
    if (!title.trim()) {
      alert("Lecture title is required");
      return;
    }

    if (!duration || duration <= 0) {
      alert("Duration must be greater than 0");
      return;
    }

    let start;

    if (mode === "live") {
      start = new Date();
    } else {
      if (!date || !time) {
        alert("Date and time are required");
        return;
      }
      start = new Date(`${date}T${time}`);
    }

    if (isRecurring && recurringDays.length === 0) {
      alert("Select at least one recurring day");
      return;
    }

    onNext({
      title,
      description,
      start_datetime: start.toISOString(),
      duration_minutes: duration,
      is_recurring: isRecurring,
      recurring_days: isRecurring ? recurringDays : null,
    });
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white w-[550px] rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {mode === "live" && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>}
              {initialData ? "Edit Lecture" : mode === "live" ? "Go Live Now" : "Schedule Lecture"}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
                {mode === "live" ? "Start an instant live session" : "Plan a new session for your students"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          
          {/* TITLE */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                <Type size={14} className="text-indigo-500" /> Lecture Title <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full bg-white border border-slate-300 text-slate-800 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-lg shadow-sm placeholder:text-slate-300 placeholder:font-normal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Physics"
              autoFocus
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                <AlignLeft size={14} className="text-indigo-500" /> Description
            </label>
            <textarea
              className="w-full bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm placeholder:text-slate-300 resize-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will be covered in this session?"
            />
          </div>

          {/* DATE & TIME GRID (Only if Schedule Mode) */}
          {mode === "schedule" && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                    <Calendar size={14} className="text-indigo-500" /> Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm cursor-pointer"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                    <Clock size={14} className="text-indigo-500" /> Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  className="w-full bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm cursor-pointer"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* DURATION */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                <Timer size={14} className="text-indigo-500" /> Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <input
                    type="number"
                    min={1}
                    className="w-full bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                />
                <span className="absolute right-4 top-2.5 text-slate-400 text-sm font-medium pointer-events-none">min</span>
            </div>
          </div>

          {/* RECURRING TOGGLE (Only if Schedule Mode) */}
          {mode === "schedule" && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg transition-colors ${isRecurring ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                        <Repeat size={18} />
                    </div>
                    <div>
                        <span className="block font-bold text-slate-700 text-sm group-hover:text-indigo-700 transition-colors">Recurring Lecture</span>
                        <span className="block text-xs text-slate-500">Repeat this lecture weekly</span>
                    </div>
                </div>
                
                {/* Modern Toggle Switch */}
                <div className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isRecurring}
                        onChange={(e) => {
                            setIsRecurring(e.target.checked);
                            if (!e.target.checked) setRecurringDays([]);
                        }}
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>

              {isRecurring && (
                <div className="flex justify-between pt-2 animate-in slide-in-from-top-2 duration-200">
                  {DAYS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => toggleDay(d.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                        recurringDays.includes(d.id)
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-110"
                          : "bg-white border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-200 transition-all text-sm"
          >
            Cancel
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200"
          >
            <span>Next Step</span>
            <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}