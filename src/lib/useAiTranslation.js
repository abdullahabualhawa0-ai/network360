import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { getLang } from "./i18n";

/**
 * useAiTranslation — ترجمة محتوى الدرس آلياً عند اختيار لغة غير العربية.
 * - العربية: يُعرض النص الأصلي فوراً (المصدر الأساسي)
 * - EN/HE: يُترجم عبر الذكاء الاصطناعي مرة واحدة لكل درس لكل لغة،
 *   ويُخزَّن في المتصفح (Cache) — فتحات لاحقة فورية بلا تكلفة.
 */

const LANG_NAMES = { en: "English", he: "Hebrew" };
const cacheKeyFor = (lang, key) => `ai-tr-${lang}-${key}`;

export default function useAiTranslation(key, text) {
  const lang = getLang();
  const [translated, setTranslated] = useState(null);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    // العربية = النص الأصلي بلا ترجمة
    if (lang === "ar" || !text) {
      setTranslated(null);
      setTranslating(false);
      return;
    }
    let cancelled = false;
    (async () => {
      // 1) نسخة مترجمة محفوظة مسبقاً؟
      try {
        const cached = localStorage.getItem(cacheKeyFor(lang, key));
        if (cached) { if (!cancelled) setTranslated(cached); return; }
      } catch {}

      // 2) ترجمة آلية مرة واحدة ثم تخزينها
      setTranslating(true);
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt:
            `Translate the following networking lesson from Arabic to ${LANG_NAMES[lang]}.\n` +
            `Rules:\n` +
            `- Keep all Markdown formatting intact (headings, tables, lists, bold, links).\n` +
            `- Keep code blocks and CLI commands EXACTLY as they are — do not translate or modify them.\n` +
            `- Use the standard technical terms in ${LANG_NAMES[lang]}.\n` +
            `- Return ONLY the translated Markdown text, with no commentary.\n\n` +
            text,
        });
        const out = typeof res === "string" ? res : (res?.response || res?.text || "");
        if (out && !cancelled) {
          try { localStorage.setItem(cacheKeyFor(lang, key), out); } catch {}
          setTranslated(out);
        }
      } catch {
        /* عند الفشل يبقى النص العربي معروضاً */
      } finally {
        if (!cancelled) setTranslating(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lang, key, text]);

  return {
    content: lang === "ar" ? text : (translated || text),
    translating: lang !== "ar" && !translated,
  };
}