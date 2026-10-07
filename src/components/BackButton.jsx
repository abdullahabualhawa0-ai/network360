import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { t, useDir } from "@/lib/i18n";

/**
 * زر رجوع موحّد — يستخدم history إن وُجد، وإلا fallback للوجهة المحددة.
 * @param {string} fallback - المسار البديل عند عدم وجود history صالح
 * @param {boolean} compact - نسخة أيقونة فقط (للهيدر على الموبايل). الافتراضي false = السلوك السابق.
 */
export default function BackButton({ fallback = "/", label, compact = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const direction = useDir();
  const isRTL = direction === "rtl";

  const handleBack = () => {
    // إن كان هناك history صالح (ليس صفحة الدخول الأولى) → رجوع
    if (window.history.length > 1 && document.referrer) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };

  // إخفاء الزر إذا كان المستخدم بالفعل في الوجهة البديلة
  if (location.pathname === fallback) return null;

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  if (compact) {
    return (
      <button onClick={handleBack} aria-label={label || t("back")}
        className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 transition-all bg-secondary/[0.06] border border-secondary/20 text-secondary dark:text-primary">
        <Arrow size={18} />
      </button>
    );
  }

  return (
    <button onClick={handleBack}
      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
      style={{ color: "#2F6690", background: "rgba(47,102,144,0.06)", border: "1px solid rgba(47,102,144,0.2)" }}>
      <Arrow size={13} /> {label || t("back")}
    </button>
  );
}