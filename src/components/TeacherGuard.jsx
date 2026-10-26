import { Navigate, Outlet } from "react-router-dom";
import { useTeacherSession } from "@/lib/teacherSession";

/**
 * TeacherGuard — يحمي مسارات الأستاذ (يُستخدم كـ layout route).
 * يسمح بالدخول لجلسة أستاذ صالحة، وإلا يُعيد التوجيه إلى الصفحة الرئيسية
 * (لا إلى صفحة الدخول، حتى لا يُطرد مستخدم مسجّل أثناء التنقل).
 */
export default function TeacherGuard() {
  const session = useTeacherSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}