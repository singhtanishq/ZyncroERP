import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import ConfirmModal from "../../../components/ConfirmModal";
import ViewExamModal from "../../../components/exams/ViewExamModal";
import PostponeExamModal from "../../../components/exams/PostponeExamModal";
import { 
  ClipboardList, 
  Calendar, 
  Clock, 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Trash2, 
  AlertTriangle,
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
  }, []);

  const cancelExam = async (examId) => {
    await api.put(`${apiPrefix}/exams/${examId}/cancel`);
    showToast("Exam cancelled");
    setConfirm(null);
    loadExams();
  };

  const saveExamUpdates = async () => {
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
        case 'upcoming': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'live': return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
        case 'cancelled': return 'bg-slate-100 text-slate-500 border-slate-200';
        default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <ClipboardList className="text-blue-600" size={32} />
            Manage Exams
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            View upcoming schedules, update exam details, or manage cancellations.
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
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Mode</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
                 <tr>
                    <td colSpan="7" className="px-6 py-20">
                        <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                             <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                             <span className="font-medium">Loading exams...</span>
                        </div>
                    </td>
                </tr>
            ) : exams.length === 0 ? (
                 <tr>
                    <td colSpan="7" className="px-6 py-20 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                            <Inbox size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium text-slate-600">No exams scheduled</p>
                        </div>
                    </td>
                </tr>
            ) : (
                exams.map((exam) => (
                <React.Fragment key={exam.id}>
                    <tr
                    className={`cursor-pointer transition-colors ${
                        expandedId === exam.id ? "bg-blue-50/30" : "hover:bg-slate-50"
                    }`}
                    onClick={() =>
                        setExpandedId(expandedId === exam.id ? null : exam.id)
                    }
                    >
                    <td className="px-6 py-5 font-bold text-slate-800 text-sm">{exam.name}</td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-medium">{exam.course?.name}</td>
                    <td className="px-6 py-5 text-sm text-slate-500">{exam.batch?.name}</td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            {exam.start_time?.replace("T", " ").slice(0, 16)}
                        </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 capitalize">
                        <span className={`px-2 py-1 rounded border text-xs font-semibold ${exam.mode === 'online' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                            {exam.mode}
                        </span>
                    </td>
                    <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(exam.status)}`}>
                            {exam.status}
                        </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                        <div className={`p-1.5 rounded-full inline-block transition-transform duration-200 ${expandedId === exam.id ? 'rotate-90 bg-blue-100 text-blue-600' : 'text-slate-300'}`}>
                            <MoreHorizontal size={18} />
                        </div>
                    </td>
                    </tr>

                    {/* EXPANDED ACTIONS ROW */}
                    {expandedId === exam.id && (
                    <tr className="bg-blue-50/30 animate-in fade-in duration-200">
                        <td colSpan="7" className="px-6 py-4 border-b border-slate-100">
                        <div className="flex flex-wrap items-center justify-end gap-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-auto">Exam Actions:</span>
                            
                            <button
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm text-sm font-semibold hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all"
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
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm text-sm font-semibold hover:border-amber-300 hover:text-amber-600 hover:shadow-md transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditExam({ ...exam });
                                }}
                                >
                                <Pencil size={16} /> Update
                                </button>

                                <button
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-sm text-sm font-semibold hover:border-purple-300 hover:text-purple-600 hover:shadow-md transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPostponeExam(exam);
                                }}
                                >
                                <Clock size={16} /> Postpone
                                </button>

                                <div className="w-px h-6 bg-slate-300 mx-1"></div>

                                <button
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-red-100 text-red-600 shadow-sm text-sm font-semibold hover:bg-red-50 hover:border-red-200 hover:shadow-md transition-all"
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
            <span className="block text-slate-600">
                Are you sure you want to cancel the exam <span className="font-bold text-slate-900">"{confirm?.name}"</span>?
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

      {/* EDIT MODAL (Inline logic maintained, styled) */}
      {editExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 border border-slate-100">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Update Exam</h2>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Edit exam details</p>
                </div>
                <button 
                    onClick={() => setEditExam(null)}
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Exam Name</label>
                <input
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-700"
                  value={editExam.name || ""}
                  onChange={(e) =>
                    setEditExam({ ...editExam, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Description</label>
                <textarea
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600 resize-none"
                  value={editExam.description || ""}
                  rows={3}
                  onChange={(e) =>
                    setEditExam({ ...editExam, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Delivery Mode</label>
                <select
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-medium"
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Platform Name</label>
                    <input
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Platform Description</label>
                    <textarea
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Exam Link</label>
                    <input
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-blue-600"
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Center Name</label>
                    <input
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Offline Notes</label>
                    <textarea
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
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

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-white hover:border-slate-300 transition-colors"
                onClick={() => setEditExam(null)}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95" 
                onClick={saveExamUpdates}
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/50">
            <div className="bg-emerald-500 rounded-full p-1">
                <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-sm font-medium tracking-wide">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}