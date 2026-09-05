import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import StudentsManager from "../../components/admin/StudentsManager";

/**
 * طلاب مدرستي — مشرف المدرسة فقط (role = school_admin)
 * يرى ويدير طلاب مدرسته فقط (مفروض عبر RLS على مستوى قاعدة البيانات).
 */
export default function SchoolStudents() {
  const { user, isLoadingAuth } = useAuth();
  const [school, setSchool] = useState(undefined); // undefined = جاري التحميل

  const isSchoolAdmin = user?.role === "school_admin";

  useEffect(() => {
    if (isLoadingAuth || !isSchoolAdmin) { setSchool(null); return; }
    base44.entities.School.get(user.school_id)
      .then(setSchool)
      .catch(() => setSchool(null));
  }, [isLoadingAuth, isSchoolAdmin, user?.school_id]);

  if (isLoadingAuth || school === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full animate-spin"
          style={{ border: "3px solid rgba(6,182,212,0.2)", borderTopColor: "#06b6d4" }} />
      </div>
    );
  }

  if (!isSchoolAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <div className="text-center">
          <AlertTriangle size={36} className="text-red-400 mx-auto mb-3" />
          <h2 className="font-black text-lg mb-2">وصول مقيّد</h2>
          <p className="text-xs text-muted-foreground mb-5">هذه الصفحة لمشرفي المدارس فقط.</p>
          <Link to="/" className="text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {school ? (
          <StudentsManager school={school} />
        ) : (
          <div className="rounded-2xl p-10 text-center bg-card" style={{ border: "1px solid hsl(var(--border))" }}>
            <AlertTriangle size={36} className="mx-auto mb-3 text-amber-400" />
            <p className="text-xs text-muted-foreground">
              لم يتم ربطك بمدرسة بعد — اطلب من المدير العام تعيينك مشرفاً لمدرستك
            </p>
          </div>
        )}
      </div>
    </div>
  );
}