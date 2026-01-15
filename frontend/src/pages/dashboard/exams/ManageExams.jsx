import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import ViewExamModal from "../../../components/exams/ViewExamModal";
import PostponeExamModal from "../../../components/exams/PostponeExamModal";
import AppModal from "../../../components/common/AppModal";
import { 
  ClipboardList, 
  Calendar, 
  Clock, 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Trash2, 
  X,
  Save,
  CheckCircle2,
  Inbox
} from "lucide-react";

export default function ManageExams({
    apiPrefix = "/admin",
}) {
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const [confirm, setConfirm] = useState(null);
  const [viewExam, setViewExam] = useState(null);
  const [postponeExam, setPostponeExam] = useState(null);
  const [editExam, setEditExam] = useState(null);

  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const loadExams = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`${apiPrefix}/exams`);
      setExams(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, [apiPrefix]);

  const cancelExam = async (examId) => {
    await api.put(`${apiPrefix}/exams/${examId}/cancel`);
    showToast("Exam cancelled");
    setConfirm(null);
    loadExams();
  };

  const saveExamUpdates = async () => {
    if (!editExam) return;

    const {
      start_time,
      end_time,
      duration_minutes,
      status,
      course_id,
      batch_id,
      ...payload
    } = editExam;

    await api.put(
      `${apiPrefix}/exams/${editExam.id}`,
      payload
    );
    showToast("Exam updated");
    setEditExam(null);
    loadExams();
  };

  // Helper for status colors
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
        case 'upcoming': return 'bg-brand-blue-500/10 text-brand-blue-500 border-brand-blue-500/20';
        case 'completed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
        case 'live': return 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse';
        case 'cancelled': return 'bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border-[rgb(var(--zx-border))]';
        default: return 'bg-[rgb(var(--zx-surface-hover))] text-[rgb(var(--zx-text-muted))] border-[rgb(var(--zx-border))]';
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 pt-0 space-y-8 animate-fade-in font-sans">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
            <ClipboardList size={14} strokeWidth={2.5} />
            Exam Center
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Manage Exams
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            View upcoming schedules, update exam details, or manage cancellations.
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
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Mode</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--zx-border))]">
            {isLoading ? (
                 <tr>
                    <td colSpan="7" className="px-6 py-20">
                        <div className="flex flex-col items-center justify-center text-[rgb(var(--zx-text-muted))] space-y-3">
                             <div className="w-8 h-8 border-4 border-brand-teal-500/30 border-t-brand-teal-500 rounded-full animate-spin"></div>
                             <span className="font-medium text-sm">Loading exams...</span>
                        </div>
                    </td>
                </tr>
            ) : exams.length === 0 ? (
                 <tr>
                    <td colSpan="7" className="px-6 py-20 text-center text-[rgb(var(--zx-text-muted))]">
                        <div className="flex flex-col items-center justify-center">
                            <Inbox size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-bold text-[rgb(var(--zx-text))]">No exams scheduled</p>
                        </div>
                    </td>
                </tr>
            ) : (
                exams.map((exam) => (
                <React.Fragment key={exam.id}>
                    <tr
                    className={`cursor-pointer transition-colors ${
                        expandedId === exam.id ? "bg-brand-teal-500/5" : "hover:bg-[rgb(var(--zx-surface-hover))]"
                    }`}
                    onClick={() =>
                        setExpandedId(expandedId === exam.id ? null : exam.id)
                    }
                    >
                    <td className="px-6 py-5 font-bold text-[rgb(var(--zx-text))] text-sm">{exam.name}</td>
                    <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text))] font-medium">{exam.course?.name}</td>
                    <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))]">{exam.batch?.name}</td>
                    <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text-muted))] font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[rgb(var(--zx-text-muted))]" />
                            {exam.start_time?.replace("T", " ").slice(0, 16)}
                        </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-[rgb(var(--zx-text))] capitalize">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${exam.mode === 'online' ? 'bg-brand-teal-500/10 text-brand-teal-500 border-brand-teal-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                            {exam.mode}
                        </span>
                    </td>
                    <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(exam.status)}`}>
                            {exam.status}
                        </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                        <div className={`p-2 rounded-xl inline-flex transition-transform duration-200 ${expandedId === exam.id ? 'rotate-90 bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20' : 'text-[rgb(var(--zx-text-muted))]'}`}>
                            <MoreHorizontal size={18} />
                        </div>
                    </td>
                    </tr>

                    {/* EXPANDED ACTIONS ROW */}
                    {expandedId === exam.id && (
                    <tr className="bg-[rgb(var(--zx-surface-hover))]/50 animate-in fade-in duration-200">
                        <td colSpan="7" className="px-6 py-4 border-b border-[rgb(var(--zx-border))]">
                        <div className="flex flex-wrap items-center justify-end gap-3">
                            <span className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-wider mr-auto">Exam Actions:</span>
                            
                            <button
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-xs font-bold uppercase tracking-wider hover:border-brand-teal-500 hover:text-brand-teal-500 transition-all"
                            onClick={(e) => {
                                e.stopPropagation();
                                setViewExam(exam);
                            }}
                            >
                            <Eye size={16} /> View Details
                            </button>

                            {exam.status === "upcoming" && (
                            <>
                                <button
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-xs font-bold uppercase tracking-wider hover:border-amber-500 hover:text-amber-500 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditExam({ ...exam });
                                }}
                                >
                                <Pencil size={16} /> Update
                                </button>

                                <button
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] shadow-sm text-xs font-bold uppercase tracking-wider hover:border-brand-blue-500 hover:text-brand-blue-500 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPostponeExam(exam);
                                }}
                                >
                                <Clock size={16} /> Postpone
                                </button>

                                <div className="w-px h-6 bg-[rgb(var(--zx-border))] mx-1"></div>

                                <button
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgb(var(--zx-surface))] border border-rose-500/30 text-rose-500 shadow-sm text-xs font-bold uppercase tracking-wider hover:bg-rose-500/10 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirm({ id: exam.id, name: exam.name });
                                }}
                                >
                                <Trash2 size={16} /> Cancel
                                </button>
                            </>
                            )}
                        </div>
                        </td>
                    </tr>
                    )}
                </React.Fragment>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={!!confirm}
        title="Cancel Exam"
        message={
            <span className="block text-[rgb(var(--zx-text-muted))]">
                Are you sure you want to cancel the exam <span className="font-bold text-[rgb(var(--zx-text))]">"{confirm?.name}"</span>?
                This action cannot be undone.
            </span>
        }
        onConfirm={() => cancelExam(confirm.id)}
        onClose={() => setConfirm(null)}
      />

      {/* VIEW MODAL */}
      {viewExam && (
        <ViewExamModal exam={viewExam} onClose={() => setViewExam(null)} />
      )}

      {/* POSTPONE MODAL */}
      {postponeExam && (
       <PostponeExamModal
        apiPrefix={apiPrefix}
        exam={postponeExam}
        onClose={() => setPostponeExam(null)}
        onSuccess={loadExams}
    />
      )}

      {/* EDIT MODAL */}
      {editExam && (
        <AppModal
          open={!!editExam}
          onClose={() => setEditExam(null)}
          title="Update Exam"
          size="lg"
          footer={
            <div className="w-full flex justify-between items-center">
              <button
                className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
                onClick={() => setEditExam(null)}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-2.5 rounded-xl bg-brand-teal-500 text-white text-sm font-semibold hover:bg-brand-teal-600 shadow-lg shadow-brand-teal-500/20 transition-all flex items-center gap-2 active:scale-95" 
                onClick={saveExamUpdates}
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          }
        >
          <div className="space-y-6">
            
            {/* SUBHEADER CONTEXT */}
            <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2">
              Edit exam details
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Exam Name</label>
              <input
                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-bold shadow-sm"
                value={editExam.name || ""}
                onChange={(e) =>
                  setEditExam({ ...editExam, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Description</label>
              <textarea
                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all resize-none shadow-sm font-medium"
                value={editExam.description || ""}
                rows={3}
                onChange={(e) =>
                  setEditExam({ ...editExam, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Delivery Mode</label>
              <select
                className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all font-semibold shadow-sm cursor-pointer"
                value={editExam.mode}
                onChange={(e) =>
                  setEditExam({ ...editExam, mode: e.target.value })
                }
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {editExam.mode === "online" && (
              <div className="space-y-4 pt-2 animate-in slide-in-from-bottom-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Platform Name</label>
                  <input
                      className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all shadow-sm font-medium"
                      placeholder="Platform Name"
                      value={editExam.platform_name || ""}
                      onChange={(e) =>
                      setEditExam({
                          ...editExam,
                          platform_name: e.target.value,
                      })
                      }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Platform Description</label>
                  <textarea
                      className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all resize-none shadow-sm font-medium"
                      placeholder="Platform Description"
                      rows={2}
                      value={editExam.platform_description || ""}
                      onChange={(e) =>
                      setEditExam({
                          ...editExam,
                          platform_description: e.target.value,
                      })
                      }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Exam Link</label>
                  <input
                      className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-brand-teal-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all shadow-sm font-medium"
                      placeholder="Exam Link"
                      value={editExam.exam_link || ""}
                      onChange={(e) =>
                      setEditExam({
                          ...editExam,
                          exam_link: e.target.value,
                      })
                      }
                  />
                </div>
              </div>
            )}

            {editExam.mode === "offline" && (
              <div className="space-y-4 pt-2 animate-in slide-in-from-bottom-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Center Name</label>
                  <input
                      className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all shadow-sm font-medium"
                      placeholder="Exam Center Name"
                      value={editExam.center_name || ""}
                      onChange={(e) =>
                      setEditExam({
                          ...editExam,
                          center_name: e.target.value,
                      })
                      }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[rgb(var(--zx-text-muted))] uppercase tracking-widest ml-1">Offline Notes</label>
                  <textarea
                      className="w-full bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal-500 transition-all resize-none shadow-sm font-medium"
                      placeholder="Offline Notes"
                      rows={2}
                      value={editExam.offline_notes || ""}
                      onChange={(e) =>
                      setEditExam({
                          ...editExam,
                          offline_notes: e.target.value,
                      })
                      }
                  />
                </div>
              </div>
            )}
          </div>
        </AppModal>
      )}

      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[rgb(var(--zx-surface))] text-[rgb(var(--zx-text))] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[rgb(var(--zx-border))] backdrop-blur-xl">
            <div className="bg-emerald-500/20 text-emerald-500 rounded-full p-1 border border-emerald-500/30">
                <CheckCircle2 size={14} strokeWidth={3} />
            </div>
            <span className="text-sm font-bold tracking-wide">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}