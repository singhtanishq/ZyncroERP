import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function PdfPreviewModal({
  open,
  onClose,
  url,              
  data,             
  title = "PDF Preview",
  iframeTitle = "PDF Preview",
  orientation = "portrait", 
}) {
  if (!open) return null;

  const containerSize =
    orientation === "landscape"
      ? "w-[900px] h-[560px]"
      : "w-[420px] h-[640px]";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`bg-white ${containerSize} rounded-2xl shadow-xl overflow-hidden`}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h3 className="font-semibold">{title}</h3>
            <button onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* CONTENT */}
          <div className="h-full overflow-auto">
            {/* ===== IFRAME MODE (legacy) ===== */}
            {url && (
              <iframe
                src={url}
                title={iframeTitle}
                className="w-full h-full"
              />
            )}

            {/* ===== ADMIT CARD MODE ===== */}
            {data && (
              <div className="p-6 text-sm space-y-4">
                <div className="text-center">
                  <h2 className="text-lg font-bold">ADMIT CARD</h2>
                  <p className="text-xs text-gray-500">
                    Examination Hall Ticket
                  </p>
                </div>
 
                <hr />

                <div className="space-y-2">
                  <p><strong>Student Name:</strong> {data.student?.user?.name}</p>
                  <p><strong>Student ID:</strong> {data.student?.sid}</p>
                </div>

                <hr />

                <div className="space-y-2">
                  <p><strong>Exam:</strong> {data.exam?.name}</p>
                  <p><strong>Category:</strong> {data.exam?.exam_category}</p>
                  <p><strong>Course:</strong> {data.exam?.course?.name}</p>
                  <p><strong>Batch:</strong> {data.exam?.batch?.name}</p>
                </div>

                <hr />

                <div className="space-y-2">
                  <p><strong>Start Time:</strong> {data.exam?.start_time?.replace("T", " ")}</p>
                  <p><strong>End Time:</strong> {data.exam?.end_time?.replace("T", " ")}</p>
                  <p><strong>Mode:</strong> {data.exam?.mode}</p>
                </div>

                <hr />

                <div className="text-center text-xs text-gray-500">
                  QR Token: {data.qr_token}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
