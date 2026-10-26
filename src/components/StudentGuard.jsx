import { Outlet, Navigate } from "react-router-dom";
import { useStudentSession } from "@/lib/studentSession";
import { useTeacherSession } from "@/lib/teacherSession";
import { useAuth } from "@/lib/AuthContext";
import PageLoader from "@/components/PageLoader";

/**
 * StudentGuard — يحرس مسارات الطالب عبر جلسة الطالب (localStorage).
 * لا يستخدم Base44 Authentication للطالب.
 * المديرون (Base44 auth) يُسمح لهم بالمرور أيضًا لمراجعة الدروس.
 */
export default function StudentGuard() {
  const session = useStudentSession();
  const teacherSession = useTeacherSession();
  const { isAuthenticated, user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <PageLoader fullScreen />;
  }

  // طالب بجلسة صالحة
  if (session) return <Outlet />;

  // الأستاذ بجلسة صالحة — يطّلع على الدروس والمحاكي ومختبر السيناريوهات
  if (teacherSession) return <Outlet />;

  // المالك (Owner) ومشرف المدرسة (school_admin) عبر Base44 — يُسمح لهم بمراجعة الدروس
  if (isAuthenticated && (user?.role === "admin" || user?.role === "school_admin")) {
    return <Outlet />;
  }

  // لا جلسة ولا مدير → صفحة دخول الطالب
  return <Navigate to="/student-login" replace />;
}