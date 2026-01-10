import { Award, AlertTriangle } from "lucide-react";

export default function ManageCertificates() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fade-in font-sans">
      
      {/* DEPRECATED WARNING */}
      <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-6 flex gap-4 items-start">
        <AlertTriangle className="text-yellow-600 mt-1" size={28} />
        <div>
          <h2 className="text-lg font-bold text-yellow-800">
            Module Deprecated
          </h2>
          <p className="text-sm text-yellow-700 mt-1 leading-relaxed">
            Certificate generation has been moved to the{" "}
            <strong>Exam Management → Issue Certificate</strong> module.
            <br />
            <br />
            This page is now <strong>read-only</strong> and will be removed in a
            future release as part of the <strong>Single Certificate Engine</strong>.
          </p>
        </div>
      </div>

      {/* STATIC INFO CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 text-center">
        <Award size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-700">
          Certificate Management Moved
        </h3>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Please use the <strong>Publish Results</strong> module to enter marks,
          and then proceed to <strong>Issue Certificate</strong> under
          <strong> Exam Management</strong>.
        </p>
      </div>
    </div>
  );
}
