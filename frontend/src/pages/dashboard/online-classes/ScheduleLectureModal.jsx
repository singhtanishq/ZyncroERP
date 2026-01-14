import { useEffect, useState } from "react";
import { Calendar, Clock, Type, AlignLeft, Repeat, Timer, Check } from "lucide-react";
import AppModal from "../../../components/common/AppModal";

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

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {mode === "live" && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>}
          <span>{initialData ? "Edit Lecture" : mode === "live" ? "Go Live Now" : "Schedule Lecture"}</span>
        </div>
      }
      size="lg"
      footer={
        <div className="w-full flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
          >
            Cancel
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-teal-500 hover:bg-brand-teal-600 shadow-lg shadow-brand-teal-500/20 transition-all active:scale-95"
          >
            <span>Next Step</span>
            <Check size={16} />
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* SUBHEADER CONTEXT */}
        <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2">
          {mode === "live" ? "Start an instant live session" : "Plan a new session for your students"}
        </p>

        {/* TITLE */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
              <Type size={14} className="text-brand-teal-500" /> Lecture Title <span className="text-rose-500">*</span>
          </label>
          <input
            className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-bold text-lg shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to Physics"
            autoFocus
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
              <AlignLeft size={14} className="text-brand-teal-500" /> Description
          </label>
          <textarea
            className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 resize-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will be covered in this session?"
          />
        </div>

        {/* DATE & TIME GRID (Only if Schedule Mode) */}
        {mode === "schedule" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                  <Calendar size={14} className="text-brand-teal-500" /> Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-sm shadow-sm cursor-pointer"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                  <Clock size={14} className="text-brand-teal-500" /> Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-sm shadow-sm cursor-pointer"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* DURATION */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
              <Timer size={14} className="text-brand-teal-500" /> Duration (minutes) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
              <input
                  type="number"
                  min={1}
                  className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-sm shadow-sm"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
              />
              <span className="absolute right-4 top-3.5 text-[rgb(var(--zx-text-muted))] text-xs font-bold uppercase tracking-wider pointer-events-none">min</span>
          </div>
        </div>

        {/* RECURRING TOGGLE (Only if Schedule Mode) */}
        {mode === "schedule" && (
          <div className="bg-[rgb(var(--zx-surface-hover))]/50 p-4 rounded-2xl border border-[rgb(var(--zx-border))] space-y-4">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border border-[rgb(var(--zx-border))] transition-colors ${isRecurring ? 'bg-brand-teal-500/10 text-brand-teal-500 border-brand-teal-500/30' : 'bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text-muted))]'}`}>
                      <Repeat size={18} />
                  </div>
                  <div>
                      <span className="block font-bold text-[rgb(var(--zx-text))] text-sm group-hover:text-brand-teal-500 transition-colors">Recurring Lecture</span>
                      <span className="block text-xs text-[rgb(var(--zx-text-muted))] font-medium">Repeat this lecture weekly</span>
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
                  <div className="w-11 h-6 bg-[rgb(var(--zx-surface-hover))] border border-[rgb(var(--zx-border))] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[rgb(var(--zx-text-muted))] after:border-[rgb(var(--zx-border))] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-teal-500 peer-checked:after:bg-white"></div>
              </div>
            </label>

            {isRecurring && (
              <div className="flex justify-between pt-2 animate-in slide-in-from-top-2 duration-200">
                {DAYS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => toggleDay(d.id)}
                    type="button"
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                      recurringDays.includes(d.id)
                        ? "bg-brand-teal-500 text-white shadow-md shadow-brand-teal-500/20 scale-105"
                        : "bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text-muted))] hover:border-brand-teal-500 hover:text-brand-teal-500"
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
    </AppModal>
  );
}