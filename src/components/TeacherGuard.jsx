import { Navigate, Outlet } from "react-router-dom";
import { useTeacherSession } from "@/lib/teacherSession";

/**
 * TeacherGuard — يحمي مسارات الأستاذ (يُستخدم كـ layout route).
 * يسمح بالدخول فقط لجلسة أستاذ صالحة، وإلا يُعيد التوجيه إلى /student-login.
 */
export default function TeacherGuard() {
  const session = useTeacherSession();

  if (!session) {
    return <Navigate to="/student-login" replace />;
  }

  return <Outlet />;
}