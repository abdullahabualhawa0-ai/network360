import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileCheck, Award, Loader2, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { useStudentSession, studentApi } from "@/lib/studentSession";
import { t, useLang, getLang } from "@/lib/i18n";
import { useExamsListTranslation } from "@/lib/useExamTranslation";

const BRAND = {
  primary: "#173F5F",
  secondary: "#2F6690",
  accent: "#3A86A8",
  success: "#2E7D5B",
  warning: "#D69E2E",
  error: "#C94C4C",
  border: "#E2E8F0",
};

/**
 * يعرض نتائج الامتحانات المدرسية للطالب المسجّل دخوله.
 * يجلب ExamResult من الـBackend عبر studentApi (مع عزل كامل).
 */
export default function ExamResultsSection() {
  useLang();
  const session = useStudentSession();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    setLoading(true);
    studentApi("filter", "ExamResult", {}, { sort: "-submission_time", limit: 50 })
      .then((rows) => setResults(rows || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [session]);

  // ترجمة عناوين الامتحانات في النتائج عند اختيار لغة غير العربية
  const examLikeList = (results || []).filter(r => r.exam_id).map(r => ({ id: r.exam_id, title: r.exam_title }));
  const { titles: trTitles } = useExamsListTranslation(examLikeList);
  const lang = getLang();

  if (!session) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full" style={{ background: BRAND.accent }} />
        <h2 className="font-bold text-foreground">{t("dashExamResults")}</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{t("dashExamResultsDesc")}</p>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={22} className="animate-spin" style={{ color: BRAND.primary }} />
          <span className="text-xs text-muted-foreground ms-2">{t("dashExamLoading")}</span>
        </div>
      ) : !results || results.length === 0 ? (
        <div className="rounded-2xl p-8 text-center bg-card" style={{ border: `1px solid ${BRAND.border}` }}>
          <FileCheck size={32} className="mx-auto mb-3 opacity-40" style={{ color: BRAND.secondary }} />
          <p className="text-sm font-bold mb-1">{t("dashExamNoResults")}</p>
          <p className="text-xs text-muted-foreground">{t("dashExamNoResultsDesc")}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl overflow-hidden divide-y" style={{ border: `1px solid ${BRAND.border}`, borderColor: BRAND.border }}>
          {results.map((r, i) => {
            const pct = r.percentage ?? (r.total_questions ? Math.round((r.correct_answers / r.total_questions) * 100) : 0);
            const passed = pct >= 60;
            return (
              <motion.div key={r.id || i}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between px-4 py-3.5 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: passed ? "rgba(46,125,91,0.08)" : "rgba(201,76,76,0.08)" }}>
                    {passed
                      ? <CheckCircle2 size={16} style={{ color: BRAND.success }} />
                      : <XCircle size={16} style={{ color: BRAND.error }} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate" style={{ color: BRAND.primary }}>
                      {trTitles[r.exam_id] || r.exam_title || "—"}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Award size={9} /> {r.correct_answers || 0}/{r.total_questions || 0}
                      </span>
                      {r.submission_time && (
                        <span className="flex items-center gap-1">
                          <Calendar size={9} /> {new Date(r.submission_time).toLocaleDateString(lang === "ar" ? "ar" : lang === "he" ? "he" : "en")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 80 ? BRAND.success : pct >= 60 ? BRAND.warning : BRAND.error,
                      }} />
                  </div>
                  <span className="text-xs font-black w-10 text-right"
                    style={{ color: pct >= 80 ? BRAND.success : pct >= 60 ? BRAND.warning : BRAND.error }}>
                    {pct}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}