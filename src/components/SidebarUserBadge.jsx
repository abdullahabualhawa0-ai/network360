import { GraduationCap, UserCog, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useStudentSession } from "@/lib/studentSession";
import { useTeacherSession } from "@/lib/teacherSession";
import { useSchoolAdminSession } from "@/lib/schoolAdminSession";
import { t } from "@/lib/i18n";

/**
 * SidebarUserBadge — يعرض اسم المستخدم ورمزه بجانب أيقونة التطبيق
 * يحدد الدور النشط تلقائياً: مشرف مدرسة / أستاذ / طالب / مالك المنصة
 */
export default function SidebarUserBadge({ compact = false }) {
  const { user } = useAuth();
  const studentSession = useStudentSession();
  const teacherSession = useTeacherSession();
  const schoolAdminSession = useSchoolAdminSession();

  // تحديد الدور النشط حسب الأولوية
  let info = null;

  if (schoolAdminSession) {
    info = {
      icon: <ShieldCheck size={13} />,
      roleLabel: t("roleSchoolAdmin"),
      name: schoolAdminSession.admin_name || schoolAdminSession.school_name || "",
      code: schoolAdminSession.admin_code || "",
      codeLabel: t("adminCode"),
    };
  } else if (teacherSession) {
    info = {
      icon: <UserCog size={13} />,
      roleLabel: t("roleTeacher"),
      name: teacherSession.teacher_name || "",
      code: teacherSession.teacher_code || "",
      codeLabel: t("teacherCode"),
    };
  } else if (studentSession) {
    info = {
      icon: <GraduationCap size={13} />,
      roleLabel: t("roleStudent"),
      name: studentSession.student_name || "",
      code: studentSession.student_code || "",
      codeLabel: t("studentCode"),
    };
  } else if (user?.role === "school_admin") {
    info = {
      icon: <ShieldCheck size={13} />,
      roleLabel: t("roleSchoolAdmin"),
      name: user.full_name || "",
      code: "",
      codeLabel: "",
    };
  } else if (user?.role === "admin") {
    info = {
      icon: <ShieldCheck size={13} />,
      roleLabel: t("roleOwner"),
      name: user.full_name || "",
      code: "",
      codeLabel: "",
    };
  }

  if (!info) return null;

  if (compact) {
    return (
      <div className="rounded-lg px-2 py-1 flex items-center gap-1.5 min-w-0"
        style={{ background: "rgba(47,102,144,0.06)", border: "1px solid rgba(47,102,144,0.15)" }}>
        <div className="flex-shrink-0" style={{ color: "#173F5F" }}>{info.icon}</div>
        <div className="min-w-0">
          <div className="text-[10px] font-black text-foreground truncate leading-tight">{info.name || "—"}</div>
          {info.code && (
            <div className="text-[9px] text-muted-foreground truncate leading-tight" dir="ltr">
              <span className="font-bold" style={{ color: "#2F6690" }}>{info.code}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl p-2.5 flex items-center gap-2.5"
      style={{ background: "rgba(47,102,144,0.06)", border: "1px solid rgba(47,102,144,0.15)" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "#173F5F", color: "#fff" }}>
        {info.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold text-muted-foreground leading-tight">{info.roleLabel}</div>
        <div className="text-xs font-black text-foreground truncate leading-tight">{info.name || "—"}</div>
        {info.code && (
          <div className="text-[10px] text-muted-foreground truncate leading-tight" dir="ltr">
            {info.codeLabel}: <span className="font-bold" style={{ color: "#2F6690" }}>{info.code}</span>
          </div>
        )}
      </div>
    </div>
  );
}