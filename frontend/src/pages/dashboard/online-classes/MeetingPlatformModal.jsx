import { useEffect, useState } from "react";
import { X, Video, Link2, Key, MessageSquare, ExternalLink } from "lucide-react";

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
  initialData = null,   // ✅ NEW
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

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white w-[580px] rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Select Meeting Platform</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Choose where the lecture will be hosted.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          
          {/* PLATFORM GRID */}
          <div className="grid grid-cols-2 gap-4">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPlatform(p)}
                className={`relative group border rounded-xl p-4 text-left transition-all duration-200 hover:shadow-md ${
                  platform === p.id
                    ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600"
                    : "border-slate-200 hover:bg-slate-50 hover:border-indigo-200"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                   <div className={`font-bold text-base ${platform === p.id ? "text-indigo-900" : "text-slate-700"}`}>{p.name}</div>
                   {platform === p.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></div>}
                </div>
                
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
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
            <div className="space-y-5 pt-6 border-t border-slate-100 animate-in slide-in-from-bottom-2 duration-300">
              
              {platform === "other" && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block ml-1">Platform Name <span className="text-red-500">*</span></label>
                  <input
                    className="w-full bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm placeholder:text-slate-300"
                    value={form.platform_name}
                    onChange={(e) =>
                      setForm({ ...form, platform_name: e.target.value })
                    }
                    placeholder="e.g. Webex, Skype..."
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                  <Link2 size={14} className="text-indigo-500" /> Meeting Link <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm placeholder:text-slate-300"
                  value={form.meeting_link}
                  onChange={(e) =>
                    setForm({ ...form, meeting_link: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                    <Video size={14} className="text-indigo-500" /> Meeting ID
                  </label>
                  <input
                    className="w-full bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm placeholder:text-slate-300"
                    value={form.meeting_id}
                    onChange={(e) =>
                      setForm({ ...form, meeting_id: e.target.value })
                    }
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                    <Key size={14} className="text-indigo-500" /> Password
                  </label>
                  <input
                    className="w-full bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm placeholder:text-slate-300"
                    value={form.meeting_password}
                    onChange={(e) =>
                      setForm({ ...form, meeting_password: e.target.value })
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5 ml-1">
                  <MessageSquare size={14} className="text-indigo-500" /> Remarks
                </label>
                <textarea
                  rows={2}
                  className="w-full bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm placeholder:text-slate-300 resize-none"
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

        {/* FOOTER */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-200 transition-all text-sm"
          >
            Back
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
}