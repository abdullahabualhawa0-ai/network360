import { Navigate } from "react-router-dom";

export default function TeacherResults() {
  // توجيه تلقائي إلى صفحة الصفوف والطلاب الموحدة التي تضم التقدم والعلامات
  return <Navigate to="/teacher/students" replace />;
}