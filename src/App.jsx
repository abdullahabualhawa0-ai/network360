import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminGuard from '@/components/AdminGuard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import TopicPage from './pages/TopicPage';
import NetworkSimulator from './pages/NetworkSimulator.jsx';
import Dashboard from './pages/Dashboard';
import AdminStudentsReport from './pages/AdminStudentsReport';
import ScenarioLab from './pages/ScenarioLab.jsx';
import LabHistory from './pages/LabHistory.jsx';
import Exams from './pages/Exams.jsx';
import TakeExam from './pages/TakeExam.jsx';
import ExamResults from './pages/admin/ExamResults.jsx';
import Settings from './pages/Settings.jsx';
import SchoolsManager from './pages/admin/SchoolsManager.jsx';
import SchoolStudents from './pages/admin/SchoolStudents.jsx';
import StudentGuard from '@/components/StudentGuard';
import StudentLogin from './pages/StudentLogin';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherExams from './pages/TeacherExams';
import TeacherGuard from '@/components/TeacherGuard';
import Plans from './pages/Plans.jsx';
import ExamManager from './pages/admin/ExamManager';
import TeachersManager from './pages/admin/TeachersManager';
import RegistrationRequests from './pages/admin/RegistrationRequests';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#F7F9FC" }}>
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "3px solid rgba(47,102,144,0.2)", borderTopColor: "#173F5F" }} />
      </div>
    );
  }

  // Render the main app — all app routes are gated by ProtectedRoute;
  // unauthenticated users are sent to /login
  return (
    <>
    <ScrollToTop />
    <Routes>
      {/* دخول الطالب — الرموز فقط، لا Base44 Authentication — الصفحة الرئيسية للدخول */}
      <Route path="/login" element={<StudentLogin />} />
      <Route path="/student-login" element={<StudentLogin />} />

      {/* صفحات المصادقة للإدارة (Base44) — منفصلة عن دخول الطالب */}
      <Route path="/admin-login" element={<Login />} />
      <Route path="/admin-register" element={<Register />} />
      <Route path="/admin-forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* صفحة الخطط — متاحة بدون تسجيل دخول */}
      <Route path="/plans" element={<Plans />} />

      {/* مسارات الإدارة — المالك (Base44) أو مشرف المدرسة (جلسة الرمز) */}
      <Route element={<AdminGuard />}>
        <Route element={<Layout />}>
          <Route path="/admin/schools" element={<SchoolsManager />} />
          <Route path="/admin/school-students" element={<SchoolStudents />} />
          <Route path="/admin/students" element={<AdminStudentsReport />} />
          <Route path="/admin/exams" element={<ExamManager />} />
          <Route path="/admin/exam-results" element={<ExamResults />} />
          <Route path="/admin/registration-requests" element={<RegistrationRequests />} />
          <Route path="/admin/teachers" element={<TeachersManager />} />
        </Route>
      </Route>

      {/* مسارات الطالب — جلسة الطالب (StudentGuard)، بدون Base44 Authentication */}
      <Route element={<StudentGuard />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/topic/:sectionId/:topicId" element={<TopicPage />} />
          <Route path="/network-simulator" element={<NetworkSimulator />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scenario-lab" element={<ScenarioLab />} />
          <Route path="/lab-history" element={<LabHistory />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/exams/:examId" element={<TakeExam />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* مسارات الأستاذ — جلسة الأستاذ (TeacherGuard)، بدون Base44 Authentication */}
      <Route element={<TeacherGuard />}>
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/exams" element={<TeacherExams />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App