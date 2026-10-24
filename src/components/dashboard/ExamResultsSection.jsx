import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileCheck, Award, Loader2, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { useStudentSession, studentApi } from "@/lib/studentSession";
import { t, useLang, getLang } from "@/lib/i18n";
import { useExamsListTranslation } from "@/lib/useExamTranslation";

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
        <div className="w-1 h-5 rounded-full bg-primary" />
        <h2 className="font-bold text-foreground">{t("dashExamResults")}</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{t("dashExamResultsDesc")}</p>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={22} className="animate-spin text-primary" />
          <span className="text-xs text-muted-foreground ms-2">{t("dashExamLoading")}</span>
        </div>
      ) : !results || results.length === 0 ? (
        <div className="rounded-2xl p-8 text-center bg-card border border-border">
          <FileCheck size={32} className="mx-auto mb-3 opacity-40 text-primary" />
          <p className="text-sm font-bold mb-1">{t("dashExamNoResults")}</p>
          <p className="text-xs text-muted-foreground">{t("dashExamNoResultsDesc")}</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl overflow-hidden divide-y divide-border border border-border">
          {results.map((r, i) => {
            const pct = r.percentage ?? (r.total_questions ? Math.round((r.correct_answers / r.total_questions) * 100) : 0);
            const passed = pct >= 60;
            return (
              <motion.div key={r.id || i}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between px-4 py-3.5 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    passed ? "bg-success/10" : "bg-destructive/10"
                  }`}>
                    {passed
                      ? <CheckCircle2 size={16} className="text-success" />
                      : <XCircle size={16} className="text-destructive" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate text-primary">
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
                    <div className={`h-full rounded-full ${
                      pct >= 80 ? "bg-success" : pct >= 60 ? "bg-warning" : "bg-destructive"
                    }`}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`text-xs font-black w-10 text-right ${
                    pct >= 80 ? "text-success" : pct >= 60 ? "text-warning" : "text-destructive"
                  }`}>
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