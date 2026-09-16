import { PLANS } from "@/lib/plans";
import { Loader2 } from "lucide-react";
import { t, useLang, useDir } from "@/lib/i18n";

/** بطاقتا الخطة الشخصية — شهري 50₪ / سنوي 400₪ */
export default function PersonalPlans({ isStudent, hasProfile, busy, onSelect }) {
  useLang();
  const direction = useDir();
  const plans = [PLANS.personal_monthly, PLANS.personal_annual];
  return (
    <section className="mb-10" dir={direction}>
      <h2 className="font-black text-base mb-1">{t("personalPlanSection")}</h2>
      <p className="text-[11px] text-muted-foreground mb-4">{t("personalPlanDesc")}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {plans.map((p) => (
          <div key={p.id} className="rounded-2xl p-5 bg-card"
            style={{ border: `1px solid ${p.highlight ? "rgba(46,125,91,0.4)" : "hsl(var(--border))"}` }}>
            <div className="text-[11px] font-black mb-2" style={{ color: "#2F6690" }}>{p.period}</div>
            <div className="text-3xl font-black mb-2">{p.price}</div>
            {p.highlight && (
              <div className="mb-3 px-3 py-2 rounded-xl text-xs font-black text-center"
                style={{ background: "rgba(46,125,91,0.1)", border: "1px solid rgba(46,125,91,0.45)", color: "#2E7D5B" }}>
                {p.highlight}
              </div>
            )}
            <ul className="text-[11px] text-muted-foreground space-y-1 mb-4">
              <li>• {t("personalFeature1")}</li>
              <li>• {t("personalFeature2")}</li>
            </ul>
            <button onClick={() => onSelect(p.id)}
              disabled={!isStudent || hasProfile || busy !== null}
              className="w-full py-2.5 rounded-xl text-xs font-black text-white transition-all disabled:opacity-50"
              style={{ background: "#173F5F" }}>
              {busy === p.id ? <Loader2 size={13} className="animate-spin mx-auto" />
                : hasProfile ? t("alreadyHaveAccount")
                : !isStudent ? t("studentsOnly")
                : t("choosePlan")}
            </button>
          </div>
        ))}
      </div>
      {!isStudent && (
        <p className="text-[10px] text-muted-foreground mt-2">{t("personalStudentNote")}</p>
      )}
    </section>
  );
}