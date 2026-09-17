import { t, useLang, useDir, setLang, getLang } from "@/lib/i18n";
import { Globe } from "lucide-react";

/**
 * زر تغيير اللغة — مكوّن مركزي قابل لإعادة الاستخدام في أي صفحة.
 * يطبق RTL/LTR فوراً ويحفظ التفضيل محلياً.
 */
export default function LanguageSwitcher({ compact = false }) {
  useLang();
  const direction = useDir();
  const current = getLang();

  const langs = [
    { id: "ar", label: t("langArabic"), short: "ع" },
    { id: "en", label: t("langEnglish"), short: "EN" },
    { id: "he", label: t("langHebrew"), short: "ע" },
  ];

  return (
    <div className="flex items-center gap-1" dir="ltr">
      <Globe size={14} className="text-muted-foreground" />
      {langs.map((l) => {
        const active = current === l.id;
        return (
          <button key={l.id} onClick={() => setLang(l.id)}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
            style={{
              background: active ? "#173F5F" : "transparent",
              color: active ? "#fff" : "hsl(var(--muted-foreground))",
              border: `1px solid ${active ? "#173F5F" : "hsl(var(--border))"}`,
            }}
            title={l.label}>
            {compact ? l.short : l.label}
          </button>
        );
      })}
    </div>
  );
}