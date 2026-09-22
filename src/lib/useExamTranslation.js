import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getLang } from "./i18n";

/**
 * useExamTranslation — ترجمة محتوى امتحان كامل آلياً عند اختيار لغة غير العربية.
 * - العربية: يُعرض الامتحان الأصلي فوراً
 * - EN/HE: يُترجم العنوان + كل سؤال (text, options, answer) عبر AI مرة واحدة،
 *   ويُخزَّن في المتصفح (لكل امتحان × لغة).
 * - الحقول التقنية (type, duration_minutes, status) لا تُترجم.
 */
const LANG_NAMES = { en: "English", he: "Hebrew" };
const cacheKeyFor = (lang, examId) => `ai-exam-tr-${lang}-${examId}`;

export default function useExamTranslation(exam) {
  const lang = getLang();
  const [translated, setTranslated] = useState(null);
  const [translating, setTranslating] = useState(false);

  const examId = exam?.id || "";
  const sourceText = exam ? JSON.stringify({
    title: exam.title,
    questions: (exam.questions || []).map(q => ({
      text: q.text,
      options: q.options,
      answer: q.answer,
    })),
  }) : "";

  useEffect(() => {
    if (lang === "ar" || !exam || !sourceText) {
      setTranslated(null);
      setTranslating(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const cached = localStorage.getItem(cacheKeyFor(lang, examId));
        if (cached) { if (!cancelled) setTranslated(JSON.parse(cached)); return; }
      } catch {}

      setTranslating(true);
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt:
            `Translate the following networking exam from Arabic to ${LANG_NAMES[lang]}.\n` +
            `Rules:\n` +
            `- Translate the title, each question text, ALL option texts, and the correct answer text.\n` +
            `- Keep the same JSON structure and field names.\n` +
            `- Keep the "type" field values (mcq, short, truefalse) EXACTLY as-is — do not translate them.\n` +
            `- For truefalse questions, translate the answer to "${LANG_NAMES[lang] === "English" ? "True/False" : "אמת/שקר"}" accordingly.\n` +
            `- Keep technical terms (MAC, IP, ARP, Router, Switch, VLAN, etc.) in their standard ${LANG_NAMES[lang]} form.\n` +
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
                    text: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    answer: { type: "string" },
                  },
                },
              },
            },
          },
        });
        if (res && !cancelled) {
          try { localStorage.setItem(cacheKeyFor(lang, examId), JSON.stringify(res)); } catch {}
          setTranslated(res);
        }
      } catch {
        /* عند الفشل يبقى النص العربي معروضاً */
      } finally {
        if (!cancelled) setTranslating(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lang, examId, sourceText]);

  if (lang === "ar" || !exam) return { exam, translating: false };

  if (!translated) return { exam, translating };

  const trQuestions = (exam.questions || []).map((q, i) => ({
    ...q,
    text: translated.questions?.[i]?.text || q.text,
    options: translated.questions?.[i]?.options || q.options,
    answer: translated.questions?.[i]?.answer || q.answer,
  }));

  return {
    exam: { ...exam, title: translated.title || exam.title, questions: trQuestions },
    translating: false,
  };
}

/**
 * useExamsListTranslation — ترجمة عناوين الامتحانات دفعة واحدة (لقائمة الامتحانات).
 * - يترجم العنوان فقط (بدون الأسئلة) لتوفير التكلفة.
 * - يُخزَّن كل عنوان في نفس cache key الخاص بالامتحان الكامل (لأن العنوان جزء منه).
 */
export function useExamsListTranslation(exams) {
  const lang = getLang();
  const [titles, setTitles] = useState({});

  useEffect(() => {
    if (lang === "ar" || !exams || exams.length === 0) {
      setTitles({});
      return;
    }
    let cancelled = false;
    (async () => {
      const cached = {};
      const toTranslate = [];
      for (const ex of exams) {
        if (!ex?.id) continue;
        try {
          const c = localStorage.getItem(cacheKeyFor(lang, ex.id));
          if (c) { cached[ex.id] = JSON.parse(c).title; continue; }
        } catch {}
        toTranslate.push(ex);
      }
      if (Object.keys(cached).length > 0 && !cancelled) setTitles(cached);
      if (toTranslate.length === 0) return;

      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt:
            `Translate the following networking exam titles from Arabic to ${LANG_NAMES[lang]}.\n` +
            `Return ONLY a JSON object: { "items": [ { "id": "exam-id", "title": "translated title" }, ... ] }\n` +
            `Keep technical terms in their standard ${LANG_NAMES[lang]} form.\n\n` +
            JSON.stringify({ items: toTranslate.map(e => ({ id: e.id, title: e.title })) }),
          response_json_schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                  },
                },
              },
            },
          },
        });
        if (res && !cancelled) {
          const map = { ...cached };
          for (const item of res.items || []) {
            if (item.id && item.title) {
              map[item.id] = item.title;
              // خزّن العنوان المترجم في cache الامتحان الكامل (جزء title فقط)
              try {
                const existing = localStorage.getItem(cacheKeyFor(lang, item.id));
                if (existing) {
                  const parsed = JSON.parse(existing);
                  parsed.title = item.title;
                  localStorage.setItem(cacheKeyFor(lang, item.id), JSON.stringify(parsed));
                } else {
                  localStorage.setItem(cacheKeyFor(lang, item.id), JSON.stringify({ title: item.title, questions: [] }));
                }
              } catch {}
            }
          }
          setTitles(map);
        }
      } catch {
        /* عند الفشل تبقى العناوين العربية */
      }
    })();
    return () => { cancelled = true; };
  }, [lang, exams?.map(e => e?.id).join(",")]);

  if (lang === "ar") return { titles: {}, translating: false };
  return { titles, translating: Object.keys(titles).length < (exams?.length || 0) };
}