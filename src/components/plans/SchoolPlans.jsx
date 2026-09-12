import { PLANS, SCHOOL_TIERS } from "@/lib/plans";
import { Loader2, School as SchoolIcon } from "lucide-react";
import { t, useLang } from "@/lib/i18n";

/** الخطة المدرسية — حسب عدد الطلاب: 50 / 100 / 200 / أكثر من 200 */
export default function SchoolPlans({ busy, form, setForm, onSelect }) {
  useLang();
  return (
    <section>
      <h2 className="font-black text-base mb-1 flex items-center gap-2">
        <SchoolIcon size={16} style={{ color: "#a78bfa" }} /> {t("schoolPlanSection")}
      </h2>
      <p className="text-[11px] text-muted-foreground mb-4">{t("schoolPlanDesc")}</p>

      <div className="rounded-2xl p-4 mb-4 grid sm:grid-cols-2 gap-3 bg-card"
        style={{ border: "1px solid rgba(139,92,246,0.3)" }}>
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground mb-1">اسم المدرسة *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            dir="rtl" className="w-full px-3 py-2 rounded-xl text-xs bg-transparent focus:outline-none"
            style={{ border: "1px solid hsl(var(--border))" }} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-muted-foreground mb-1">بريد مشرف المدرسة *</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            dir="ltr" className="w-full px-3 py-2 rounded-xl text-xs bg-transparent focus:outline-none"
            style={{ border: "1px solid hsl(var(--border))" }} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {SCHOOL_TIERS.map((id) => {
          const p = PLANS[id];
          return (
            <div key={id} className="rounded-2xl p-5 bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
              <div className="text-[11px] font-black mb-2" style={{ color: "#a78bfa" }}>{p.label}</div>
              <div className="text-2xl font-black mb-1">{p.price}</div>
              <div className="text-[11px] text-muted-foreground mb-4">{t("studentLimitLabel")}: {p.student_limit} طالب</div>
              <button onClick={() => onSelect(id)} disabled={busy !== null}
                className="w-full py-2.5 rounded-xl text-xs font-black text-white transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(90deg,#7c3aed,#0891b2)" }}>
                {busy === id ? <Loader2 size={13} className="animate-spin mx-auto" /> : "اختيار هذه الخطة"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}