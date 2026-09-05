import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import StudentRegistration, { AccountStatusScreen, FullSpinner } from "./StudentRegistration";

/**
 * بوابة الحساب — تُطبَّق على كل الصفحات:
 * - المديرون (admin / school_admin) يدخلون مباشرة
 * - الطالب بدون ملف → شاشة التسجيل بالرموز
 * - الطالب pending → شاشة انتظار الموافقة
 * - الطالب rejected/disabled → شاشة حجب
 * - الطالب approved → التطبيق
 */
export default function RegistrationGate({ children }) {
  const { user, isLoadingAuth } = useAuth();
  const [profile, setProfile] = useState(undefined); // undefined = جاري الفحص
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (isLoadingAuth || !user) return;
    if (user.role !== "student") { setProfile(null); return; }
    let cancelled = false;
    setProfile(undefined);
    base44.entities.StudentProfile.filter({ user_id: user.id })
      .then((rows) => { if (!cancelled) setProfile(rows?.[0] || null); })
      .catch(() => { if (!cancelled) setProfile(null); });
    return () => { cancelled = true; };
  }, [user?.id, user?.role, isLoadingAuth, reloadKey]);

  if (isLoadingAuth || !user) return <FullSpinner />;
  if (user.role !== "student") return children;
  if (profile === undefined) return <FullSpinner />;
  if (!profile) return <StudentRegistration onRegistered={() => setReloadKey((k) => k + 1)} />;
  if (profile.status === "approved") return children;
  return <AccountStatusScreen profile={profile} />;
}