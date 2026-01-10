import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import PdfPreviewModal from "../../../components/PdfPreviewModal";
import StudentAdmitCardViewModal from "./StudentAdmitCardViewModal";

import {
  Ticket,
  Eye,
  CalendarClock,
  BookOpen,
  Layers,
  Loader2,
  Inbox,
  Hash
} from "lucide-react";

export default function MyAdmitCards() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const res = await api.get("/student/admit-cards");
      setCards(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const openPdf = (admitCardId) => {
    setSelectedCard(null); 
    setPreviewUrl(
      `${import.meta.env.VITE_API_BASE_URL}/admit-card/${admitCardId}/pdf`
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 font-sans overflow-x-hidden pb-24">
      
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-4">
          <div className="flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm text-white shrink-0">
            <Ticket size={24} />
          </div>
          My Admit Cards
        </h1>
        <p className="text-slate-500 mt-3 text-m max-w-2xl leading-relaxed">
          View and access your official admit cards for upcoming examinations. Download or print them for entry.
        </p>
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
          <p className="font-medium tracking-wide">Locating admit cards...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-32 flex flex-col items-center transition-all duration-500">
          <div className="bg-slate-100/50 p-6 rounded-full mb-6">
            <Inbox size={48} className="text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
            No Admit Cards Issued
          </h3>
          <p className="mt-2 text-slate-500 font-medium text-center max-w-md">
            You currently have no active admit cards available for download. They will appear here once published by the administration.
          </p>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-5 pl-6">Examination</th>
                  <th className="p-5">Program Details</th>
                  <th className="p-5">Schedule</th>
                  <th className="p-5 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {cards.map((card) => (
                  <tr 
                    key={card.id} 
                    className="group hover:bg-white/90 transition-all duration-300"
                  >
                    <td className="p-5 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-50 border border-slate-100 text-slate-400 rounded-xl p-2.5 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors duration-300 shadow-sm">
                          <Ticket size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-base group-hover:text-indigo-900 transition-colors duration-300">
                            {card.exam?.name || "Official Examination"}
                          </span>
                          {card.exam?.exam_category && (
                            <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-slate-500">
                              <Hash size={12} className="text-slate-400" />
                              {card.exam.exam_category}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-5">
                      <div className="flex flex-col gap-1.5 text-sm font-medium">
                        <span className="text-slate-700 flex items-center gap-2">
                          <BookOpen size={14} className="text-slate-400" /> 
                          {card.exam?.course?.name || "N/A"}
                        </span>
                        <span className="text-slate-500 flex items-center gap-2">
                          <Layers size={14} className="text-slate-400" /> 
                          {card.exam?.batch?.name || "N/A"}
                        </span>
                      </div>
                    </td>

                    <td className="p-5">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                        <CalendarClock size={14} className="text-slate-400" />
                        {card.exam?.start_time ? new Date(card.exam.start_time).toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : "TBD"}
                      </span>
                    </td>

                    <td className="p-5 pr-6 text-right">
                      <button
                        onClick={() => setSelectedCard(card)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-[0.98] bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:shadow-md"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedCard && (
        <StudentAdmitCardViewModal
          admitCard={selectedCard}
          onClose={() => setSelectedCard(null)}
          onPreview={openPdf}
        />
      )}

      {previewUrl && (
        <div className="relative z-[100]">
          <PdfPreviewModal
            open={true}
            url={previewUrl}
            title="Admit Card Preview"
            onClose={() => setPreviewUrl(null)}
          />
        </div>
      )}

    </div>
  );
}