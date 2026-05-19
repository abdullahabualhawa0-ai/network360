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
import NetworkSimulator from './pages/NetworkSimulator';
import Dashboard from './pages/Dashboard';
import AgentsPage from './pages/AgentsPage';
import AdminStudentsReport from './pages/AdminStudentsReport';
import ScenarioLab from './pages/ScenarioLab';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
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
    <Routes>
      <Route element={<><ScrollToTop /><Layout /></>}>
        <Route path="/" element={<Home />} />
        <Route path="/topic/:sectionId/:topicId" element={<TopicPage />} />
        <Route path="/network-simulator" element={<NetworkSimulator />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/admin/students" element={<AdminStudentsReport />} />
        <Route path="/scenario-lab" element={<ScenarioLab />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
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