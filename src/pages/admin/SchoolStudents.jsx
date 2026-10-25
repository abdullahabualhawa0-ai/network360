import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminGet } from "@/lib/adminData";
import StudentsManager from "../../components/admin/StudentsManager";
import { t, useLang, useDir } from "@/lib/i18n";

/**
 * طلاب مدرستي — مشرف المدرسة فقط (role = school_admin)
 * يرى ويدير طلاب مدرسته فقط.
 */
export default function SchoolStudents() {
  const { isLoading, role, school_id } = useAdminAuth();
  useLang();
  const direction = useDir();
  const [school, setSchool] = useState(undefined);

  const isSchoolAdmin = role === "school_admin";

  useEffect(() => {
    if (isLoading || !isSchoolAdmin) { setSchool(null); return; }
    adminGet("School", school_id)
      .then(setSchool)
      .catch(() => setSchool(null));
  }, [isLoading, isSchoolAdmin, school_id]);

  if (isLoading || school === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!isSchoolAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-main" dir={direction}>
        <div className="text-center">
          <AlertTriangle size={36} className="text-destructive mx-auto mb-3" />
          <h2 className="font-black text-lg mb-2 text-foreground">{t("restrictedAccess")}</h2>
          <p className="text-xs text-muted-foreground mb-5">{t("restrictedSchoolAdminOnly")}</p>
          <Link to="/" className="text-xs font-bold text-brand hover:underline">{t("backToHome")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-main" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {school ? (
          <StudentsManager school={school} />
        ) : (
          <div className="rounded-[16px] p-10 text-center bg-card border border-border">
            <AlertTriangle size={36} className="mx-auto mb-3 text-warning" />
            <p className="text-xs text-muted-foreground">
              {t("schoolStudentsNotLinked")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}