/**
 * plans.js — خطط الاشتراك وحدود الطلاب
 * الخطة الشخصية: 50₪ شهريًا / 400₪ سنويًا (طالب واحد)
 * الخطة المدرسية: حسب عدد الطلاب (50/100/200/أكثر من 200)
 */
export const PLANS = {
  personal_monthly: {
    id: "personal_monthly",
    personal: true,
    student_limit: 1,
    label: "الخطة الشخصية — شهريًا",
    period: "شهريًا",
    price: "50 ₪ / شهر",
  },
  personal_annual: {
    id: "personal_annual",
    personal: true,
    student_limit: 1,
    label: "الخطة الشخصية — سنويًا",
    period: "سنويًا",
    price: "400 ₪ / سنة",
    highlight: "ادفع 8 أشهر وباقي السنة مجانًا",
  },
  school_50: { id: "school_50", student_limit: 50, label: "حتى 50 طالب", price: "4,000 ₪ سنويًا" },
  school_100: { id: "school_100", student_limit: 100, label: "حتى 100 طالب", price: "6,000 ₪ سنويًا" },
  school_200: { id: "school_200", student_limit: 200, label: "حتى 200 طالب", price: "9,000 ₪ سنويًا" },
  school_max: { id: "school_max", student_limit: 500, label: "أكثر من 200 طالب", price: "10,000 ₪ سنويًا" },
};

export const SCHOOL_TIERS = ["school_50", "school_100", "school_200", "school_max"];

export const STUDENT_LIMIT_MSG =
  "لقد وصلت المدرسة إلى الحد الأقصى لعدد الطلاب في خطتك الحالية. يرجى ترقية الخطة لإضافة طلاب جدد.";

/** توليد رمز فريد (يُفحص ضد قاعدة البيانات في المستدعي) */
export function randomCode(prefix = "SCH") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}${s}`;
}

export function planLabel(planId) {
  return PLANS[planId]?.label || planId || "—";
}