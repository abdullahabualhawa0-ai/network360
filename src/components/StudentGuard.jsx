import { Outlet, Navigate } from "react-router-dom";
import { useStudentSession } from "@/lib/studentSession";
import { useAuth } from "@/lib/AuthContext";

/**
 * StudentGuard — يحرس مسارات الطالب عبر جلسة الطالب (localStorage).
 * لا يستخدم Base44 Authentication للطالب.
 * المديرون (Base44 auth) يُسمح لهم بالمرور أيضًا لمراجعة الدروس.
 */
export default function StudentGuard() {
  const session = useStudentSession();
  const { isAuthenticated, user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#F7F9FC" }}>
        <div className="w-8 h-8 rounded-full animate-spin"
          style={{ border: "3px solid rgba(47,102,144,0.2)", borderTopColor: "#173F5F" }} />
      </div>
    );
  }

  // طالب بجلسة صالحة
  if (session) return <Outlet />;

  // المالك (Owner) ومشرف المدرسة (school_admin) عبر Base44 — يُسمح لهم بمراجعة الدروس
  if (isAuthenticated && (user?.role === "admin" || user?.role === "school_admin")) {
    return <Outlet />;
  }

  // لا جلسة ولا مدير → صفحة دخول الطالب
  return <Navigate to="/student-login" replace />;
}