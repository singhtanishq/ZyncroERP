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
  
  // New state to track which student is currently having a card generated
  const [generatingId, setGeneratingId] = useState(null);
  
  // Load exams
  useEffect(() => {
    setLoadingExams(true);
    api.get(`${apiPrefix}/admit-cards/exams`)
      .then((res) => {
        setExams(res.data);
      })
      .finally(() => setLoadingExams(false));
  }, []);

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
    <div className="max-w-7xl mx-auto p-6 font-sans overflow-x-hidden">
      {/* INJECTING CUSTOM STYLES TO GUARANTEE ANIMATION WORKS 
        WITHOUT RELYING ON TAILWIND PLUGINS 
      */}
      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-right {
          animation: slideInFromRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-left {
          animation: slideInFromLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* VIEW 1: EXAM LIST */}
      {!selectedExam && (
        <div 
            key="exam-view" 
            className="space-y-8 animate-slide-left"
        >
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <Ticket className="text-blue-600" size={32} />
                Admit Cards
              </h1>
              <p className="text-slate-500 mt-2 text-sm max-w-xl">
                Select an exam to manage and issue admit cards for eligible students.
              </p>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingExams ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20">
                      <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="font-medium">Loading exams...</span>
                      </div>
                    </td>
                  </tr>
                ) : exams.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-600">No exams available</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => openExam(exam)}>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-800 text-sm md:text-base">{exam.name}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <BookOpen size={16} className="text-slate-400" />
                            {exam.course?.name}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Layers size={16} className="text-slate-400" />
                            {exam.batch?.name}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm text-xs font-bold uppercase tracking-wide hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all"
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
          <div className="flex flex-col gap-4">
            <button
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors w-fit font-semibold text-sm"
              onClick={() => {
                setSelectedExam(null);
                setStudents([]);
              }}
            >
              <ArrowLeft size={18} /> Back to Exams
            </button>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedExam.name}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><BookOpen size={14} /> {selectedExam.course?.name}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="flex items-center gap-1.5"><Layers size={14} /> {selectedExam.batch?.name}</span>
                    </div>
                </div>
                <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 text-indigo-700 font-semibold text-sm">
                    {students.length} Students
                </div>
            </div>
          </div>

          {/* STUDENTS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">SID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Status & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingStudents ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-20">
                      <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="font-medium">Loading students...</span>
                      </div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-20 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium text-slate-600">No students found</p>
                            <p className="text-sm">There are no students enrolled in this exam's criteria.</p>
                        </div>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <span className="font-mono text-slate-500 text-xs font-bold bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            {student.sid}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-800 text-sm md:text-base">{student.name}</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {student.admit_card_id ? (
                             <>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1">
                                    <CheckCircle2 size={12}/> Generated
                                </span>
                                <button
                                    onClick={() => viewAdmitCard(student.admit_card_id)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wide hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                                >
                                    <Eye size={14} /> View
                                </button>
                             </>
                          ) : (
                            <button
                              disabled={selectedExam.status !== "upcoming" || generatingId === student.id}
                              onClick={() => generateAdmitCard(selectedExam.id, student.id)}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-sm ${
                                selectedExam.status !== "upcoming" || generatingId === student.id
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95"
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