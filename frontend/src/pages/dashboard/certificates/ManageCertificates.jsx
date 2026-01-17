import { Award, AlertTriangle } from "lucide-react";

export default function ManageCertificates() {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 space-y-8 animate-fade-in font-sans">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* DEPRECATED WARNING */}
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 sm:p-8 flex gap-4 items-start relative z-10 backdrop-blur-xl">
        <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 shrink-0">
          <AlertTriangle size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[rgb(var(--zx-text))]">
            Module Deprecated
          </h2>
          <p className="text-sm text-[rgb(var(--zx-text-muted))] mt-1.5 leading-relaxed font-medium">
            Certificate generation has been moved to the{" "}
            <strong className="text-[rgb(var(--zx-text))] font-bold">Exam Management → Issue Certificate</strong> module.
            <br />
            <br />
            This page is now <strong className="text-[rgb(var(--zx-text))] font-bold">read-only</strong> and will be removed in a
            future release as part of the <strong className="text-[rgb(var(--zx-text))] font-bold">Single Certificate Engine</strong>.
          </p>
        </div>
      </div>

      {/* STATIC INFO CARD */}
      <div className="bg-[rgb(var(--zx-surface))] rounded-3xl border border-[rgb(var(--zx-border))] shadow-sm p-12 text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-brand-teal-500/10 border border-brand-teal-500/20 text-brand-teal-500 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Award size={32} />
        </div>
        <h3 className="text-xl font-bold text-[rgb(var(--zx-text))]">
          Certificate Management Moved
        </h3>
        <p className="text-sm text-[rgb(var(--zx-text-muted))] mt-2 max-w-md mx-auto leading-relaxed font-medium">
          Please use the <strong className="text-[rgb(var(--zx-text))] font-bold">Publish Results</strong> module to enter marks,
          and then proceed to <strong className="text-[rgb(var(--zx-text))] font-bold">Issue Certificate</strong> under{" "}
          <strong className="text-[rgb(var(--zx-text))] font-bold">Exam Management</strong>.
        </p>
      </div>
    </div>
  );
}