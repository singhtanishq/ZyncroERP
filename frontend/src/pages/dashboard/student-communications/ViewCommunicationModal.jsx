import {
  X,
  Megaphone,
  CalendarDays,
  Globe,
  BookOpen,
  Layers,
} from "lucide-react";

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
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
          <Globe size={14} />
          All Students
        </span>
      );
    }

    if (access.access_type === "all") {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
          <Globe size={14} />
          All Students
        </span>
      );
    }

    if (access.access_type === "course") {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
          <BookOpen size={14} />
          {access.course?.name}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
        <Layers size={14} />
        {access.course?.name}
        {" • "}
        {access.batch?.name}
      </span>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* HEADER */}

        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-start">

          <div className="flex items-start gap-4">

            <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">

              <Megaphone size={24} />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-slate-900">

                {communication.title}

              </h2>

              <div className="flex flex-wrap items-center gap-3 mt-3">

                {audience()}

                <span className="inline-flex items-center gap-2 text-sm text-slate-500">

                  <CalendarDays size={15} />

                  {new Date(
                    communication.created_at
                  ).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}

                </span>

              </div>

            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-200 transition"
          >
            <X size={20} />
          </button>

        </div>

        {/* BODY */}

        <div className="px-8 py-8 max-h-[70vh] overflow-y-auto">

          <div className="whitespace-pre-wrap leading-8 text-slate-700 text-[15px]">

            {communication.message}

          </div>

        </div>

        {/* FOOTER */}

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
          >

            Close

          </button>

        </div>

      </div>

    </div>
  );
}