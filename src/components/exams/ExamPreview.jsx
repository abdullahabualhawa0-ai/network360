import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Printer, FileText, Clock, User, Calendar } from "lucide-react";
import { t, useLang, useDir } from "@/lib/i18n";

export default function ExamPreview({ exam, onBack }) {
  useLang();
  const direction = useDir();
  const printRef = useRef(null);

  const handlePrint = () => window.print();

  const questionLetters = ["أ", "ب", "ج", "د"];

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; background: white !important; color: black !important; font-family: 'Tajawal', Arial, sans-serif; padding: 20mm !important; direction: rtl !important; }
          .no-print { display: none !important; }
          @page { size: A4; margin: 20mm; }
        }
      `}</style>

      <div className="min-h-screen bg-background font-main text-foreground" dir={direction}>
        {/* Toolbar */}
        <div className="no-print sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-card border-b border-border">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm transition-colors text-brand hover:underline"
          >
            <ChevronLeft size={16} /> {t("examPreviewBack")}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <Printer size={14} /> {t("examPreviewPrint")}
          </button>
        </div>

        {/* Preview note */}
        <div className="no-print max-w-3xl mx-auto px-6 py-6 mb-4">
          <div className="rounded-[16px] p-4 flex items-center gap-3 bg-accent border border-border">
            <FileText size={16} className="text-brand" />
            <span className="text-sm text-foreground">{t("examPreviewNote")}</span>
          </div>
        </div>

        {/* Print Area */}
        <div
          id="print-area"
          ref={printRef}
          className="max-w-3xl mx-auto px-6 pb-12 font-main"
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[16px] overflow-hidden bg-card text-card-foreground border border-border"
          >
            {/* Exam Header */}
            <div className="bg-primary text-primary-foreground p-7 text-center">
              <div className="text-xs font-bold mb-1 opacity-90">{t("examPreviewPlatform")}</div>
              <h1 className="text-xl font-black my-2 text-primary-foreground">{exam.title}</h1>
              {exam.section_title && (
                <div className="text-sm opacity-90">{exam.section_title}{exam.topic_title ? ` › ${exam.topic_title}` : ""}</div>
              )}
            </div>

            {/* Student Info */}
            <div className="p-6 border-b border-border flex gap-6 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-muted-foreground">
                  <User size={12} /> {t("examPreviewStudentName")}
                </div>
                <div className="border-b-2 border-border h-7 min-w-[200px]" />
              </div>
              <div className="flex-1 min-w-[150px]">
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-muted-foreground">
                  <Calendar size={12} /> {t("examPreviewDate")}
                </div>
                <div className="border-b-2 border-border h-7 min-w-[150px]" />
              </div>
              {exam.duration_minutes && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground self-center">
                  <Clock size={12} /> {t("examPreviewDuration")}: {exam.duration_minutes} {t("examPreviewMinutes")}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground self-center">
                <FileText size={12} /> {t("examPreviewMark")}: ______ / {exam.questions?.length || 0}
              </div>
            </div>

            {/* Questions */}
            <div className="p-6 space-y-6">
              {(exam.questions || []).map((q, qi) => (
                <div key={qi} className="break-inside-avoid">
                  <div className="flex gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-[6px] bg-accent text-brand flex items-center justify-center text-xs font-black flex-shrink-0">
                      {qi + 1}
                    </div>
                    <p className="text-sm font-bold leading-relaxed m-0 flex-1 text-foreground">{q.text}</p>
                  </div>

                  {q.type === "mcq" && q.options?.length > 0 && (
                    <div className="pr-9 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => opt ? (
                        <div key={oi} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
                            {questionLetters[oi]}
                          </div>
                          <span className="text-xs text-foreground">{opt}</span>
                        </div>
                      ) : null)}
                    </div>
                  )}

                  {q.type === "truefalse" && (
                    <div className="pr-9 flex gap-6">
                      {[t("examEditorTrue"), t("examEditorFalse")].map((opt) => (
                        <div key={opt} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-border" />
                          <span className="text-xs font-bold text-foreground">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === "short" && (
                    <div className="pr-9 space-y-2">
                      <div className="border-b border-border h-8" />
                      <div className="border-b border-border h-8" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border text-center text-muted-foreground text-[11px]">
              {t("examPreviewFooter")} 🌐
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}