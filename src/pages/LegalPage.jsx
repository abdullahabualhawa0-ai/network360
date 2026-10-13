import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { t, useLang, useDir, getLang } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LEGAL, LEGAL_UPDATED } from "@/lib/legalContent";

/**
 * LegalPage — صفحات عامة (بدون تسجيل دخول): سياسة الخصوصية / شروط الاستخدام / حذف الحساب.
 * مطلوبة لمتاجر التطبيقات (رابط سياسة الخصوصية، ورابط ويب لطلب حذف الحساب).
 * بريد التواصل يُقرأ من إعداد النظام contact_email.
 */
export default function LegalPage({ kind }) {
  useLang();
  const direction = useDir();
  const navigate = useNavigate();
  const lang = getLang();
  const doc = (LEGAL[kind] || LEGAL.privacy)[lang] || (LEGAL[kind] || LEGAL.privacy).ar;
  const [email, setEmail] = useState(null);

  useEffect(() => {
    let cancelled = false;
    base44.entities.SystemSetting.filter({ key: "contact_email" })
      .then((rows) => { if (!cancelled) setEmail(rows?.[0]?.value || null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const prev = document.title;
    document.title = `${doc.title} — ${t("appName")}`;
    return () => { document.title = prev; };
  }, [doc.title]);

  const BackIcon = direction === "rtl" ? ArrowRight : ArrowLeft;
  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/login", { replace: true }));

  const links = [
    { to: "/privacy", label: t("legalPrivacy"), k: "privacy" },
    { to: "/terms", label: t("legalTerms"), k: "terms" },
    { to: "/account-deletion", label: t("legalDeletion"), k: "deletion" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between gap-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}>
        <button onClick={goBack} aria-label={t("legalBack")}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-border text-primary">
          <BackIcon size={18} />
        </button>
        <LanguageSwitcher compact />
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-black text-primary mb-1">{doc.title}</h1>
        <p className="text-[11px] text-muted-foreground mb-5">{t("legalLastUpdated")}: {LEGAL_UPDATED}</p>
        <p className="text-sm leading-relaxed text-foreground/80 mb-6">{doc.intro}</p>

        <div className="space-y-6">
          {doc.sections.map((sec, i) => (
            <section key={i}>
              <h2 className="text-base font-black text-primary mb-2">{sec.h}</h2>
              {(sec.p || []).map((para, j) => (
                <p key={j} className="text-sm leading-relaxed text-foreground/80 mb-2">{para}</p>
              ))}
              {sec.list && (
                <ul className="list-disc ps-5 space-y-1.5 text-sm leading-relaxed text-foreground/80">
                  {sec.list.map((li, j) => <li key={j}>{li}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-2xl p-4 border border-border bg-card flex items-center gap-3">
          <Mail size={18} className="text-secondary dark:text-primary flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-muted-foreground">{t("legalContactUs")}</div>
            {email
              ? <a href={`mailto:${email}`} dir="ltr" className="text-sm font-bold text-primary break-all">{email}</a>
              : <span className="text-sm text-muted-foreground">—</span>}
          </div>
        </div>

        <nav className="mt-8 pt-4 border-t border-border flex items-center justify-center gap-x-5 gap-y-2 flex-wrap text-xs">
          {links.map((l) => (
            <Link key={l.k} to={l.to}
              className={l.k === kind ? "font-black text-primary" : "text-muted-foreground hover:text-primary"}>
              {l.label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
