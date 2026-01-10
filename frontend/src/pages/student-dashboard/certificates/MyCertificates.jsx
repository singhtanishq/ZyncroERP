import React, { useEffect, useState } from "react";
import api from "../../../lib/api/apiClient";
import {
  Award,
  GraduationCap,
  Calendar,
  Search,
  ExternalLink,
  ChevronDown,
  BookOpen,
  Layers,
  Hash,
  Inbox,
  Loader2
} from "lucide-react";

export default function MyCertificates() {
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(false);

  useEffect(() => {
    loadEnrollments();
  }, []);

  useEffect(() => {
    if (selectedEnrollment) {
      loadCertificates();
    }
  }, [selectedEnrollment]);

  async function loadEnrollments() {
    try {
      const res = await api.get("/student/certificates/enrollments");
      setEnrollments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadCertificates() {
    try {
      setLoadingCerts(true);
      const enrollment = enrollments.find(
        (e) => String(e.id) === String(selectedEnrollment)
      );

      if (!enrollment) return;

      const res = await api.get(
        `/student/certificates/${enrollment.course_id}/${enrollment.batch_id}`
      );

      setCertificates(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCerts(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 font-sans overflow-x-hidden pb-24">
      
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-4">
          <div className="flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm text-white shrink-0">
            <Award size={24} />
          </div>
          My Certificates
        </h1>
        <p className="text-slate-500 mt-3 text-m max-w-2xl leading-relaxed">
          View, verify, and download all official credentials and certificates issued to you across your enrolled courses.
        </p>
      </div>

      {/* FILTER SECTION */}
      <div className="relative group max-w-xl mb-10">
        <BookOpen
          size={20}
          className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300 z-10"
        />
        <select
          value={selectedEnrollment}
          onChange={(e) => setSelectedEnrollment(e.target.value)}
          className="w-full appearance-none pl-12 pr-10 py-3.5 bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all duration-300 text-slate-700 font-medium cursor-pointer"
        >
          <option value="">Select Academic Enrollment...</option>
          {enrollments.map((enrollment) => (
            <option key={enrollment.id} value={enrollment.id}>
              {enrollment.course_name} • {enrollment.batch_name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={20}
          className="absolute right-4 top-3.5 text-slate-400 pointer-events-none"
        />
      </div>

      {/* CONTENT AREA */}
      {!selectedEnrollment ? (
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-32 flex flex-col items-center transition-all duration-500">
          <div className="bg-slate-100/50 p-6 rounded-full mb-6">
            <Search size={48} className="text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
            Select an Enrollment
          </h3>
          <p className="mt-2 text-slate-500 font-medium text-center max-w-md">
            Choose a specific course and batch from the dropdown above to view your earned certificates.
          </p>
        </div>
      ) : loadingCerts ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
          <p className="font-medium tracking-wide">Fetching certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-32 flex flex-col items-center transition-all duration-500">
          <div className="bg-slate-100/50 p-6 rounded-full mb-6">
            <Inbox size={48} className="text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
            No Certificates Found
          </h3>
          <p className="mt-2 text-slate-500 font-medium text-center max-w-md">
            You haven't been issued any certificates for this specific enrollment yet.
          </p>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-5 pl-6">Certificate Name</th>
                  <th className="p-5">Certificate No.</th>
                  <th className="p-5">Program Details</th>
                  <th className="p-5">Issued Date</th>
                  <th className="p-5 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {certificates.map((certificate) => (
                  <tr 
                    key={certificate.id} 
                    className="group hover:bg-white/90 transition-all duration-300"
                  >
                    <td className="p-5 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-50 border border-slate-100 text-slate-400 rounded-xl p-2.5 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors duration-300 shadow-sm">
                          <GraduationCap size={18} />
                        </div>
                        <span className="font-bold text-slate-800 text-base group-hover:text-indigo-900 transition-colors duration-300">
                          {certificate.exam?.name || "Official Certificate"}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center gap-1.5 bg-slate-100/60 px-3 py-1.5 rounded-lg border border-slate-200/60 text-slate-600 font-semibold text-sm">
                        <Hash size={14} className="text-slate-400" /> 
                        {certificate.certificate_number}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1.5 text-sm font-medium">
                        <span className="text-slate-700 flex items-center gap-2">
                          <BookOpen size={14} className="text-slate-400" /> 
                          {certificate.course?.name || "N/A"}
                        </span>
                        <span className="text-slate-500 flex items-center gap-2">
                          <Layers size={14} className="text-slate-400" /> 
                          {certificate.batch?.name || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        {certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : "N/A"}
                      </span>
                    </td>
                    <td className="p-5 pr-6 text-right">
                      <button
                        onClick={() =>
                          window.open(
                            `${import.meta.env.VITE_API_BASE_URL}/certificate/${certificate.certificate_number}`,
                            "_blank"
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:shadow-md transition-all duration-300 active:scale-[0.98] text-sm"
                      >
                        <ExternalLink size={16} />
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
    </div>
  );
}