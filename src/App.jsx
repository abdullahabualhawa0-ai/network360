import { Toaster } from "@/components/ui/toaster"
import { useRef, lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminGuard from '@/components/AdminGuard';
import ScrollToTop from './components/ScrollToTop';
import PageLoader from './components/PageLoader';
import StudentGuard from '@/components/StudentGuard';
import TeacherGuard from '@/components/TeacherGuard';

// ── تحميل الصفحات عند الحاجة فقط (Code Splitting) لتقليل حجم التحميل الأولي ──
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Home = lazy(() => import('./pages/Home'));
const TopicPage = lazy(() => import('./pages/TopicPage'));
const NetworkSimulator = lazy(() => import('./pages/NetworkSimulator.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminStudentsReport = lazy(() => import('./pages/AdminStudentsReport'));
const ScenarioLab = lazy(() => import('./pages/ScenarioLab.jsx'));
const LabHistory = lazy(() => import('./pages/LabHistory.jsx'));
const Exams = lazy(() => import('./pages/Exams.jsx'));
const TakeExam = lazy(() => import('./pages/TakeExam.jsx'));
const ExamResults = lazy(() => import('./pages/admin/ExamResults.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const SchoolsManager = lazy(() => import('./pages/admin/SchoolsManager.jsx'));
const SchoolStudents = lazy(() => import('./pages/admin/SchoolStudents.jsx'));
const StudentLogin = lazy(() => import('./pages/StudentLogin'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const TeacherExams = lazy(() => import('./pages/TeacherExams'));
const TeacherStudents = lazy(() => import('./pages/TeacherStudents'));
const TeacherResults = lazy(() => import('./pages/TeacherResults'));
const Plans = lazy(() => import('./pages/Plans.jsx'));
const ExamManager = lazy(() => import('./pages/admin/ExamManager'));
const TeachersManager = lazy(() => import('./pages/admin/TeachersManager'));
const RegistrationRequests = lazy(() => import('./pages/admin/RegistrationRequests'));
const PageNotFound = lazy(() => import('./lib/PageNotFound'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const location = useLocation();

  // Navigation direction tracking for push/pop slide transitions
  const historyStack = useRef([location.pathname]);
  const lastDir = useRef(1);
  const idx = historyStack.current.lastIndexOf(location.pathname);
  let navDir;
  if (idx === -1) {
    historyStack.current.push(location.pathname);
    navDir = 1;
  } else if (idx < historyStack.current.length - 1) {
    historyStack.current = historyStack.current.slice(0, idx + 1);
    navDir = -1;
  } else {
    navDir = lastDir.current;
  }
  lastDir.current = navDir;

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return <PageLoader fullScreen />;
  }

  // Render the main app — all app routes are gated by ProtectedRoute;
  // unauthenticated users are sent to /login
  return (
    <>
    <ScrollToTop />
    <AnimatePresence mode="wait" custom={navDir}>
      <motion.div
        key={location.pathname}
        custom={navDir}
        initial={(d) => ({ opacity: 0, x: 32 * d })}
        animate={{ opacity: 1, x: 0 }}
        exit={(d) => ({ opacity: 0, x: -32 * d })}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
      <Suspense fallback={<PageLoader fullScreen />}>
      <Routes location={location}>
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
          <Route path="/admin/settings" element={<Settings />} />
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
        <Route element={<Layout />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/exams" element={<TeacherExams />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/results" element={<TeacherResults />} />
          <Route path="/teacher/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
      </Routes>
      </Suspense>
      </motion.div>
    </AnimatePresence>
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