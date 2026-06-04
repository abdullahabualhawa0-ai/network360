import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Printer, FileText, Clock, User, Calendar } from "lucide-react";

export default function ExamPreview({ exam, onBack }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

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

      <div className="min-h-screen" style={{ background: "#020617" }}>
        {/* Toolbar */}
        <div className="no-print sticky top-0 z-20 flex items-center justify-between px-6 py-3"
          style={{ background: "rgba(2,6,23,0.98)", borderBottom: "1px solid rgba(6,182,212,0.15)" }}>
          <button onClick={onBack} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
            <ChevronLeft size={16} /> رجوع
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg,#0891b2,#7c3aed)" }}
            >
              <Printer size={14} /> طباعة الامتحان
            </button>
          </div>
        </div>

        {/* Preview Card */}
        <div className="no-print max-w-3xl mx-auto px-6 py-6 mb-4">
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.2)" }}>
            <FileText size={16} className="text-cyan-400" />
            <span className="text-sm text-slate-300">معاينة ورقة الامتحان — ستُطبع بتنسيق A4</span>
          </div>
        </div>

        {/* Print Area */}
        <div
          id="print-area"
          ref={printRef}
          className="max-w-3xl mx-auto px-6 pb-12"
          style={{ fontFamily: "'Tajawal', Arial, sans-serif", direction: "rtl" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "white", color: "#1e293b" }}
          >
            {/* Exam Header */}
            <div style={{ background: "linear-gradient(135deg,#0891b2,#7c3aed)", padding: "28px 32px" }}>
              <div className="text-center text-white">
                <div className="text-xs font-bold mb-1 opacity-80">منصة تعلم الشبكات التعليمية</div>
                <h1 style={{ fontSize: 22, fontWeight: 900, margin: "8px 0" }}>{exam.title}</h1>
                {exam.section_title && (
                  <div className="text-sm opacity-85">{exam.section_title}{exam.topic_title ? ` › ${exam.topic_title}` : ""}</div>
                )}
              </div>
            </div>

            {/* Student Info */}
            <div style={{ padding: "20px 32px", borderBottom: "2px solid #e2e8f0", display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: "#64748b", fontSize: 12, fontWeight: 700 }}>
                  <User size={12} /> اسم الطالب
                </div>
                <div style={{ borderBottom: "2px solid #cbd5e1", height: 28, minWidth: 200 }} />
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: "#64748b", fontSize: 12, fontWeight: 700 }}>
                  <Calendar size={12} /> التاريخ
                </div>
                <div style={{ borderBottom: "2px solid #cbd5e1", height: 28, minWidth: 150 }} />
              </div>
              {exam.duration_minutes && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 12, fontWeight: 700, alignSelf: "center" }}>
                  <Clock size={12} /> المدة: {exam.duration_minutes} دقيقة
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 12, fontWeight: 700, alignSelf: "center" }}>
                <FileText size={12} /> العلامة: ______ / {exam.questions?.length || 0}
              </div>
            </div>

            {/* Questions */}
            <div style={{ padding: "24px 32px" }}>
              {(exam.questions || []).map((q, qi) => (
                <div key={qi} style={{ marginBottom: 28, pageBreakInside: "avoid" }}>
                  {/* Question */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <div style={{
                      minWidth: 28, height: 28, borderRadius: 8,
                      background: "#0891b2", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 900, flexShrink: 0
                    }}>
                      {qi + 1}
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.6, margin: 0, flex: 1 }}>
                      {q.text}
                    </p>
                  </div>

                  {/* MCQ Options */}
                  {q.type === "mcq" && q.options?.length > 0 && (
                    <div style={{ paddingRight: 38, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                      {q.options.map((opt, oi) => opt ? (
                        <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 20, height: 20, borderRadius: "50%",
                            border: "2px solid #cbd5e1",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700, color: "#64748b", flexShrink: 0
                          }}>
                            {questionLetters[oi]}
                          </div>
                          <span style={{ fontSize: 13, color: "#374151" }}>{opt}</span>
                        </div>
                      ) : null)}
                    </div>
                  )}

                  {/* True/False */}
                  {q.type === "truefalse" && (
                    <div style={{ paddingRight: 38, display: "flex", gap: 24 }}>
                      {["صح", "خطأ"].map((opt) => (
                        <div key={opt} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #cbd5e1" }} />
                          <span style={{ fontSize: 13, color: "#374151", fontWeight: 700 }}>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Short answer */}
                  {q.type === "short" && (
                    <div style={{ paddingRight: 38 }}>
                      <div style={{ borderBottom: "1.5px solid #cbd5e1", height: 32, marginBottom: 8 }} />
                      <div style={{ borderBottom: "1.5px solid #cbd5e1", height: 32 }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 32px", borderTop: "2px solid #e2e8f0", textAlign: "center", color: "#94a3b8", fontSize: 11 }}>
              منصة تعلم الشبكات التعليمية — بالتوفيق للجميع 🌐
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}