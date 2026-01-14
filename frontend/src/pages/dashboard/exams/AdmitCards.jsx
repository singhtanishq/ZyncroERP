import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import PdfPreviewModal from "../../../components/PdfPreviewModal";
import { 
  Ticket, 
  ArrowLeft, 
  Eye, 
  FileText, 
  CheckCircle2, 
  Search, 
  BookOpen, 
  Layers,
  ChevronRight,
  Loader2
} from "lucide-react";

export default function AdmitCards({
    apiPrefix = "/admin",
}) {
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  const [generatingId, setGeneratingId] = useState(null);
  
  // Load exams
  useEffect(() => {
    setLoadingExams(true);
    api.get(`${apiPrefix}/admit-cards/exams`)
      .then((res) => {
        setExams(res.data);
      })
      .finally(() => setLoadingExams(false));
  }, [apiPrefix]);

  // Load students for selected exam
  const openExam = async (exam) => {
    setSelectedExam(exam);
    setLoadingStudents(true);
    try {
      const res = await api.get(`${apiPrefix}/admit-cards/${exam.id}/students`);
      setStudents(res.data);
    } finally {
      setLoadingStudents(false);
    }
  };

  const generateAdmitCard = async (examId, studentId) => {
      try {
          setGeneratingId(studentId);

          await api.post(
              `${apiPrefix}/admit-cards/${examId}/${studentId}`
          );

          const res = await api.get(
              `${apiPrefix}/admit-cards/${examId}/students`
          );

          setStudents(res.data);
      } catch (error) {
          console.error(
              "Failed to generate admit card",
              error
          );
      } finally {
          setGeneratingId(null);
      }
  };

  const viewAdmitCard = (admitCardId) => {
    setPreviewData(
      `${import.meta.env.VITE_API_BASE_URL}/admit-card/${admitCardId}/pdf`
    );
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 pt-0 font-sans overflow-x-hidden">
      {/* INJECTING CUSTOM ANIMATION STYLES */}
      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-right {
          animation: slideInFromRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-left {
          animation: slideInFromLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* VIEW 1: EXAM LIST */}
      {!selectedExam && (
        <div 
            key="exam-view" 
            className="space-y-8 animate-slide-left"
        >
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
                <Ticket size={14} strokeWidth={2.5} />
                Examination Hub
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
                Admit Cards
              </h1>
              <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
                Select an exam to manage and issue admit cards for eligible students.
              </p>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] relative z-10">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))]">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Exam Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--zx-border))]">
                {loadingExams ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20">
                      <div className="flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
                        <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
                        <span className="font-medium text-sm">Loading exams...</span>
                      </div>
                    </td>
                  </tr>
                ) : exams.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-[rgb(var(--zx-text-muted))]">
                      <div className="flex flex-col items-center justify-center">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No exams available</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-[rgb(var(--zx-surface-hover))] transition-colors group cursor-pointer" onClick={() => openExam(exam)}>
                      <td className="px-6 py-5">
                        <div className="font-bold text-[rgb(var(--zx-text))] text-sm md:text-base">{exam.name}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-[rgb(var(--zx-text-muted))] font-medium">
                            <BookOpen size={16} className="text-[rgb(var(--zx-text-muted))]" />
                            {exam.course?.name}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-[rgb(var(--zx-text-muted))]">
                            <Layers size={16} className="text-[rgb(var(--zx-text-muted))]" />
                            {exam.batch?.name}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-xs font-bold uppercase tracking-wider hover:border-brand-teal-500 hover:text-brand-teal-500 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            openExam(exam);
                          }}
                        >
                          Open <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: STUDENT LIST */}
      {selectedExam && (
        <div 
            key="student-view"
            className="space-y-6 animate-slide-right"
        >
          {/* HEADER WITH BACK BUTTON */}
          <div className="flex flex-col gap-4 relative z-10">
            <button
              className="flex items-center gap-2 text-[rgb(var(--zx-text-muted))] hover:text-[rgb(var(--zx-text))] transition-colors w-fit font-bold text-xs uppercase tracking-wider"
              onClick={() => {
                setSelectedExam(null);
                setStudents([]);
              }}
            >
              <ArrowLeft size={16} /> Back to Exams
            </button>

            <div className="bg-[rgb(var(--zx-surface))] p-6 sm:p-8 rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-[rgb(var(--zx-text))] tracking-tight">{selectedExam.name}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[rgb(var(--zx-text-muted))] font-medium">
                        <span className="flex items-center gap-1.5"><BookOpen size={14} /> {selectedExam.course?.name}</span>
                        <span className="w-1 h-1 bg-[rgb(var(--zx-border))] rounded-full"></span>
                        <span className="flex items-center gap-1.5"><Layers size={14} /> {selectedExam.batch?.name}</span>
                    </div>
                </div>
                <div className="bg-brand-teal-500/10 border border-brand-teal-500/20 px-4 py-2 rounded-xl text-brand-teal-500 font-bold text-xs tracking-widest uppercase w-max">
                    {students.length} Students
                </div>
            </div>
          </div>

          {/* STUDENTS TABLE */}
          <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm overflow-hidden min-h-[400px] relative z-10">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[rgb(var(--zx-surface-hover))] border-b border-[rgb(var(--zx-border))]">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">SID</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider text-right">Status & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--zx-border))]">
                {loadingStudents ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-20">
                      <div className="flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
                        <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
                        <span className="font-medium text-sm">Loading students...</span>
                      </div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-20 text-center text-[rgb(var(--zx-text-muted))]">
                        <div className="flex flex-col items-center justify-center">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No students found</p>
                            <p className="text-sm mt-1">There are no students enrolled in this exam's criteria.</p>
                        </div>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-[rgb(var(--zx-surface-hover))] transition-colors group">
                      <td className="px-6 py-5">
                        <span className="font-mono text-[rgb(var(--zx-text-muted))] text-xs font-semibold bg-[rgb(var(--zx-surface-hover))] px-2.5 py-1 rounded-lg border border-[rgb(var(--zx-border))]">
                            {student.sid}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-[rgb(var(--zx-text))] text-sm md:text-base">{student.name}</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {student.admit_card_id ? (
                             <>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1 uppercase tracking-widest">
                                    <CheckCircle2 size={12}/> Generated
                                </span>
                                <button
                                    onClick={() => viewAdmitCard(student.admit_card_id)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-xs font-bold uppercase tracking-wider hover:bg-[rgb(var(--zx-surface-hover))] hover:text-brand-teal-500 hover:border-brand-teal-500/40 transition-all shadow-sm"
                                >
                                    <Eye size={14} /> View
                                </button>
                             </>
                          ) : (
                            <button
                              disabled={selectedExam.status !== "upcoming" || generatingId === student.id}
                              onClick={() => generateAdmitCard(selectedExam.id, student.id)}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                                selectedExam.status !== "upcoming" || generatingId === student.id
                                ? "bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] cursor-not-allowed border border-[rgb(var(--zx-border))]"
                                : "bg-brand-teal-500 text-white hover:bg-brand-teal-600 shadow-brand-teal-500/20 active:scale-95"
                              }`}
                            >
                              {generatingId === student.id ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" /> Generating...
                                </>
                              ) : (
                                <>
                                  <FileText size={14} /> Generate
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {previewData && (
        <PdfPreviewModal
          open={true}
          url={previewData}
          title="Admit Card"
          onClose={() => setPreviewData(null)}
        />
      )}
    </div>
  );
}