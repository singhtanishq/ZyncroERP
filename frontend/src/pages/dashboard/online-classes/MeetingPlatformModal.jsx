import { useEffect, useState } from "react";
import { Video, Link2, Key, MessageSquare, ExternalLink } from "lucide-react";
import AppModal from "../../../components/common/AppModal";

const PLATFORMS = [
  { id: "zoom", name: "Zoom", url: "https://zoom.us/start" },
  { id: "teams", name: "Microsoft Teams", url: "https://teams.live.com" },
  { id: "gmeet", name: "Google Meet", url: "https://meet.google.com" },
  { id: "other", name: "Other" },
];

const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export default function MeetingPlatformModal({
  open,
  initialData = null,
  onClose,
  onBack,
  onNext,
}) {
  const [platform, setPlatform] = useState(null);

  const [form, setForm] = useState({
    platform_name: "",
    meeting_link: "",
    meeting_id: "",
    meeting_password: "",
    remarks: "",
  });

  /* ================= PREFILL / RESET ================= */

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setPlatform(initialData.platform || null);
      setForm({
        platform_name: initialData.platform_name || "",
        meeting_link: initialData.meeting_link || "",
        meeting_id: initialData.meeting_id || "",
        meeting_password: initialData.meeting_password || "",
        remarks: initialData.remarks || "",
      });
    } else {
      setPlatform(null);
      setForm({
        platform_name: "",
        meeting_link: "",
        meeting_id: "",
        meeting_password: "",
        remarks: "",
      });
    }
  }, [open, initialData]);

  if (!open) return null;

  /* ================= HANDLERS ================= */

  const selectPlatform = (p) => {
    setPlatform(p.id);

    if (p.url) {
      window.open(p.url, "_blank");
    }

    setForm((prev) => ({
      ...prev,
      platform_name: p.name,
    }));
  };

  const normalizeUrl = (url) => {
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  const handleNext = () => {
    if (!platform) {
      alert("Please select a meeting platform");
      return;
    }

    if (platform === "other" && !form.platform_name.trim()) {
      alert("Platform name is required");
      return;
    }

    if (!form.meeting_link.trim()) {
      alert("Meeting link is required");
      return;
    }

    const normalizedLink = normalizeUrl(form.meeting_link.trim());

    if (!isValidUrl(normalizedLink)) {
      alert("Please enter a valid meeting URL (https://...)");
      return;
    }

    onNext({
      platform,
      platform_name: form.platform_name,
      meeting_link: normalizedLink,
      meeting_id: form.meeting_id || null,
      meeting_password: form.meeting_password || null,
      remarks: form.remarks || null,
    });
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Select Meeting Platform"
      size="lg"
      footer={
        <div className="w-full flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
          >
            Back
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-teal-500 hover:bg-brand-teal-600 shadow-lg shadow-brand-teal-500/20 transition-all active:scale-95"
          >
            Next Step
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* SUBHEADER CONTEXT */}
        <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2">
          Choose where the lecture will be hosted.
        </p>

        {/* PLATFORM GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPlatform(p)}
              className={`relative group border rounded-2xl p-4 text-left transition-all duration-200 hover:shadow-md ${
                platform === p.id
                  ? "border-brand-teal-500 bg-brand-teal-500/5 ring-1 ring-brand-teal-500"
                  : "border-[rgb(var(--zx-border))] bg-[rgb(var(--zx-surface))] hover:border-brand-teal-500/40 hover:bg-[rgb(var(--zx-surface-hover))]"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                 <div className={`font-bold text-base ${platform === p.id ? "text-[rgb(var(--zx-text))]" : "text-[rgb(var(--zx-text))] opacity-90"}`}>{p.name}</div>
                 {platform === p.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-teal-500 animate-pulse"></div>}
              </div>
              
              <div className="text-xs text-[rgb(var(--zx-text-muted))] flex items-center gap-1.5 font-medium">
                {p.id === "other" ? (
                    "Manual meeting details"
                ) : (
                    <>
                      Create meeting on platform
                      <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* DYNAMIC FORM */}
        {platform && (
          <div className="space-y-5 pt-6 border-t border-[rgb(var(--zx-border))] animate-in slide-in-from-bottom-2 duration-300">
            
            {platform === "other" && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 block ml-1">Platform Name <span className="text-rose-500">*</span></label>
                <input
                  className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                  value={form.platform_name}
                  onChange={(e) =>
                    setForm({ ...form, platform_name: e.target.value })
                  }
                  placeholder="e.g. Webex, Skype..."
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                <Link2 size={14} className="text-brand-teal-500" /> Meeting Link <span className="text-rose-500">*</span>
              </label>
              <input
                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                value={form.meeting_link}
                onChange={(e) =>
                  setForm({ ...form, meeting_link: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                  <Video size={14} className="text-brand-teal-500" /> Meeting ID
                </label>
                <input
                  className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                  value={form.meeting_id}
                  onChange={(e) =>
                    setForm({ ...form, meeting_id: e.target.value })
                  }
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                  <Key size={14} className="text-brand-teal-500" /> Password
                </label>
                <input
                  className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-semibold text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60"
                  value={form.meeting_password}
                  onChange={(e) =>
                    setForm({ ...form, meeting_password: e.target.value })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 flex items-center gap-1.5 ml-1">
                <MessageSquare size={14} className="text-brand-teal-500" /> Remarks
              </label>
              <textarea
                rows={2}
                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] px-4 py-3 rounded-xl focus:outline-none focus:border-brand-teal-500 transition-all font-medium text-sm shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 resize-none"
                value={form.remarks}
                onChange={(e) =>
                  setForm({ ...form, remarks: e.target.value })
                }
                placeholder="Any special instructions for students..."
              />
            </div>
          </div>
        )}
      </div>
    </AppModal>
  );
}