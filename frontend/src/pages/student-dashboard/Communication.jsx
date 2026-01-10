import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api/apiClient";
import CommunicationViewModal from "./CommunicationViewModal";
import {
  Megaphone,
  Search,
  CalendarDays,
  Globe,
  BookOpen,
  Layers,
  Loader2,
  Inbox,
  ChevronRight,
} from "lucide-react";

export default function Communication() {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCommunication, setSelectedCommunication] = useState(null);

  useEffect(() => {
    loadCommunications();
  }, []);

  async function loadCommunications() {
    try {
      setLoading(true);

      const res = await api.get("/student/communication");

      setCommunications(res.data || []);
    } catch (err) {
      console.error(err);
      setCommunications([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return communications;
    }

    const keyword = search.toLowerCase();

    return communications.filter((item) => {
      return (
        item.title?.toLowerCase().includes(keyword) ||
        item.message?.toLowerCase().includes(keyword)
      );
    });
  }, [communications, search]);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-4">
          <div className="flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm text-white">
            <Megaphone size={24} />
          </div>
          Communication
        </h1>
        <p className="text-slate-500 mt-3 text-lg max-w-2xl leading-relaxed">
          View important announcements and updates shared by the administration.
        </p>
      </div>

      {/* SEARCH */}
      <div className="relative group max-w-xl mb-10">
        <Search
          size={20}
          className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search announcements..."
          className="w-full pl-12 pr-4 py-3.5 bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all duration-300 placeholder:text-slate-400 text-slate-700 font-medium"
        />
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
          <p className="font-medium tracking-wide">Loading communications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-32 flex flex-col items-center transition-all duration-500">
          <div className="bg-slate-100/50 p-6 rounded-full mb-6">
            <Inbox size={48} className="text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
            No Communications
          </h3>
          <p className="mt-2 text-slate-500 font-medium">
            There are no announcements available at this time.
          </p>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500">
          {filtered.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelectedCommunication(item)}
              className={`group w-full text-left p-6 transition-all duration-300 hover:bg-white/90 active:bg-white/50 relative flex items-center gap-6 ${
                index !== filtered.length - 1
                  ? "border-b border-slate-200/50"
                  : ""
              }`}
            >
              <div className="flex-1 flex items-start gap-5 min-w-0">
                <div className="mt-1 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl p-3 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors duration-300 shadow-sm">
                  <Megaphone size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 text-lg truncate group-hover:text-indigo-900 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <span className="inline-flex items-center gap-1.5 bg-slate-100/80 text-slate-500 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-slate-200/60 shrink-0">
                      <CalendarDays size={14} />
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {/* NEW PROGRAM PILLS ADDED HERE */}
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-purple-700 bg-purple-50/80 border border-purple-200/60 px-2.5 py-1 rounded-lg">
                      <BookOpen size={12} className="text-indigo-400" />
                      {item.student_course?.name || item.accessRules?.[0]?.course?.name || "N/A"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-purple-700 bg-purple-50/80 border border-purple-200/60 px-2.5 py-1 rounded-lg">
                      <Layers size={12} className="text-indigo-400" />
                      {item.student_batch?.name || item.accessRules?.[0]?.batch?.name || "N/A"}
                    </span>
                  </div>

                  <p className="text-s text-slate-500 line-clamp-2 leading-relaxed pr-8">
                    {item.message}
                  </p>
                </div>
              </div>
              
              <div className="shrink-0 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-300">
                <ChevronRight size={20} />
              </div>
            </button>
          ))}
        </div>
      )}

      <CommunicationViewModal
        open={!!selectedCommunication}
        communication={selectedCommunication}
        onClose={() => setSelectedCommunication(null)}
      />
    </div>
  );
}