import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { Loader2 } from "lucide-react";

/**
 * AdminGuard — يحمي مسارات الإدارة (يُستخدم كـ layout route).
 * يسمح بالدخول لـ:
 *   - المالك (الاونرز) عبر مصادقة Base44 (role = admin)
 *   - مشرف المدرسة عبر جلسة الرمز (schoolAdminSession)
 * يُعيد التوجيه إلى /login (صفحة الطالب) إن لم تتحقق أي مصادقة.
 */
export default function AdminGuard() {
  const { isLoading, role } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={28} className="animate-spin" style={{ color: "#173F5F" }} />
      </div>
    );
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}