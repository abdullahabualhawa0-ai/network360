/**
 * useAdminAuth — Hook موحد لمصادقة الإدارة
 * يجمع بين:
 *   - مصادقة Base44 (المالك/الاونرز — role = admin)
 *   - جلسة مشرف المدرسة (schoolAdminSession — role = school_admin)
 * يعيد كائناً موحداً: { isLoading, role, school_id, user, session }
 */
import { useAuth } from "@/lib/AuthContext";
import { useSchoolAdminSession } from "@/lib/schoolAdminSession";

export function useAdminAuth() {
  const { user, isLoadingAuth } = useAuth();
  const schoolAdminSession = useSchoolAdminSession();

  if (isLoadingAuth) {
    return { isLoading: true, role: null, school_id: null, user: null, session: null };
  }

  // المالك (الاونرز) — مصادقة Base44
  if (user?.role === "admin") {
    return { isLoading: false, role: "admin", school_id: null, user, session: null };
  }

  // مشرف المدرسة عبر Base44 (نظام قديم — يدعم الحسابات الموجودة)
  if (user?.role === "school_admin") {
    return { isLoading: false, role: "school_admin", school_id: user.school_id || user.data?.school_id, user, session: null };
  }

  // مشرف المدرسة عبر رمز (نظام جديد)
  if (schoolAdminSession) {
    return { isLoading: false, role: "school_admin", school_id: schoolAdminSession.school_id, user: null, session: schoolAdminSession };
  }

  return { isLoading: false, role: null, school_id: null, user: null, session: null };
}