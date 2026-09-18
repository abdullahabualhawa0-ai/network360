import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { t, useDir } from "@/lib/i18n";

/**
 * زر رجوع موحّد — يستخدم history إن وُجد، وإلا fallback للوجهة المحددة.
 * @param {string} fallback - المسار البديل عند عدم وجود history صالح
 */
export default function BackButton({ fallback = "/", label }) {
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

  return (
    <button onClick={handleBack}
      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
      style={{ color: "#2F6690", background: "rgba(47,102,144,0.06)", border: "1px solid rgba(47,102,144,0.2)" }}>
      <Arrow size={13} /> {label || t("back")}
    </button>
  );
}