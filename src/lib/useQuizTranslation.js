import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getLang } from "./i18n";

/**
 * useQuizTranslation — ترجمة بيانات الاختبار آلياً عند اختيار لغة غير العربية.
 * - العربية: يُعرض الاختبار الأصلي فوراً
 * - EN/HE: يُترجم الاختبار كاملاً (العنوان، الأسئلة، الخيارات، الشروحات)
 *   عبر الذكاء الاصطناعي مرة واحدة لكل اختبار لكل لغة، ويُخزَّن في المتصفح.
 */
const LANG_NAMES = { en: "English", he: "Hebrew" };
const cacheKeyFor = (lang, key) => `ai-quiz-tr-${lang}-${key}`;

export default function useQuizTranslation(quiz) {
  const lang = getLang();
  const [translated, setTranslated] = useState(null);
  const [translating, setTranslating] = useState(false);

  const quizId = quiz?.id || "";
  const sourceText = quiz ? JSON.stringify({
    title: quiz.title,
    questions: quiz.questions.map(q => ({
      question: q.question,
      options: q.options,
      explanation: q.explanation,
    })),
  }) : "";

  useEffect(() => {
    if (lang === "ar" || !quiz || !sourceText) {
      setTranslated(null);
      setTranslating(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const cached = localStorage.getItem(cacheKeyFor(lang, quizId));
        if (cached) { if (!cancelled) setTranslated(JSON.parse(cached)); return; }
      } catch {}

      setTranslating(true);
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt:
            `Translate the following networking quiz from Arabic to ${LANG_NAMES[lang]}.\n` +
            `Rules:\n` +
            `- Translate the title, each question text, ALL option texts, and ALL explanations.\n` +
            `- Keep the same JSON structure and field names.\n` +
            `- Keep the "correct" index numbers EXACTLY the same — do not reorder options.\n` +
            `- Keep technical terms (MAC, IP, ARP, Router, Switch, etc.) in their standard ${LANG_NAMES[lang]} form.\n` +
            `- Return ONLY a valid JSON object with the same shape, no commentary.\n\n` +
            sourceText,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    explanation: { type: "string" },
                  },
                },
              },
            },
          },
        });
        if (res && !cancelled) {
          try { localStorage.setItem(cacheKeyFor(lang, quizId), JSON.stringify(res)); } catch {}
          setTranslated(res);
        }
      } catch {
        /* عند الفشل يبقى النص العربي معروضاً */
      } finally {
        if (!cancelled) setTranslating(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lang, quizId, sourceText]);

  if (lang === "ar" || !quiz) return { quiz, translating: false };

  if (!translated) return { quiz, translating: translating };
  return {
    quiz: {
      ...quiz,
      title: translated.title || quiz.title,
      questions: quiz.questions.map((q, i) => ({
        ...q,
        question: translated.questions?.[i]?.question || q.question,
        options: translated.questions?.[i]?.options || q.options,
        explanation: translated.questions?.[i]?.explanation || q.explanation,
      })),
    },
    translating: false,
  };
}