import { PLANS, SCHOOL_TIERS } from "@/lib/plans";
import { Loader2, School as SchoolIcon } from "lucide-react";
import { t, useLang, useDir } from "@/lib/i18n";

/** الخطة المدرسية — حسب عدد الطلاب: 50 / 100 / 200 / أكثر من 200 */
export default function SchoolPlans({ busy, form, setForm, onSelect }) {
  useLang();
  const direction = useDir();
  return (
    <section dir={direction} className="font-main text-foreground">
      <h2 className="font-black text-base mb-1 flex items-center gap-2 text-foreground">
        <SchoolIcon size={16} className="text-brand" /> {t("schoolPlanSection")}
      </h2>
      <p className="text-[11px] text-muted-foreground mb-4">{t("schoolPlanDesc")}</p>

      <div className="rounded-[16px] p-4 mb-4 grid sm:grid-cols-2 gap-3 bg-card border border-border">
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("schoolNameLabel")} *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            dir={direction}
            className="w-full px-3 py-2 rounded-[10px] text-xs bg-background border border-input focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground mb-1">{t("schoolAdminEmailLabel")} *</label>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            dir="ltr"
            className="w-full px-3 py-2 rounded-[10px] text-xs bg-background border border-input focus:outline-none"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {SCHOOL_TIERS.map((id) => {
          const p = PLANS[id];
          return (
            <div key={id} className="rounded-[16px] p-5 bg-card border border-border">
              <div className="text-[11px] font-black mb-2 text-brand">{p.label}</div>
              <div className="text-2xl font-black mb-1 text-foreground">{p.price}</div>
              <div className="text-[11px] text-muted-foreground mb-4">{t("studentLimitLabel")}: {p.student_limit} {t("studentsCountSuffix")}</div>
              <button
                onClick={() => onSelect(id)}
                disabled={busy !== null}
                className="w-full min-h-[44px] py-2.5 rounded-[10px] text-xs font-black bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {busy === id ? <Loader2 size={13} className="animate-spin mx-auto" /> : t("choosePlan")}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}