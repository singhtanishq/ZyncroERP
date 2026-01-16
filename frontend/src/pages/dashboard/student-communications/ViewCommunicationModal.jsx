import {
  X,
  Megaphone,
  CalendarDays,
  Globe,
  BookOpen,
  Layers,
} from "lucide-react";
import AppModal from "../../../components/common/AppModal";

export default function CommunicationViewModal({
  open,
  communication,
  onClose,
}) {
  if (!open || !communication) return null;

  function audience() {
    const access = communication.accessRules?.[0];

    if (!access) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20 text-[10px] uppercase tracking-widest font-bold">
          <Globe size={12} />
          All Students
        </span>
      );
    }

    if (access.access_type === "all") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20 text-[10px] uppercase tracking-widest font-bold">
          <Globe size={12} />
          All Students
        </span>
      );
    }

    if (access.access_type === "course") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20 text-[10px] uppercase tracking-widest font-bold">
          <BookOpen size={12} />
          {access.course?.name}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-teal-500/10 text-brand-teal-500 border border-brand-teal-500/20 text-[10px] uppercase tracking-widest font-bold">
        <Layers size={12} />
        {access.course?.name}
        {" • "}
        {access.batch?.name}
      </span>
    );
  }

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={communication.title}
      subtitle={
        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          {audience()}
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--zx-text-muted))]">
            <CalendarDays size={14} />
            {new Date(
              communication.created_at
            ).toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      }
      size="xl"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-brand-teal-500 hover:bg-brand-teal-600 text-white text-sm font-semibold transition-all active:scale-95 shadow-lg shadow-brand-teal-500/25"
        >
          Close
        </button>
      }
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-dashboard-scroll pr-1">
        <div className="whitespace-pre-wrap leading-relaxed text-[rgb(var(--zx-text))] text-[15px] font-medium">
          {communication.message}
        </div>
      </div>
    </AppModal>
  );
}