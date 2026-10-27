import { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useTeacherSession, teacherApi } from "@/lib/teacherSession";
import { t, useLang, useDir } from "@/lib/i18n";
import BackButton from "@/components/BackButton";
import TeacherClassesList from "@/components/teacher/TeacherClassesList";
import TeacherClassDetailView from "@/components/teacher/TeacherClassDetailView";
import TeacherStudentProfileView from "@/components/teacher/TeacherStudentProfileView";

export default function TeacherStudents() {
  const session = useTeacherSession();
  useLang();
  const direction = useDir();

  const [students, setStudents] = useState([]);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // التنقل الهرمي: الصفوف -> تفاصيل الصف -> ملف وعلامات الطالب
  const [activeClass, setActiveClass] = useState(null);
  const [activeStudent, setActiveStudent] = useState(null);
  const [updatingRetakeId, setUpdatingRetakeId] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      teacherApi("filter", "StudentProfile", { sort: "-created_date", limit: 500 }).catch(() => []),
      teacherApi("filter", "Teacher", {}).catch(() => []),
      teacherApi("filter", "ExamResult", { sort: "-submission_time", limit: 500 }).catch(() => []),
    ])
      .then(([studentRows, teacherRows, resultRows]) => {
        setStudents(studentRows || []);
        if (teacherRows?.[0]) setTeacherProfile(teacherRows[0]);
        setResults(resultRows || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // التحكم بالسماح بإعادة الامتحان
  const handleToggleRetake = async (r) => {
    if (updatingRetakeId) return;
    setUpdatingRetakeId(r.id);
    try {
      const updated = await teacherApi("toggleRetake", "ExamResult", { id: r.id, data: { result_id: r.id } });
      if (updated && updated.id) {
        setResults((prev) => prev.map((item) => (item.id === r.id ? { ...item, ...updated } : item)));
      }
    } catch {
      // استمرار الواجهة
    } finally {
      setUpdatingRetakeId(null);
    }
  };

  // قائمة الصفوف المتاحة للأستاذ
  const availableClasses = Array.from(
    new Set([
      ...(Array.isArray(teacherProfile?.assigned_classes) ? teacherProfile.assigned_classes : []),
      ...(students || []).map((s) => s.class_name?.trim()).filter(Boolean),
    ])
  ).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={30} className="animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-main" dir={direction}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <BackButton fallback="/teacher/dashboard" />
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold border border-border text-brand hover:bg-accent transition-colors"
            title={t("refresh")}
          >
            <RefreshCw size={12} />
            <span>{t("refresh")}</span>
          </button>
        </div>

        {/* المستوى الثالث: صفحة ملف الطالب وعلاماته */}
        {activeStudent ? (
          <TeacherStudentProfileView
            student={activeStudent}
            results={results}
            onBack={() => setActiveStudent(null)}
            onToggleRetake={handleToggleRetake}
            updatingRetakeId={updatingRetakeId}
          />
        ) : activeClass !== null ? (
          /* المستوى الثاني: داخل الصف المحدد — إحصائيات التقدم والعلامات وقائمة الطلاب */
          <TeacherClassDetailView
            className={activeClass}
            students={students}
            results={results}
            onBack={() => {
              setActiveClass(null);
              setActiveStudent(null);
            }}
            onSelectStudent={(s) => setActiveStudent(s)}
          />
        ) : (
          /* المستوى الأول: صفحة الصفوف فقط — لا طلاب في الصفحة الرئيسية */
          <TeacherClassesList
            classes={availableClasses}
            students={students}
            results={results}
            assignedClasses={teacherProfile?.assigned_classes || []}
            onSelectClass={(cls) => setActiveClass(cls)}
          />
        )}
      </div>
    </div>
  );
}