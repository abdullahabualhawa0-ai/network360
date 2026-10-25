import { PLANS } from "@/lib/plans";
import { Loader2 } from "lucide-react";
import { t, useLang, useDir } from "@/lib/i18n";

/** بطاقتا الخطة الشخصية — شهري 50₪ / سنوي 400₪ */
export default function PersonalPlans({ isStudent, busy, onSelect }) {
  useLang();
  const direction = useDir();
  const plans = [PLANS.personal_monthly, PLANS.personal_annual];
  return (
    <section className="mb-10 font-main text-foreground" dir={direction}>
      <h2 className="font-black text-base mb-1 text-foreground">{t("personalPlanSection")}</h2>
      <p className="text-[11px] text-muted-foreground mb-4">{t("personalPlanDesc")}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`rounded-[16px] p-5 bg-card border ${
              p.highlight ? "border-success/40" : "border-border"
            }`}
          >
            <div className="text-[11px] font-black mb-2 text-brand">{p.period}</div>
            <div className="text-3xl font-black mb-2 text-foreground">{p.price}</div>
            {p.highlight && (
              <div className="mb-3 px-3 py-2 rounded-[10px] text-xs font-black text-center bg-success/10 border border-success/40 text-success">
                {p.highlight}
              </div>
            )}
            <ul className="text-[11px] text-muted-foreground space-y-1 mb-4">
              <li>• {t("personalFeature1")}</li>
              <li>• {t("personalFeature2")}</li>
            </ul>
            <button
              onClick={() => onSelect(p.id)}
              disabled={!isStudent || busy !== null}
              className="w-full min-h-[44px] py-2.5 rounded-[10px] text-xs font-black bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {busy === p.id ? <Loader2 size={13} className="animate-spin mx-auto" />
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