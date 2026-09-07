import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
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
import RegistrationGate from './components/RegistrationGate';
import Plans from './pages/Plans.jsx';
import ExamManager from './pages/admin/ExamManager';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#020617" }}>
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "3px solid rgba(6,182,212,0.2)", borderTopColor: "#06b6d4" }} />
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route path="/plans" element={<Plans />} />
      <Route element={<RegistrationGate><Layout /></RegistrationGate>}>
        <Route path="/" element={<Home />} />
        <Route path="/topic/:sectionId/:topicId" element={<TopicPage />} />
        <Route path="/network-simulator" element={<NetworkSimulator />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/students" element={<AdminStudentsReport />} />
        <Route path="/admin/exams" element={<ExamManager />} />
        <Route path="/scenario-lab" element={<ScenarioLab />} />
        <Route path="/lab-history" element={<LabHistory />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/exams/:examId" element={<TakeExam />} />
        <Route path="/admin/exam-results" element={<ExamResults />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin/schools" element={<SchoolsManager />} />
        <Route path="/admin/school-students" element={<SchoolStudents />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
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